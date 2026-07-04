import { LeadStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function markDepositPaymentPaid(paymentId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { lead: true },
    });

    if (!payment) {
      return;
    }

    if (payment.status === PaymentStatus.PAID) {
      return;
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
  });
}
