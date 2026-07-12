import {
  LeadStatus,
  PackageType,
  type Prisma,
} from "@prisma/client";

import { PACKAGE_CAPACITY } from "@/lib/constants";
import { getDisplayedAvailableSpots } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const POOL_OCCUPYING_STATUSES: LeadStatus[] = [
  LeadStatus.PENDING_DEPOSIT,
  LeadStatus.PAID_DEPOSIT,
  LeadStatus.ACTIVE,
];

export type PackageAvailability = {
  packageType: PackageType;
  capacity: number;
  taken: number;
  available: number;
  displayedAvailable: number | null;
};

type TransactionClient = Prisma.TransactionClient;

export async function countPackageOccupancy(
  packageType: PackageType,
  tx: TransactionClient = prisma,
): Promise<number> {
  return tx.lead.count({
    where: {
      requestedPackage: packageType,
      status: { in: POOL_OCCUPYING_STATUSES },
      isDeleted: false,
    },
  });
}

export async function getPackageAvailability(
  packageType: PackageType,
  tx: TransactionClient = prisma,
): Promise<PackageAvailability> {
  const capacity = PACKAGE_CAPACITY[packageType];
  const taken = await countPackageOccupancy(packageType, tx);
  const available = Math.max(0, capacity - taken);

  return {
    packageType,
    capacity,
    taken,
    available,
    displayedAvailable: getDisplayedAvailableSpots(available, packageType),
  };
}

export async function getAllPackagesAvailability(): Promise<
  PackageAvailability[]
> {
  const packageTypes = Object.values(PackageType);

  return Promise.all(
    packageTypes.map((packageType) => getPackageAvailability(packageType)),
  );
}

export class PackagePoolFullError extends Error {
  constructor(public readonly packageType: PackageType) {
    super("PACKAGE_POOL_FULL");
    this.name = "PackagePoolFullError";
  }
}

export async function assertPackageHasCapacity(
  packageType: PackageType,
  tx: TransactionClient = prisma,
): Promise<void> {
  const { available } = await getPackageAvailability(packageType, tx);

  if (available <= 0) {
    throw new PackagePoolFullError(packageType);
  }
}
