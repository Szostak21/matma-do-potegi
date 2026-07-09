import { PackageType } from "@prisma/client";
import { z } from "zod";

const polishPhoneRegex = /^(\+48\s?)?(\d{3}[\s-]?){2}\d{3}$/;

const packageValues = Object.values(PackageType) as [
  PackageType,
  ...PackageType[],
];

export const manualLeadSchema = z.object({
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
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  paymentMode: z.enum(["cash", "online"], {
    message: "Wybierz sposób płatności",
  }),
});

export type ManualLeadValues = z.infer<typeof manualLeadSchema>;

export function manualLeadFormDataToObject(
  formData: FormData,
): Record<string, string> {
  return {
    parentName: String(formData.get("parentName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    studentName: String(formData.get("studentName") ?? ""),
    package: String(formData.get("package") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    paymentMode: String(formData.get("paymentMode") ?? ""),
  };
}
