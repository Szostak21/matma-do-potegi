import { LeadStatus, PackageType, PaymentStatus } from "@prisma/client";

import { REFERRAL_DISCOUNT_GROSZE } from "@/lib/constants";
import { sendAdminDepositNotification, sendDepositConfirmationEmail } from "@/lib/emails";
import { packageLabel } from "@/lib/labels";
import { sendMetaPurchaseEvent } from "@/lib/meta-capi";
import { getAppBaseUrl } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { buildReferralUrl } from "@/lib/referral";

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

/**
 * Idempotentna nagroda referral — poza transakcją PAID, żeby błąd zniżki
 * nigdy nie rollbackował opłaconej zaliczki. updateMany + flaga = bezpieczne przy retry.
 */
async function applyReferralRewardForLead(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      referredById: true,
      referralRewardApplied: true,
    },
  });

  if (!lead?.referredById || lead.referralRewardApplied) {
    return;
  }

  const rewarded = await prisma.lead.updateMany({
    where: {
      id: leadId,
      referredById: { not: null },
      referralRewardApplied: false,
    },
    data: {
      referralRewardApplied: true,
      firstMonthDiscountGrosze: { increment: REFERRAL_DISCOUNT_GROSZE },
    },
  });

  if (rewarded.count !== 1 || !lead.referredById) {
    return;
  }

  await prisma.lead.updateMany({
    where: {
      id: lead.referredById,
      isDeleted: false,
    },
    data: {
      firstMonthDiscountGrosze: { increment: REFERRAL_DISCOUNT_GROSZE },
    },
  });
}

async function sendPaidSideEffects(
  payment: {
    id: string;
    token: string;
    amount: number;
    lead: {
      id: string;
      email: string;
      phoneNumber: string;
      parentName: string;
      requestedPackage: PackageType | null;
    };
  },
  metaContext?: PaidMetaContext,
): Promise<void> {
  const { lead } = payment;

  let referralUrl: string | undefined;
  try {
    referralUrl = buildReferralUrl(lead.id, getAppBaseUrl());
  } catch (error) {
    console.error("buildReferralUrl failed:", error);
  }

  await sendDepositConfirmationEmail({
    to: lead.email,
    parentName: lead.parentName,
    amountGrosze: payment.amount,
    packageName: packageLabel(lead.requestedPackage),
    referralUrl,
  });
  await sendAdminDepositNotification({
    parentName: lead.parentName,
    packageName: packageLabel(lead.requestedPackage),
    amountGrosze: payment.amount,
    leadId: lead.id,
  });

  // Serwerowe Purchase (CAPI) — eventId = token (dedup z Pixelem w przeglądarce).
  // Zgoda, _fbp/_fbc, IP/UA z metadanych sesji Stripe → Advanced Matching.
  if (metaContext) {
    await sendMetaPurchaseEvent({
      eventId: payment.token,
      value: payment.amount / 100,
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
      // Już opłacone — zwróć leadId do ewentualnego backfillu zniżki.
      return {
        didTransition: false,
        payment: null,
        leadIdForReferral: payment.leadId,
      };
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

    return {
      didTransition: true,
      payment,
      leadIdForReferral: payment.leadId,
    };
  });

  // Referral poza transakcją PAID — błąd zniżki nie cofa płatności.
  // Wywołujemy też przy retry webhooka (już PAID), gdy poprzedni run padł po commit.
  if (result.leadIdForReferral) {
    try {
      await applyReferralRewardForLead(result.leadIdForReferral);
    } catch (error) {
      console.error("applyReferralRewardForLead failed:", error);
    }
  }

  if (result.didTransition && result.payment) {
    try {
      await sendPaidSideEffects(result.payment, metaContext);
    } catch (error) {
      // Płatność już zapisana — side-effecty nie mogą wywalić webhooka / checkoutu.
      console.error("post-payment side effects failed:", error);
    }
  }

  return { didTransition: result.didTransition };
}
