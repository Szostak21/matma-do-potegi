import { PackageType } from "@prisma/client";

import { PACKAGES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

async function main() {
  const teacher = await prisma.teacher.upsert({
    where: { id: "seed-teacher" },
    update: { name: "Właściciel" },
    create: {
      id: "seed-teacher",
      name: "Właściciel",
    },
  });

  const groups = [
    {
      name: PACKAGES.MATURA_ROZSZERZONA.name,
      packageType: PackageType.MATURA_ROZSZERZONA,
      scheduleSlot: "Wtorek 17:00",
      priceMonthly: PACKAGES.MATURA_ROZSZERZONA.priceMonthly,
    },
    {
      name: PACKAGES.MATURA_PODSTAWOWA.name,
      packageType: PackageType.MATURA_PODSTAWOWA,
      scheduleSlot: "Czwartek 18:00",
      priceMonthly: PACKAGES.MATURA_PODSTAWOWA.priceMonthly,
    },
  ];

  for (const group of groups) {
    await prisma.group.upsert({
      where: {
        id: `seed-${group.packageType.toLowerCase()}`,
      },
      update: {
        name: group.name,
        scheduleSlot: group.scheduleSlot,
        priceMonthly: group.priceMonthly,
        teacherId: teacher.id,
      },
      create: {
        id: `seed-${group.packageType.toLowerCase()}`,
        name: group.name,
        packageType: group.packageType,
        scheduleSlot: group.scheduleSlot,
        priceMonthly: group.priceMonthly,
        teacherId: teacher.id,
      },
    });
  }

  console.log("Seed completed: 1 teacher, 2 groups");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
