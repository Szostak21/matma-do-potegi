import type { PrismaClient } from "@prisma/client";

/** Project-ref produkcyjnego Supabase — `.env` wskazuje na tę bazę. */
export const PRODUCTION_DB_MARKERS = ["kqhtwmzrpbsxvlycnfgd"] as const;

const DESTRUCTIVE_SQL =
  /\b(truncate|drop\s+table|drop\s+schema|delete\s+from)\b/i;

export function isProductionDatabase(): boolean {
  const blob = [
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].join(" ");

  return PRODUCTION_DB_MARKERS.some((marker) => blob.includes(marker));
}

export function assertSafePrismaCli(args: string[]): void {
  if (!isProductionDatabase()) {
    return;
  }

  const joined = args.join(" ");
  const forbidden =
    /\bmigrate\s+reset\b/.test(joined) ||
    /\bdb\s+seed\b/.test(joined) ||
    /\bdb\s+push\b/.test(joined) ||
    (/\bmigrate\s+dev\b/.test(joined) && !joined.includes("--create-only"));

  if (forbidden) {
    throw new Error(
      "Odmowa: to polecenie Prisma jest zablokowane na bazie produkcyjnej. " +
        "Użyj `npm run db:deploy` (migrate deploy) albo osobnego projektu Supabase.",
    );
  }
}

function sqlFromRawArgs(args: unknown): string {
  if (typeof args === "string") {
    return args;
  }

  if (args && typeof args === "object") {
    const record = args as { query?: unknown; strings?: unknown };
    if (typeof record.query === "string") {
      return record.query;
    }
    if (Array.isArray(record.strings)) {
      return record.strings.join(" ");
    }
  }

  return String(args ?? "");
}

/**
 * Blokuje masowe kasowanie (ten sam wzorzec co usunięty seed)
 * niezależnie od tego, czy skrypt świadomie celuje w produkcję.
 */
export function attachWipeGuard(client: PrismaClient): PrismaClient {
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        if (operation === "deleteMany") {
          throw new Error(
            `deleteMany(${model ?? "?"}) jest zablokowane — produkcyjna baza nie może być czyszczona skryptem.`,
          );
        }

        if (operation === "executeRaw" || operation === "executeRawUnsafe") {
          const sql = sqlFromRawArgs(args);
          if (DESTRUCTIVE_SQL.test(sql)) {
            throw new Error(
              "Surowy SQL DELETE/TRUNCATE/DROP jest zablokowany na kliencie Prisma.",
            );
          }
        }

        return query(args);
      },
    },
  }) as unknown as PrismaClient;
}
