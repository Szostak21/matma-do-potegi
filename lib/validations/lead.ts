import { PackageType } from "@prisma/client";
import { z } from "zod";

import { TERMS } from "@/lib/content";
import { sanitizeRefId } from "@/lib/referral";

const polishPhoneRegex = /^(\+48\s?)?(\d{3}[\s-]?){2}\d{3}$/;

const packageValues = Object.values(PackageType) as [
  PackageType,
  ...PackageType[],
];

export const leadFormSchema = z.object({
  parentName: z.string().trim().min(2, "Podaj imię i nazwisko"),
  phone: z
    .string()
    .trim()
    .regex(polishPhoneRegex, "Niepoprawny numer telefonu"),
  email: z.string().trim().email("Niepoprawny adres e-mail"),
  package: z
    .string()
    .min(1, "Wybierz poziom zajęć")
    .pipe(z.enum(packageValues, { message: "Wybierz poziom zajęć" })),
  schoolClass: z.string().trim().min(1, "Podaj klasę (np. 4)"),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  acceptTerms: z.literal("on", {
    message: TERMS.validationError,
  }),
  utmSource: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  utmMedium: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  utmCampaign: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  utmContent: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  referredById: z
    .string()
    .trim()
    .optional()
    .transform((value) => sanitizeRefId(value)),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  values?: Record<string, string>;
  leadId?: string;
  requestedPackage?: string;
  /** Wspólny identyfikator zdarzenia dla deduplikacji Pixel <-> CAPI. */
  eventId?: string;
};

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("48")) {
    return `+${digits}`;
  }

  if (digits.length === 9) {
    return `+48${digits}`;
  }

  return phone.trim();
}

export function formDataToObject(formData: FormData): Record<string, string> {
  return {
    parentName: String(formData.get("parentName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    package: String(formData.get("package") ?? ""),
    schoolClass: String(formData.get("schoolClass") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    acceptTerms: formData.get("acceptTerms") === "on" ? "on" : "",
    utmSource: String(formData.get("utmSource") ?? ""),
    utmMedium: String(formData.get("utmMedium") ?? ""),
    utmCampaign: String(formData.get("utmCampaign") ?? ""),
    utmContent: String(formData.get("utmContent") ?? ""),
    referredById: String(formData.get("referredById") ?? ""),
  };
}
