"use server";

import { PaymentStatus, PaymentType } from "@prisma/client";

import { assertAdminSecret } from "@/lib/auth";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { addHours, PHONE_PAYMENT_EXPIRY_HOURS } from "@/lib/dates";
import { buildPayUrl, isPaymentExpired } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { generatePaymentToken } from "@/lib/tokens";

export type DepositPaymentResult = {
  status: "success" | "error";
  payUrl?: string;
  message?: string;
};

export type GeneratePaymentState = {
  status: "idle" | "success" | "error";
  payUrl?: string;
  message?: string;
};

export type SimulatePaymentState = {
  status:
    | "idle"
    | "success"
    | "already_paid"
    | "expired"
    | "invalid"
    | "not_found"
    | "error";
  message?: string;
};

export async function createDepositPaymentForLead(
  leadId: string,
  expiresAt: Date,
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

    const activePending = lead.payments.find(
      (payment) => !isPaymentExpired(payment),
    );

    if (activePending) {
      return {
        status: "success",
        payUrl: buildPayUrl(activePending.token),
      };
    }

    if (lead.status !== "UNVERIFIED" && lead.status !== "PENDING_DEPOSIT") {
      return {
        status: "error",
        message: "Lead nie kwalifikuje się do generowania linku.",
      };
    }

    const token = generatePaymentToken();

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
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
          activePaymentId: payment.id,
        },
      });
    });

    return { status: "success", payUrl: buildPayUrl(token) };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
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

  return createDepositPaymentForLead(leadId, expiresAt);
}

export async function simulatePayment(
  _prevState: SimulatePaymentState,
  formData: FormData,
): Promise<SimulatePaymentState> {
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
      return { status: "not_found", message: "Nie znaleziono płatności." };
    }

    if (payment.status === PaymentStatus.PAID) {
      return { status: "already_paid" };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return { status: "invalid", message: "Płatność jest nieważna." };
    }

    if (isPaymentExpired(payment)) {
      return { status: "expired", message: "Link wygasł." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      await tx.lead.update({
        where: { id: payment.leadId },
        data: { status: "PAID_DEPOSIT" },
      });
    });

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
    };
  }
}
