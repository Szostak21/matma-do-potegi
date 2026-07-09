import { PackageType } from "@prisma/client";
import { z } from "zod";

import { TERMS } from "@/lib/content";

const polishPhoneRegex = /^(\+48\s?)?(\d{3}[\s-]?){2}\d{3}$/;

const packageValues = Object.values(PackageType) as [
  PackageType,
  ...PackageType[],
];

export const leadFormSchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, "Podaj imię i nazwisko"),
  phone: z
    .string()
    .trim()
    .regex(polishPhoneRegex, "Niepoprawny numer telefonu"),
  email: z.string().trim().email("Niepoprawny adres e-mail"),
  studentName: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  package: z
    .string()
    .min(1, "Wybierz poziom zajęć")
    .pipe(z.enum(packageValues, { message: "Wybierz poziom zajęć" })),
  currentGrade: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  expectedResult: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  acceptTerms: z.literal("on", {
    message: TERMS.validationError,
  }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  values?: Record<string, string>;
  leadId?: string;
  requestedPackage?: string;
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
    studentName: String(formData.get("studentName") ?? ""),
    package: String(formData.get("package") ?? ""),
    currentGrade: String(formData.get("currentGrade") ?? ""),
    expectedResult: String(formData.get("expectedResult") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    acceptTerms:
      formData.get("acceptTerms") === "on" ? "on" : "",
  };
}
