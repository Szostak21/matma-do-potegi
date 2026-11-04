"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, PaymentStatus, PaymentType } from "@prisma/client";

import { createDepositPaymentForLead } from "@/actions/payments";
import { assertAdminSecret } from "@/lib/auth";
import { PACKAGE_POOL_FULL_MESSAGE } from "@/lib/content";
import { addHours, PHONE_PAYMENT_EXPIRY_HOURS } from "@/lib/dates";
import { sendPaymentLinkEmail } from "@/lib/emails";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import { packageLabel } from "@/lib/labels";
import { assertPackageHasCapacity, PackagePoolFullError } from "@/lib/packages";
import { prisma } from "@/lib/prisma";
import {
  manualLeadFormDataToObject,
  manualLeadSchema,
} from "@/lib/validations/manual-lead";
import { normalizePhone } from "@/lib/validations/lead";

export type CreateManualLeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  payUrl?: string;
  leadId?: string;
};

export type UpdateLeadStatusState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type UpdatePlacementNotesState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type UpdateStudentNameState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type ToggleSkipDepositState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type TuitionPeriodActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const ALL_LEAD_STATUSES = Object.values(LeadStatus);

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
  const skipDeposit = formData.get("skipDeposit") === "on";

  try {
    if (data.paymentMode === "cash" || skipDeposit) {
      const lead = await prisma.$transaction(async (tx) => {
        await assertPackageHasCapacity(data.package, tx);

        return tx.lead.create({
          data: {
            parentName: data.parentName,
            phoneNumber: normalizePhone(data.phone),
            email: data.email,
            requestedPackage: data.package,
            notes: data.notes,
            skipDeposit,
            status: skipDeposit ? LeadStatus.ACTIVE : LeadStatus.PAID_DEPOSIT,
          },
        });
      });

      revalidatePath("/admin");

      return {
        status: "success",
        leadId: lead.id,
        message: skipDeposit
          ? "Uczeń dodany (bez zaliczki)."
          : "Uczeń dodany jako opłacony gotówką.",
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
          status: LeadStatus.PENDING_DEPOSIT,
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

export async function updateLeadStatus(
  _prevState: UpdateLeadStatusState,
  formData: FormData,
): Promise<UpdateLeadStatusState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();
  const nextStatus = formData.get("status")?.toString();

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  if (!nextStatus || !ALL_LEAD_STATUSES.includes(nextStatus as LeadStatus)) {
    return { status: "error", message: "Nieprawidłowy status." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  try {
    const status = nextStatus as LeadStatus;
    const exitStatuses: LeadStatus[] = [
      LeadStatus.CANCELLED,
      LeadStatus.RESIGNED,
      LeadStatus.REFUNDED,
    ];
    const occupyingStatuses: LeadStatus[] = [
      LeadStatus.PENDING_DEPOSIT,
      LeadStatus.PAID_DEPOSIT,
      LeadStatus.ACTIVE,
    ];

    await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id: leadId } });

      if (!lead) {
        throw new Error("LEAD_NOT_FOUND");
      }

      const leavingOccupancy =
        occupyingStatuses.includes(lead.status) &&
        exitStatuses.includes(status);

      const leavingSeat = leavingOccupancy && Boolean(lead.groupId);

      if (leavingSeat && lead.groupId) {
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

      if (leavingOccupancy) {
        await tx.payment.updateMany({
          where: {
            leadId,
            type: PaymentType.DEPOSIT,
            status: PaymentStatus.PENDING,
          },
          data: { status: PaymentStatus.EXPIRED },
        });
      }

      await tx.lead.update({
        where: { id: leadId },
        data: {
          status,
          resignedAt:
            status === LeadStatus.RESIGNED
              ? (lead.resignedAt ?? new Date())
              : null,
          ...(leavingOccupancy
            ? {
                groupId: null,
                activePaymentId: null,
              }
            : {}),
        },
      });
    });

    revalidatePath("/admin");

    return {
      status: "success",
      message: "Status został zmieniony.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "LEAD_NOT_FOUND") {
      return { status: "error", message: "Nie znaleziono zgłoszenia." };
    }

    return { status: "error", message: "Nie udało się zmienić statusu." };
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

    if (!lead) {
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

const STUDENT_NAME_MAX_LENGTH = 80;

export async function updateStudentName(
  _prevState: UpdateStudentNameState,
  formData: FormData,
): Promise<UpdateStudentNameState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();
  const rawName = formData.get("studentName");

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  const trimmed = typeof rawName === "string" ? rawName.trim() : "";

  if (trimmed.length > STUDENT_NAME_MAX_LENGTH) {
    return { status: "error", message: "Imię jest zbyt długie." };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { status: "error", message: "Nie znaleziono zgłoszenia." };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { studentName: trimmed === "" ? null : trimmed },
    });

    revalidatePath("/admin");

    return {
      status: "success",
      message:
        trimmed === "" ? "Imię ucznia usunięte." : "Imię ucznia zapisane.",
    };
  } catch {
    return {
      status: "error",
      message: "Nie udało się zapisać imienia ucznia.",
    };
  }
}

export async function toggleSkipDeposit(
  _prevState: ToggleSkipDepositState,
  formData: FormData,
): Promise<ToggleSkipDepositState> {
  const leadId = formData.get("leadId");
  const secret = formData.get("secret")?.toString();
  const skipDeposit = formData.get("skipDeposit") === "true";

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora zgłoszenia." };
  }

  try {
    assertAdminSecret(secret);
  } catch {
    return { status: "error", message: "Brak uprawnień." };
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { skipDeposit },
    });

    revalidatePath("/admin");

    return {
      status: "success",
      message: skipDeposit
        ? "Oznaczono: bez zaliczki."
        : "Wyłączono flagę bez zaliczki.",
    };
  } catch {
    return { status: "error", message: "Nie udało się zaktualizować flagi." };
  }
}

/** @deprecated Usunięte z UI — zostaje tylko na wypadek starych referencji. */
export async function softDeleteLead(): Promise<{
  status: "error";
  message: string;
}> {
  return {
    status: "error",
    message:
      "Soft-delete wyłączony. Zmień status leada (np. RESIGNED / CANCELLED).",
  };
}
