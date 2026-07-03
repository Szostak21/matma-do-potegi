"use server";

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
    await prisma.lead.create({
      data: {
        parentName: data.parentName,
        phoneNumber: normalizePhone(data.phone),
        email: data.email,
        studentName: data.studentName,
        requestedPackage: data.package,
        currentGrade: data.currentGrade,
        expectedResult: data.expectedResult,
      },
    });

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
      values,
    };
  }
}
