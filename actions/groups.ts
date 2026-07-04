"use server";

import { LeadStatus, PaymentStatus, PaymentType } from "@prisma/client";

import { createDepositPaymentForLead } from "@/actions/payments";
import { createDepositCheckoutSession } from "@/lib/checkout";
import { addMinutes, ONLINE_PAYMENT_EXPIRY_MINUTES } from "@/lib/dates";
import { isPaymentExpired } from "@/lib/payments";
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
      const checkout = await createDepositCheckoutSession(activePending.id);
      if (checkout.status === "error") {
        return { status: "error", message: checkout.message };
      }

      return { status: "success", payUrl: checkout.url };
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

    return {
      status: "success",
      payUrl: paymentResult.payUrl,
    };
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
