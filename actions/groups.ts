"use server";

import { LeadStatus, PaymentStatus, PaymentType } from "@prisma/client";

import { createDepositPaymentForLead } from "@/actions/payments";
import { addMinutes, ONLINE_PAYMENT_EXPIRY_MINUTES } from "@/lib/dates";
import { buildPayUrl, isPaymentExpired } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export type ReserveGroupResult = {
  status: "success" | "error";
  payUrl?: string;
  message?: string;
};

export async function reserveGroup(
  leadId: string,
  groupId: string,
): Promise<ReserveGroupResult> {
  if (!leadId || !groupId) {
    return { status: "error", message: "Brak wymaganych danych rezerwacji." };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        payments: {
          where: {
            type: PaymentType.DEPOSIT,
            status: PaymentStatus.PENDING,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return { status: "error", message: "Nie znaleziono zgłoszenia." };
    }

    const activePending = lead.payments.find(
      (payment) => !isPaymentExpired(payment),
    );

    if (activePending) {
      return {
        status: "success",
        payUrl: buildPayUrl(activePending.token),
      };
    }

    if (lead.status !== LeadStatus.UNVERIFIED) {
      return {
        status: "error",
        message: "To zgłoszenie jest już przetwarzane.",
      };
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return { status: "error", message: "Nie znaleziono wybranej grupy." };
    }

    if (group.packageType !== lead.requestedPackage) {
      return {
        status: "error",
        message: "Wybrana grupa nie pasuje do pakietu z formularza.",
      };
    }

    if (group.currentCount >= group.maxCapacity) {
      return { status: "error", message: "Brak wolnych miejsc w tej grupie." };
    }

    await prisma.$transaction(async (tx) => {
      const freshGroup = await tx.group.findUniqueOrThrow({
        where: { id: groupId },
      });

      if (freshGroup.currentCount >= freshGroup.maxCapacity) {
        throw new Error("FULL");
      }

      await tx.group.update({
        where: { id: groupId },
        data: { currentCount: { increment: 1 } },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: { groupId },
      });
    });

    const expiresAt = addMinutes(new Date(), ONLINE_PAYMENT_EXPIRY_MINUTES);
    const paymentResult = await createDepositPaymentForLead(leadId, expiresAt);

    if (paymentResult.status === "error") {
      await prisma.$transaction(async (tx) => {
        await tx.group.update({
          where: { id: groupId },
          data: { currentCount: { decrement: 1 } },
        });

        await tx.lead.update({
          where: { id: leadId },
          data: { groupId: null },
        });
      });

      return paymentResult;
    }

    return paymentResult;
  } catch (error) {
    if (error instanceof Error && error.message === "FULL") {
      return { status: "error", message: "Brak wolnych miejsc w tej grupie." };
    }

    return {
      status: "error",
      message: "Wystąpił błąd. Spróbuj ponownie.",
    };
  }
}
