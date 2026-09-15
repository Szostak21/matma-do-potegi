import { MessageChannel, PackageType } from "@prisma/client";

import { DEPOSIT_AMOUNT_GROSZE, PACKAGES } from "@/lib/constants";
import type { PrismaClient } from "@prisma/client";

const SEED_GROUPS = [
  {
    id: "seed-osmoklasista-g1",
    name: "Ósmoklasista G1",
    packageType: PackageType.OSMOKLASISTA,
    scheduleSlot: "Poniedziałek 16:00-17:30",
  },
  {
    id: "seed-matura_rozszerzona-g1",
    name: "Rozszerzona G1",
    packageType: PackageType.MATURA_ROZSZERZONA,
    scheduleSlot: "Poniedziałek 18:00-20:00",
  },
  {
    id: "seed-matura_podstawowa-g1",
    name: "Podstawowa G1",
    packageType: PackageType.MATURA_PODSTAWOWA,
    scheduleSlot: "Wtorek 16:00-17:30",
  },
  {
    id: "seed-matura_rozszerzona-g2",
    name: "Rozszerzona G2",
    packageType: PackageType.MATURA_ROZSZERZONA,
    scheduleSlot: "Wtorek 18:00-20:00",
  },
  {
    id: "seed-osmoklasista-g2",
    name: "Ósmoklasista G2",
    packageType: PackageType.OSMOKLASISTA,
    scheduleSlot: "Środa 16:00-17:30",
  },
  {
    id: "seed-matura_rozszerzona-g3",
    name: "Rozszerzona G3",
    packageType: PackageType.MATURA_ROZSZERZONA,
    scheduleSlot: "Środa 18:00-20:00",
  },
  {
    id: "seed-matura_podstawowa-g2",
    name: "Podstawowa G2",
    packageType: PackageType.MATURA_PODSTAWOWA,
    scheduleSlot: "Czwartek 16:00-17:30",
  },
  {
    id: "seed-matura_rozszerzona-g4",
    name: "Rozszerzona G4",
    packageType: PackageType.MATURA_ROZSZERZONA,
    scheduleSlot: "Czwartek 18:00-20:00",
  },
] as const;

/** Szablony SMS na start — edytowalne z panelu Płatności. */
const SEED_MESSAGE_TEMPLATES = [
  {
    id: "seed-template-tuition-standard",
    name: "Czesne — standard",
    body: "Dzień dobry! Czesne za {miesiac} dla {imie} wynosi {kwota}. Płatność: {link} Termin: {termin}. Matma do potęgi",
    isDefault: true,
    sortOrder: 0,
  },
  {
    id: "seed-template-tuition-first-month",
    name: "Czesne — pierwszy miesiąc ze zniżką",
    body: "Dzień dobry! Czesne za {miesiac} dla {imie} to {kwota} (uwzględniliśmy już zaliczkę i zniżki). Płatność: {link} Matma do potęgi",
    isDefault: false,
    sortOrder: 1,
  },
  {
    id: "seed-template-tuition-reminder",
    name: "Czesne — przypomnienie",
    body: "Dzień dobry! Przypominamy o czesnym za {miesiac} dla {imie} — {kwota}. Płatność: {link} Dziękujemy! Matma do potęgi",
    isDefault: false,
    sortOrder: 2,
  },
] as const;

function getPriceMonthly(packageType: PackageType): number {
  switch (packageType) {
    case PackageType.MATURA_ROZSZERZONA:
      return PACKAGES.MATURA_ROZSZERZONA.priceMonthly;
    case PackageType.MATURA_PODSTAWOWA:
      return PACKAGES.MATURA_PODSTAWOWA.priceMonthly;
    case PackageType.OSMOKLASISTA:
      return PACKAGES.OSMOKLASISTA.priceMonthly;
    case PackageType.INDYWIDUALNE:
      return PACKAGES.INDYWIDUALNE.priceHourly;
    default:
      return 0;
  }
}

export async function runSeed(prisma: PrismaClient): Promise<void> {
  const teacher = await prisma.teacher.upsert({
    where: { id: "seed-teacher" },
    update: { name: "Właściciel" },
    create: {
      id: "seed-teacher",
      name: "Właściciel",
    },
  });

  for (const group of SEED_GROUPS) {
    await prisma.group.upsert({
      where: { id: group.id },
      update: {
        name: group.name,
        packageType: group.packageType,
        scheduleSlot: group.scheduleSlot,
        priceMonthly: getPriceMonthly(group.packageType),
        teacherId: teacher.id,
        currentCount: 0,
        maxCapacity: 8,
        depositAmount: DEPOSIT_AMOUNT_GROSZE,
      },
      create: {
        id: group.id,
        name: group.name,
        packageType: group.packageType,
        scheduleSlot: group.scheduleSlot,
        priceMonthly: getPriceMonthly(group.packageType),
        teacherId: teacher.id,
        maxCapacity: 8,
        depositAmount: DEPOSIT_AMOUNT_GROSZE,
      },
    });
  }

  for (const template of SEED_MESSAGE_TEMPLATES) {
    // Tylko `create` — nie nadpisujemy treści, którą właściciel dostosował w panelu.
    await prisma.messageTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        id: template.id,
        name: template.name,
        channel: MessageChannel.SMS,
        body: template.body,
        isDefault: template.isDefault,
        sortOrder: template.sortOrder,
      },
    });
  }
}

export async function resetDatabaseToSeedState(
  prisma: PrismaClient,
): Promise<void> {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.tuitionPeriod.deleteMany(),
    prisma.messageTemplate.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.group.deleteMany(),
    prisma.user.deleteMany(),
    prisma.teacher.deleteMany(),
  ]);

  await runSeed(prisma);
}
