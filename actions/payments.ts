"use server";

import { PaymentStatus, PaymentType } from "@prisma/client";

import { assertAdminSecret } from "@/lib/auth";
import { createDepositCheckoutSession } from "@/lib/checkout";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { addHours, PHONE_PAYMENT_EXPIRY_HOURS } from "@/lib/dates";
import { sendPaymentLinkEmail } from "@/lib/emails";
import { isPaymentExpired } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { generatePaymentToken } from "@/lib/tokens";

export type DepositPaymentResult = {
  status: "success" | "error";
  paymentId?: string;
  payUrl?: string;
  message?: string;
};

export type GeneratePaymentState = {
  status: "idle" | "success" | "error";
  payUrl?: string;
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

    if (lead.status !== "UNVERIFIED" && lead.status !== "PENDING_DEPOSIT") {
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
      include: { group: true },
    });

    if (lead) {
      await sendPaymentLinkEmail({
        to: lead.email,
        parentName: lead.parentName,
        groupName: lead.group?.name ?? null,
        scheduleSlot: lead.group?.scheduleSlot ?? null,
        amountGrosze: DEPOSIT_AMOUNT_GROSZE,
        payUrl: result.payUrl,
      });
    }
  }

  return {
    status: "success",
    payUrl: result.payUrl,
  };
}
