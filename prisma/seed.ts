import { prisma } from "@/lib/prisma";
import { resetDatabaseToSeedState } from "@/lib/seed";

async function main() {
  await resetDatabaseToSeedState(prisma);
  console.log(
    "Seed completed: 1 teacher, 8 groups (symmetric schedule, max 4 per group)",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
