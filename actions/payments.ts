"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { LeadStatus, PaymentStatus, PaymentType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { assertAdminSecret } from "@/lib/auth";
import { createDepositCheckoutSession } from "@/lib/checkout";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { addHours, PHONE_PAYMENT_EXPIRY_HOURS } from "@/lib/dates";
import { sendPaymentLinkEmail } from "@/lib/emails";
import { packageLabel } from "@/lib/labels";
import { sendMetaInitiateCheckoutEvent } from "@/lib/meta-capi";
import {
  assertPackageHasCapacity,
  PackagePoolFullError,
} from "@/lib/packages";
import { isPaymentExpired } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { generatePaymentToken } from "@/lib/tokens";

export type DepositPaymentResult = {
  status: "success" | "error";
  paymentId?: string;
  payUrl?: string;
  message?: string;
};

export type StartDepositCheckoutState = {
  status: "idle" | "success" | "error";
  url?: string;
  message?: string;
  /** Wspólny identyfikator zdarzenia InitiateCheckout (dedup Pixel <-> CAPI). */
  eventId?: string;
};

export type GeneratePaymentState = {
  status: "idle" | "success" | "error";
  payUrl?: string;
  message?: string;
};

export type RenewPaymentLinkState = {
  status: "idle" | "success" | "error";
  payUrl?: string;
  message?: string;
};

class RenewPaymentError extends Error {
  constructor(
    public readonly code:
      | "GROUP_FULL"
      | "NO_GROUP"
      | "INVALID_STATUS"
      | "NOT_FOUND"
      | "PACKAGE_POOL_FULL",
  ) {
    super(code);
    this.name = "RenewPaymentError";
  }
}

function mapRenewPaymentError(code: RenewPaymentError["code"]): string {
  switch (code) {
    case "GROUP_FULL":
      return "Brak miejsc w grupie. Nie można odnowić wygasłej rezerwacji.";
    case "NO_GROUP":
      return "Brak przypisanej grupy - przypisz grupę przed odnowieniem linku.";
    case "INVALID_STATUS":
      return "Nie można odnowić linku w tym statusie rezerwacji.";
    case "NOT_FOUND":
      return "Nie znaleziono zgłoszenia.";
    case "PACKAGE_POOL_FULL":
      return "Brak wolnych miejsc na wybranym poziomie. Nie można przywrócić rezerwacji.";
    default:
      return "Wystąpił błąd podczas odnowienia linku płatności.";
  }
}

async function upsertRenewalPayment(
  tx: Prisma.TransactionClient,
  leadId: string,
  payments: Array<{ id: string; status: PaymentStatus }>,
  activePaymentId: string | null,
  expiresAt: Date,
): Promise<string> {
  const existingPayment =
    (activePaymentId
      ? payments.find((payment) => payment.id === activePaymentId)
      : undefined) ?? payments[0];

  if (existingPayment && existingPayment.status !== PaymentStatus.PAID) {
    await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: PaymentStatus.PENDING,
        expiresAt,
        stripeSessionId: null,
        stripeSessionUrl: null,
      },
    });

    return existingPayment.id;
  }

  const token = generatePaymentToken();
  const created = await tx.payment.create({
    data: {
      token,
      leadId,
      type: PaymentType.DEPOSIT,
      amount: DEPOSIT_AMOUNT_GROSZE,
      expiresAt,
    },
  });

  return created.id;
}

async function compensateRestoredReservation(
  leadId: string,
  paymentId: string,
  groupId: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.EXPIRED },
    });

    if (groupId) {
      const group = await tx.group.findUnique({
        where: { id: groupId },
      });

      if (group && group.currentCount > 0) {
        await tx.group.update({
          where: { id: groupId },
          data: { currentCount: { decrement: 1 } },
        });
      }
    }

    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: LeadStatus.CANCELLED,
        groupId: null,
        activePaymentId: null,
      },
    });
  });
}

export async function createDepositPaymentForLead(
  leadId: string,
  expiresAt: Date,
  options?: { skipCheckout?: boolean },
): Promise<DepositPaymentResult> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        payments: {
          where: {
            type: PaymentType.DEPOSIT,
            status: PaymentStatus.PENDING,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return { status: "error", message: "Nie znaleziono leada." };
    }

    if (lead.isDeleted) {
      return { status: "error", message: "Nie znaleziono leada." };
    }

    const activePending = lead.payments.find(
      (payment) => !isPaymentExpired(payment),
    );

    if (activePending) {
      if (options?.skipCheckout) {
        return {
          status: "success",
          paymentId: activePending.id,
        };
      }

      const checkout = await createDepositCheckoutSession(activePending.id);
      if (checkout.status === "error") {
        return { status: "error", message: checkout.message };
      }

      return {
        status: "success",
        paymentId: activePending.id,
        payUrl: checkout.url,
      };
    }

    if (lead.status !== "PENDING_DEPOSIT") {
      return {
        status: "error",
        message: "Lead nie kwalifikuje się do generowania linku.",
      };
    }

    const token = generatePaymentToken();

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          token,
          leadId,
          type: PaymentType.DEPOSIT,
          amount: DEPOSIT_AMOUNT_GROSZE,
          expiresAt,
        },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: "PENDING_DEPOSIT",
          activePaymentId: created.id,
        },
      });

      return created;
    });

    if (options?.skipCheckout) {
      return {
        status: "success",
        paymentId: payment.id,
      };
    }

    const checkout = await createDepositCheckoutSession(payment.id);
    if (checkout.status === "error") {
      return { status: "error", message: checkout.message };
    }

    return {
      status: "success",
      paymentId: payment.id,
      payUrl: checkout.url,
    };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
    };
  }
}

async function renewDepositPaymentLinkForLead(
  leadId: string,
): Promise<DepositPaymentResult> {
  const expiresAt = addHours(new Date(), PHONE_PAYMENT_EXPIRY_HOURS);

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
        include: {
          payments: {
            where: { type: PaymentType.DEPOSIT },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!lead) {
        throw new RenewPaymentError("NOT_FOUND");
      }

      if (lead.isDeleted) {
        throw new RenewPaymentError("NOT_FOUND");
      }

      if (lead.status === LeadStatus.PENDING_DEPOSIT) {
        const paymentId = await upsertRenewalPayment(
          tx,
          leadId,
          lead.payments,
          lead.activePaymentId,
          expiresAt,
        );

        await tx.lead.update({
          where: { id: leadId },
          data: { activePaymentId: paymentId },
        });

        return {
          outcome: "extended" as const,
          paymentId,
          groupId: lead.groupId,
        };
      }

      if (lead.status === LeadStatus.CANCELLED) {
        if (!lead.requestedPackage) {
          throw new RenewPaymentError("NOT_FOUND");
        }

        try {
          await assertPackageHasCapacity(lead.requestedPackage, tx);
        } catch (error) {
          if (error instanceof PackagePoolFullError) {
            throw new RenewPaymentError("PACKAGE_POOL_FULL");
          }

          throw error;
        }

        const paymentId = await upsertRenewalPayment(
          tx,
          leadId,
          lead.payments,
          lead.activePaymentId,
          expiresAt,
        );

        await tx.lead.update({
          where: { id: leadId },
          data: {
            status: LeadStatus.PENDING_DEPOSIT,
            activePaymentId: paymentId,
          },
        });

        return {
          outcome: "restored" as const,
          paymentId,
          groupId: lead.groupId,
        };
      }

      throw new RenewPaymentError("INVALID_STATUS");
    });

    const checkout = await createDepositCheckoutSession(txResult.paymentId, {
      forceNew: true,
    });

    if (checkout.status === "error" || !checkout.url) {
      if (txResult.outcome === "restored") {
        await compensateRestoredReservation(
          leadId,
          txResult.paymentId,
          txResult.groupId,
        );
      }

      return {
        status: "error",
        message:
          checkout.message ?? "Nie udało się wygenerować nowej sesji płatności.",
      };
    }

    const message =
      txResult.outcome === "restored"
        ? "Rezerwacja przywrócona. Nowy link 24h został wygenerowany i wysłany na e-mail klienta."
        : "Nowy link 24h został wygenerowany i wysłany na e-mail klienta.";

    return {
      status: "success",
      paymentId: txResult.paymentId,
      payUrl: checkout.url,
      message,
    };
  } catch (error) {
    if (error instanceof RenewPaymentError) {
      return {
        status: "error",
        message: mapRenewPaymentError(error.code),
      };
    }

    return {
      status: "error",
      message: "Wystąpił błąd podczas odnowienia linku płatności.",
    };
  }
}

export async function renewDepositPaymentLink24h(
  _prevState: RenewPaymentLinkState,
  formData: FormData,
): Promise<RenewPaymentLinkState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  try {
    const result = await renewDepositPaymentLinkForLead(leadId);

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    if (!result.payUrl) {
      return {
        status: "error",
        message: "Nie udało się uzyskać linku do płatności.",
      };
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (lead) {
      const emailResult = await sendPaymentLinkEmail({
        to: lead.email,
        parentName: lead.parentName,
        packageName: packageLabel(lead.requestedPackage),
        amountGrosze: DEPOSIT_AMOUNT_GROSZE,
        payUrl: result.payUrl,
        renewal: true,
      });

      if (!emailResult.ok) {
        revalidatePath("/admin");
        return {
          status: "error",
          message:
            "Link został wygenerowany, ale nie udało się wysłać maila. Skopiuj link ręcznie.",
          payUrl: result.payUrl,
        };
      }
    }

    revalidatePath("/admin");

    return {
      status: "success",
      payUrl: result.payUrl,
      message:
        result.message ??
        "Nowy link 24h został wygenerowany i wysłany na e-mail klienta.",
    };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd podczas odnowienia linku płatności.",
    };
  }
}

export async function generateDepositPayment(
  _prevState: GeneratePaymentState,
  formData: FormData,
): Promise<GeneratePaymentState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora leada." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  const expiresAt = addHours(new Date(), PHONE_PAYMENT_EXPIRY_HOURS);
  const result = await createDepositPaymentForLead(leadId, expiresAt);

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  if (result.payUrl) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (lead) {
      await sendPaymentLinkEmail({
        to: lead.email,
        parentName: lead.parentName,
        packageName: packageLabel(lead.requestedPackage),
        amountGrosze: DEPOSIT_AMOUNT_GROSZE,
        payUrl: result.payUrl,
      });
    }
  }

  revalidatePath("/admin");

  return {
    status: "success",
    payUrl: result.payUrl,
  };
}

export async function startDepositCheckout(
  _prevState: StartDepositCheckoutState,
  formData: FormData,
): Promise<StartDepositCheckoutState> {
  const token = formData.get("token")?.toString();

  if (!token) {
    return { status: "error", message: "Brak tokenu płatności." };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { token },
      include: { lead: true },
    });

    if (!payment) {
      return { status: "error", message: "Nie znaleziono płatności." };
    }

    if (payment.status !== "PENDING" || isPaymentExpired(payment)) {
      return {
        status: "error",
        message: "Link płatności wygasł. Skontaktuj się z nami po nowy.",
      };
    }

    const checkout = await createDepositCheckoutSession(payment.id);

    if (checkout.status === "error" || !checkout.url) {
      return {
        status: "error",
        message: checkout.message ?? "Nie udało się rozpocząć płatności.",
      };
    }

    // Serwerowe InitiateCheckout (CAPI) — dedup z Pixelem po wspólnym eventId.
    // Gating zgody i identyfikatory Meta czytane są z żądania w meta-capi.
    const eventId = randomUUID();
    const lead = payment.lead;
    after(() => {
      void sendMetaInitiateCheckoutEvent({
        eventId,
        value: payment.amount / 100,
        currency: "PLN",
        contact: {
          email: lead.email,
          phone: lead.phoneNumber,
          fullName: lead.parentName,
        },
      });
    });

    return { status: "success", url: checkout.url, eventId };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
    };
  }
}
