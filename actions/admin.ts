"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";

import { createDepositPaymentForLead } from "@/actions/payments";
import { assertAdminSecret } from "@/lib/auth";
import { PACKAGE_POOL_FULL_MESSAGE } from "@/lib/content";
import { addHours, PHONE_PAYMENT_EXPIRY_HOURS } from "@/lib/dates";
import { sendPaymentLinkEmail } from "@/lib/emails";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { packageLabel } from "@/lib/labels";
import {
  assertPackageHasCapacity,
  PackagePoolFullError,
} from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import { resetDatabaseToSeedState } from "@/lib/seed";
import {
  manualLeadFormDataToObject,
  manualLeadSchema,
} from "@/lib/validations/manual-lead";
import { normalizePhone } from "@/lib/validations/lead";

export type ResetDatabaseState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type CreateManualLeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  payUrl?: string;
  leadId?: string;
};

export type SoftDeleteLeadState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type UpdatePlacementNotesState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function resetDatabase(
  _prevState: ResetDatabaseState,
  formData: FormData,
): Promise<ResetDatabaseState> {
  const secret = formData.get("secret")?.toString();

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  const confirmed = formData.get("confirm")?.toString();

  if (confirmed !== "RESET") {
    return {
      status: "error",
      message: "Potwierdzenie nieprawidłowe. Wpisz RESET w polu potwierdzenia.",
    };
  }

  try {
    await resetDatabaseToSeedState(prisma);
    revalidatePath("/admin");

    return {
      status: "success",
      message: "Baza została zresetowana do stanu po seedzie.",
    };
  } catch {
    return {
      status: "error",
      message: "Nie udało się zresetować bazy. Spróbuj ponownie.",
    };
  }
}

export async function createManualLead(
  _prevState: CreateManualLeadState,
  formData: FormData,
): Promise<CreateManualLeadState> {
  const secret = formData.get("secret")?.toString();

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  const values = manualLeadFormDataToObject(formData);
  const parsed = manualLeadSchema.safeParse(values);

  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors;
    const message =
      Object.values(firstError).flat()[0] ?? "Niepoprawne dane formularza.";

    return { status: "error", message };
  }

  const data = parsed.data;

  try {
    if (data.paymentMode === "cash") {
      const lead = await prisma.$transaction(async (tx) => {
        await assertPackageHasCapacity(data.package, tx);

        return tx.lead.create({
          data: {
            parentName: data.parentName,
            phoneNumber: normalizePhone(data.phone),
            email: data.email,
            requestedPackage: data.package,
            notes: data.notes,
            status: LeadStatus.PAID_DEPOSIT,
          },
        });
      });

      revalidatePath("/admin");

      return {
        status: "success",
        leadId: lead.id,
        message: "Uczeń dodany jako opłacony gotówką.",
      };
    }

    const lead = await prisma.$transaction(async (tx) => {
      await assertPackageHasCapacity(data.package, tx);

      return tx.lead.create({
        data: {
          parentName: data.parentName,
          phoneNumber: normalizePhone(data.phone),
          email: data.email,
          requestedPackage: data.package,
          notes: data.notes,
        },
      });
    });

    const expiresAt = addHours(new Date(), PHONE_PAYMENT_EXPIRY_HOURS);
    const paymentResult = await createDepositPaymentForLead(lead.id, expiresAt);

    if (paymentResult.status === "error") {
      await prisma.lead.delete({ where: { id: lead.id } });

      return {
        status: "error",
        message: paymentResult.message ?? "Nie udało się wygenerować linku.",
      };
    }

    if (paymentResult.payUrl) {
      await sendPaymentLinkEmail({
        to: lead.email,
        parentName: lead.parentName,
        packageName: packageLabel(lead.requestedPackage),
        amountGrosze: DEPOSIT_AMOUNT_GROSZE,
        payUrl: paymentResult.payUrl,
      });
    }

    revalidatePath("/admin");

    return {
      status: "success",
      leadId: lead.id,
      payUrl: paymentResult.payUrl,
      message: "Uczeń dodany. Link do płatności został wygenerowany i wysłany.",
    };
  } catch (error) {
    if (error instanceof PackagePoolFullError) {
      return { status: "error", message: PACKAGE_POOL_FULL_MESSAGE };
    }

    return {
      status: "error",
      message: "Wystąpił błąd podczas dodawania ucznia.",
    };
  }
}

export async function softDeleteLead(
  _prevState: SoftDeleteLeadState,
  formData: FormData,
): Promise<SoftDeleteLeadState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.isDeleted) {
      return { status: "error", message: "Nie znaleziono zgłoszenia." };
    }

    await prisma.$transaction(async (tx) => {
      if (lead.groupId) {
        const group = await tx.group.findUnique({
          where: { id: lead.groupId },
        });

        if (group && group.currentCount > 0) {
          await tx.group.update({
            where: { id: lead.groupId },
            data: { currentCount: { decrement: 1 } },
          });
        }
      }

      await tx.lead.update({
        where: { id: leadId },
        data: {
          isDeleted: true,
          status: LeadStatus.CANCELLED,
          groupId: null,
          activePaymentId: null,
        },
      });
    });

    revalidatePath("/admin");

    return {
      status: "success",
      message: "Zgłoszenie zostało usunięte. Miejsce w puli zostało zwolnione.",
    };
  } catch {
    return {
      status: "error",
      message: "Nie udało się usunąć zgłoszenia.",
    };
  }
}

export async function updatePlacementTestNotes(
  _prevState: UpdatePlacementNotesState,
  formData: FormData,
): Promise<UpdatePlacementNotesState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();
  const placementTestNotes = formData.get("placementTestNotes");

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.isDeleted) {
      return { status: "error", message: "Nie znaleziono zgłoszenia." };
    }

    const notesValue =
      typeof placementTestNotes === "string" && placementTestNotes.trim() !== ""
        ? placementTestNotes.trim()
        : null;

    await prisma.lead.update({
      where: { id: leadId },
      data: { placementTestNotes: notesValue },
    });

    revalidatePath("/admin");

    return { status: "success", message: "Notatki zapisane." };
  } catch {
    return {
      status: "error",
      message: "Nie udało się zapisać notatek.",
    };
  }
}
