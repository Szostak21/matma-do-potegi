import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed";

async function main() {
  await runSeed(prisma);
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
