import { LeadStatus, PaymentStatus } from "@prisma/client";

import { sendDepositConfirmationEmail } from "@/lib/emails";
import { prisma } from "@/lib/prisma";

export type MarkDepositPaymentPaidResult = {
  didTransition: boolean;
};

export async function markDepositPaymentPaid(
  paymentId: string,
): Promise<MarkDepositPaymentPaidResult> {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        lead: {
          include: { group: true },
        },
      },
    });

    if (!payment) {
      return { didTransition: false, payment: null };
    }

    if (payment.status === PaymentStatus.PAID) {
      return { didTransition: false, payment: null };
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    if (payment.lead.status !== LeadStatus.PAID_DEPOSIT) {
      await tx.lead.update({
        where: { id: payment.leadId },
        data: { status: LeadStatus.PAID_DEPOSIT },
      });
    }

    return { didTransition: true, payment };
  });

  if (result.didTransition && result.payment) {
    const { lead } = result.payment;
    await sendDepositConfirmationEmail({
      to: lead.email,
      parentName: lead.parentName,
      requestedPackage: lead.requestedPackage,
      amountGrosze: result.payment.amount,
      groupName: lead.group?.name ?? null,
      scheduleSlot: lead.group?.scheduleSlot ?? null,
    });
  }

  return { didTransition: result.didTransition };
}
