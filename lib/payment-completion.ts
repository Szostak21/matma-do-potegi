import { LeadStatus, PaymentStatus } from "@prisma/client";

import { sendAdminDepositNotification, sendDepositConfirmationEmail } from "@/lib/emails";
import { packageLabel } from "@/lib/labels";
import { sendMetaPurchaseEvent } from "@/lib/meta-capi";
import { prisma } from "@/lib/prisma";

export type MarkDepositPaymentPaidResult = {
  didTransition: boolean;
};

/**
 * Kontekst marketingowy przeniesiony z metadanych sesji Stripe.
 * Pozwala wysłać serwerowe Purchase (CAPI) po zgodzie, bez kontekstu żądania.
 */
export type PaidMetaContext = {
  consentGranted: boolean;
  fbp: string | null;
  fbc: string | null;
  clientIpAddress: string | null;
  clientUserAgent: string | null;
};

export async function markDepositPaymentPaid(
  paymentId: string,
  metaContext?: PaidMetaContext,
): Promise<MarkDepositPaymentPaidResult> {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        lead: true,
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
      amountGrosze: result.payment.amount,
      packageName: packageLabel(lead.requestedPackage),
    });
    await sendAdminDepositNotification({
      parentName: lead.parentName,
      studentName: lead.studentName,
      packageName: packageLabel(lead.requestedPackage),
      amountGrosze: result.payment.amount,
      leadId: lead.id,
    });

    // Serwerowe Purchase (CAPI) — eventId = token (dedup z Pixelem w przeglądarce).
    // Zgoda, _fbp/_fbc, IP/UA z metadanych sesji Stripe → Advanced Matching.
    if (metaContext) {
      await sendMetaPurchaseEvent({
        eventId: result.payment.token,
        value: result.payment.amount / 100,
        currency: "PLN",
        consentGranted: metaContext.consentGranted,
        contact: {
          email: lead.email,
          phone: lead.phoneNumber,
          fullName: lead.parentName,
        },
        fbp: metaContext.fbp,
        fbc: metaContext.fbc,
        clientIpAddress: metaContext.clientIpAddress,
        clientUserAgent: metaContext.clientUserAgent,
      });
    }
  }

  return { didTransition: result.didTransition };
}
