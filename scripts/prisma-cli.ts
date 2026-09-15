import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { assertSafePrismaCli } from "@/lib/db-guard";

function loadDotEnv(): void {
  if (process.env.DATABASE_URL) {
    return;
  }

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
    // Brak .env — polegamy na środowisku (np. Vercel).
  }
}

loadDotEnv();

const prismaArgs = process.argv.slice(2);

try {
  assertSafePrismaCli(prismaArgs);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...prismaArgs], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);

