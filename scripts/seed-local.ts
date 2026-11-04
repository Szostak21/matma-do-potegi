/**
 * Demo data for screenshots and manual testing.
 */
import { readFileSync } from "node:fs";

import { PrismaClient, PackageType, LeadStatus } from "@prisma/client";

function loadDotEnv(): void {
  try {
    const text = readFileSync(".env", "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      if (process.env[key]) continue;
      let value = trimmed.slice(eq + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // The caller can export DATABASE_URL instead.
  }
}

function assertLocalhost(name: string, value: string | undefined): void {
  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  let host = "";
  try {
    host = new URL(value.replace(/^postgres(ql)?:\/\//i, "http://")).hostname;
  } catch {
    throw new Error(`${name} is not a valid URL.`);
  }

  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(
      `${name} host is "${host}". This script only runs against localhost.`,
    );
  }
}

loadDotEnv();
assertLocalhost("DATABASE_URL", process.env.DATABASE_URL);
assertLocalhost("DIRECT_URL", process.env.DIRECT_URL);

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.payment.deleteMany();
  await prisma.tuitionPeriod.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.group.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.teacher.create({
    data: { name: "Anna Example" },
  });

  const extended = await prisma.group.create({
    data: {
      name: "Rozszerzenie — poniedziałek",
      packageType: PackageType.MATURA_ROZSZERZONA,
      scheduleSlot: "poniedziałek 16:00",
      maxCapacity: 8,
      currentCount: 1,
      priceMonthly: 46000,
      depositAmount: 5000,
      teacherId: teacher.id,
    },
  });

  await prisma.group.create({
    data: {
      name: "Podstawa — środa",
      packageType: PackageType.MATURA_PODSTAWOWA,
      scheduleSlot: "środa 17:00",
      maxCapacity: 8,
      currentCount: 0,
      priceMonthly: 34000,
      depositAmount: 5000,
      teacherId: teacher.id,
    },
  });

  const active = await prisma.lead.create({
    data: {
      parentName: "Ewa Kowalska",
      studentName: "Anna Kowalska",
      phoneNumber: "+48 500 000 001",
      email: "ewa.kowalska@example.com",
      requestedPackage: PackageType.MATURA_ROZSZERZONA,
      schoolClass: "4 LO",
      status: LeadStatus.ACTIVE,
      groupId: extended.id,
      firstMonthPaid: true,
      standingDiscountGrosze: 0,
    },
  });

  await prisma.lead.create({
    data: {
      parentName: "Jan Nowak",
      studentName: "Piotr Nowak",
      phoneNumber: "+48 500 000 002",
      email: "jan.nowak@example.com",
      requestedPackage: PackageType.MATURA_PODSTAWOWA,
      schoolClass: "3 LO",
      status: LeadStatus.PENDING_DEPOSIT,
    },
  });

  await prisma.lead.create({
    data: {
      parentName: "Maria Wiśniewska",
      studentName: "Zosia Wiśniewska",
      phoneNumber: "+48 500 000 003",
      email: "maria.wisniewska@example.com",
      requestedPackage: PackageType.OSMOKLASISTA,
      schoolClass: "8",
      status: LeadStatus.PAID_DEPOSIT,
      referredById: active.id,
      firstMonthDiscountGrosze: 5000,
    },
  });

  const month = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  );

  await prisma.tuitionPeriod.create({
    data: {
      leadId: active.id,
      periodMonth: month,
      baseAmountGrosze: 46000,
      discountGrosze: 0,
      amountDueGrosze: 46000,
      amountPaidGrosze: 0,
      transferTitle: `MDP demo ${active.id.slice(0, 8)}`,
    },
  });

  await prisma.messageTemplate.create({
    data: {
      name: "Czesne",
      body: "Dzień dobry! Czesne za {miesiac} dla {imie} wynosi {kwota}. Płatność: {link}",
      isDefault: true,
      sortOrder: 0,
    },
  });

  console.log("Local demo data ready. Log in at http://localhost:3000/admin");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
