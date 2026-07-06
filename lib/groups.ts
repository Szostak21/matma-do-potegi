import { LeadStatus, PackageType, PaymentStatus, PaymentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AvailableGroup } from "@/lib/types/groups";

export type { AvailableGroup };

const packageTypeValues = new Set<string>(Object.values(PackageType));

export function isValidPackageType(value: string): value is PackageType {
  return packageTypeValues.has(value);
}

export async function runLazyValidation(): Promise<void> {
  const now = new Date();

  const expiredPayments = await prisma.payment.findMany({
    where: {
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
      expiresAt: { lt: now },
    },
    select: { id: true },
  });

  for (const paymentSnapshot of expiredPayments) {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentSnapshot.id },
      });

      if (!payment) {
        return;
      }

      if (payment.status !== PaymentStatus.PENDING) {
        return;
      }

      if (!payment.expiresAt || payment.expiresAt >= now) {
        return;
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.EXPIRED },
      });

      const lead = await tx.lead.findUnique({
        where: { id: payment.leadId },
      });

      if (!lead || lead.status !== LeadStatus.PENDING_DEPOSIT) {
        return;
      }

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
        where: { id: lead.id },
        data: {
          status: LeadStatus.CANCELLED,
          activePaymentId: null,
        },
      });
    });
  }
}

export async function getAvailableGroups(
  packageType: PackageType,
): Promise<AvailableGroup[]> {
  const groups = await prisma.group.findMany({
    where: { packageType },
    orderBy: { scheduleSlot: "asc" },
  });

  return groups
    .filter((group) => group.currentCount < group.maxCapacity)
    .map((group) => ({
      id: group.id,
      name: group.name,
      scheduleSlot: group.scheduleSlot,
      priceMonthly: group.priceMonthly,
      availableSpots: group.maxCapacity - group.currentCount,
    }));
}
