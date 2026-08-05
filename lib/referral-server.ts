import { LeadStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sanitizeRefId } from "@/lib/referral";
import { normalizePhone } from "@/lib/validations/lead";

/** Statusy uprawniające do bycia polecającym (po realnej zaliczce). */
export const REFERRAL_ELIGIBLE_STATUSES: LeadStatus[] = [
  LeadStatus.PAID_DEPOSIT,
  LeadStatus.ACTIVE,
];

/**
 * Waliduje referrera po stronie serwera. Zwraca ID albo undefined (ciche odrzucenie).
 */
export async function resolveValidReferrerId(input: {
  referredById: string | undefined;
  newEmail: string;
  newPhone: string;
}): Promise<string | undefined> {
  const referredById = sanitizeRefId(input.referredById);
  if (!referredById) {
    return undefined;
  }

  const referrer = await prisma.lead.findUnique({
    where: { id: referredById },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      status: true,
      isDeleted: true,
    },
  });

  if (!referrer || referrer.isDeleted) {
    return undefined;
  }

  if (!REFERRAL_ELIGIBLE_STATUSES.includes(referrer.status)) {
    return undefined;
  }

  const newEmail = input.newEmail.trim().toLowerCase();
  const newPhone = normalizePhone(input.newPhone);
  const referrerEmail = referrer.email.trim().toLowerCase();
  const referrerPhone = normalizePhone(referrer.phoneNumber);

  if (newEmail === referrerEmail || newPhone === referrerPhone) {
    return undefined;
  }

  return referrer.id;
}
