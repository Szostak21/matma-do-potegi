"use server";

import { LeadStatus } from "@prisma/client";

import { assertAdminSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AssignGroupState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const ASSIGNABLE_STATUSES: LeadStatus[] = [
  LeadStatus.UNVERIFIED,
  LeadStatus.PENDING_DEPOSIT,
  LeadStatus.PAID_DEPOSIT,
  LeadStatus.ACTIVE,
];

export async function assignLeadToGroup(
  _prevState: AssignGroupState,
  formData: FormData,
): Promise<AssignGroupState> {
  const leadId = formData.get("leadId");
  const groupId = formData.get("groupId");
  const secret = formData.get("secret")?.toString();

  if (!leadId || typeof leadId !== "string") {
    return { status: "error", message: "Brak identyfikatora leada." };
  }

  if (!groupId || typeof groupId !== "string") {
    return { status: "error", message: "Wybierz grupę." };
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

    if (!ASSIGNABLE_STATUSES.includes(lead.status)) {
      return {
        status: "error",
        message: "Nie można przypisać grupy w tym statusie.",
      };
    }

    if (!lead.requestedPackage) {
      return {
        status: "error",
        message: "Lead nie ma wybranego pakietu.",
      };
    }

    if (lead.groupId === groupId) {
      return { status: "success", message: "Grupa już przypisana." };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return { status: "error", message: "Nie znaleziono grupy." };
    }

    if (group.packageType !== lead.requestedPackage) {
      return {
        status: "error",
        message: "Grupa nie pasuje do pakietu leada.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (lead.groupId && lead.groupId !== groupId) {
        const oldGroup = await tx.group.findUnique({
          where: { id: lead.groupId },
        });

        if (oldGroup && oldGroup.currentCount > 0) {
          await tx.group.update({
            where: { id: lead.groupId },
            data: { currentCount: { decrement: 1 } },
          });
        }
      }

      const freshGroup = await tx.group.findUniqueOrThrow({
        where: { id: groupId },
      });

      if (
        lead.groupId !== groupId &&
        freshGroup.currentCount >= freshGroup.maxCapacity
      ) {
        throw new Error("FULL");
      }

      if (lead.groupId !== groupId) {
        await tx.group.update({
          where: { id: groupId },
          data: { currentCount: { increment: 1 } },
        });
      }

      await tx.lead.update({
        where: { id: leadId },
        data: { groupId },
      });
    });

    return { status: "success", message: "Grupa przypisana." };
  } catch (error) {
    if (error instanceof Error && error.message === "FULL") {
      return { status: "error", message: "Brak wolnych miejsc w tej grupie." };
    }

    return {
      status: "error",
      message: "Wystąpił błąd podczas przypisywania grupy.",
    };
  }
}
