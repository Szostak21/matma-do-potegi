"use server";

import { randomUUID } from "node:crypto";

import {
  LeadStatus,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";
import { cookies } from "next/headers";
import { after } from "next/server";

import {
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
} from "@/lib/cookie-consent";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { PACKAGE_POOL_FULL_MESSAGE } from "@/lib/content";
import { addMinutes, ONLINE_PAYMENT_EXPIRY_MINUTES } from "@/lib/dates";
import { sendAdminLeadNotification } from "@/lib/emails";
import { packageLabel } from "@/lib/labels";
import { sendMetaLeadEvent } from "@/lib/meta-capi";
import { PackagePoolFullError, assertPackageHasCapacity } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { resolveValidReferrerId } from "@/lib/referral-server";
import { generatePaymentToken } from "@/lib/tokens";
import {
  formDataToObject,
  leadFormSchema,
  normalizePhone,
  type LeadFormState,
} from "@/lib/validations/lead";

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const values = formDataToObject(formData);
  const parsed = leadFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  const data = parsed.data;

  // Referral nigdy nie blokuje zapisu — błąd DB / dziwny ref → zapis bez polecenia.
  let referredById: string | undefined;
  try {
    referredById = await resolveValidReferrerId({
      referredById: data.referredById,
      newEmail: data.email,
      newPhone: data.phone,
    });
  } catch (error) {
    console.error("resolveValidReferrerId failed:", error);
  }

  async function createLeadAndDeposit(refId: string | undefined) {
    return prisma.$transaction(async (tx) => {
      await assertPackageHasCapacity(data.package, tx);

      const created = await tx.lead.create({
        data: {
          parentName: data.parentName,
          phoneNumber: normalizePhone(data.phone),
          email: data.email,
          requestedPackage: data.package,
          schoolClass: data.schoolClass,
          notes: data.notes,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          utmContent: data.utmContent,
          referredById: refId,
          status: LeadStatus.PENDING_DEPOSIT,
        },
      });

      const payment = await tx.payment.create({
        data: {
          leadId: created.id,
          type: PaymentType.DEPOSIT,
          amount: DEPOSIT_AMOUNT_GROSZE,
          status: PaymentStatus.PENDING,
          token: generatePaymentToken(),
          expiresAt: addMinutes(new Date(), ONLINE_PAYMENT_EXPIRY_MINUTES),
        },
      });

      return tx.lead.update({
        where: { id: created.id },
        data: { activePaymentId: payment.id },
      });
    });
  }

  try {
    let lead;
    try {
      lead = await createLeadAndDeposit(referredById);
    } catch (error) {
      // Race: referrer usunięty między walidacją a INSERT (FK P2003) → bez polecenia.
      if (
        referredById &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        console.error(
          "Lead create FK on referredById failed, retrying without referral:",
          error,
        );
        lead = await createLeadAndDeposit(undefined);
      } else {
        throw error;
      }
    }

    // Mail admina poza ścieżką krytyczną — szybszy return success / redirect.
    // Po disconnectcie klienta after() i tak dociągnie powiadomienie.
    const adminNotification = {
      parentName: data.parentName,
      phone: data.phone,
      email: data.email,
      packageName: packageLabel(data.package),
    };
    after(() => {
      void sendAdminLeadNotification(adminNotification).catch((error) => {
        console.error("sendAdminLeadNotification failed:", error);
      });
    });

    // Meta Pixel + CAPI: ta sama zgoda marketingowa (cookie matma_cookie_consent).
    // eventId tylko przy zgodzie — deduplikacja z Pixelem w przeglądarce.
    const cookieStore = await cookies();
    const hasMarketingConsent =
      parseCookieConsent(cookieStore.get(COOKIE_CONSENT_KEY)?.value) ===
      "granted";
    const eventId = hasMarketingConsent ? randomUUID() : undefined;

    if (eventId) {
      const packageType = data.package;
      const email = data.email;
      const phone = normalizePhone(data.phone);
      const fullName = data.parentName;

      // Nie blokuj odpowiedzi formularza na Graph API.
      after(() => {
        void sendMetaLeadEvent({
          eventId,
          email,
          phone,
          fullName,
          packageType,
        });
      });
    }

    return {
      status: "success",
      leadId: lead.id,
      requestedPackage: data.package,
      eventId,
    };
  } catch (error) {
    if (error instanceof PackagePoolFullError) {
      return {
        status: "error",
        message: PACKAGE_POOL_FULL_MESSAGE,
        values,
      };
    }

    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
      values,
    };
  }
}
