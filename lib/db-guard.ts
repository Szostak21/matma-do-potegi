import type { PrismaClient } from "@prisma/client";

const DESTRUCTIVE_SQL =
  /\b(truncate|drop\s+table|drop\s+schema|delete\s+from)\b/i;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export type DatabaseEnv = {
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  PROTECTED_DB_MARKERS?: string;
};

function currentDatabaseEnv(): DatabaseEnv {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    PROTECTED_DB_MARKERS: process.env.PROTECTED_DB_MARKERS,
  };
}

/** Comma-separated fragments from `PROTECTED_DB_MARKERS` (for example a project ref). */
export function protectedDbMarkers(
  env: DatabaseEnv = currentDatabaseEnv(),
): string[] {
  return (env.PROTECTED_DB_MARKERS ?? "")
    .split(",")
    .map((marker) => marker.trim())
    .filter(Boolean);
}

function connectionStrings(env: DatabaseEnv): string[] {
  return [
    env.DATABASE_URL,
    env.DIRECT_URL,
    env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter((value): value is string => Boolean(value && value.trim()));
}

/** True when the URL host is this machine. Unparseable strings are treated as remote. */
export function isLocalDatabaseUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const normalized = trimmed.replace(/^postgres(ql)?:\/\//i, "http://");
    const host = new URL(normalized).hostname.replace(/^\[|\]$/g, "");
    return LOCAL_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * A database is production when a configured marker matches, or — if no markers
 * are set — when any connection string points off localhost. Missing config is
 * not production. The default is stricter than a marker allow-list.
 */
export function isProductionDatabase(
  env: DatabaseEnv = currentDatabaseEnv(),
): boolean {
  const urls = connectionStrings(env);
  const blob = urls.join(" ");
  const markers = protectedDbMarkers(env);

  if (markers.length > 0) {
    return markers.some((marker) => blob.includes(marker));
  }

  return urls.some((url) => !isLocalDatabaseUrl(url));
}

export function assertSafePrismaCli(
  args: string[],
  env: DatabaseEnv = currentDatabaseEnv(),
): void {
  if (!isProductionDatabase(env)) {
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
