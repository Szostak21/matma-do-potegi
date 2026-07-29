"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { after } from "next/server";

import { createDepositPaymentForLead } from "@/actions/payments";
import {
  COOKIE_CONSENT_KEY,
  parseCookieConsent,
} from "@/lib/cookie-consent";
import { PACKAGE_POOL_FULL_MESSAGE } from "@/lib/content";
import { addMinutes, ONLINE_PAYMENT_EXPIRY_MINUTES } from "@/lib/dates";
import { sendAdminLeadNotification } from "@/lib/emails";
import { packageLabel } from "@/lib/labels";
import { sendMetaLeadEvent } from "@/lib/meta-capi";
import { PackagePoolFullError, assertPackageHasCapacity } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
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

  try {
    const lead = await prisma.$transaction(async (tx) => {
      await assertPackageHasCapacity(data.package, tx);

      return tx.lead.create({
        data: {
          parentName: data.parentName,
          phoneNumber: normalizePhone(data.phone),
          email: data.email,
          studentName: data.studentName,
          requestedPackage: data.package,
          schoolClass: data.schoolClass,
          expectedResult: data.expectedResult,
          notes: data.notes,
        },
      });
    });

    const expiresAt = addMinutes(new Date(), ONLINE_PAYMENT_EXPIRY_MINUTES);
    const paymentResult = await createDepositPaymentForLead(lead.id, expiresAt, {
      skipCheckout: true,
    });

    if (paymentResult.status === "error") {
      await prisma.lead.delete({ where: { id: lead.id } });

      return {
        status: "error",
        message: paymentResult.message ?? "Wystąpił błąd. Spróbuj ponownie.",
        values,
      };
    }

    try {
      await sendAdminLeadNotification({
        parentName: data.parentName,
        studentName: data.studentName,
        phone: data.phone,
        email: data.email,
        packageName: packageLabel(data.package),
      });
    } catch (error) {
      console.error("sendAdminLeadNotification failed:", error);
    }

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
