import { describe, expect, it } from "vitest";

import {
  assertSafePrismaCli,
  isLocalDatabaseUrl,
  isProductionDatabase,
} from "@/lib/db-guard";

const local = {
  DATABASE_URL:
    "postgresql://postgres:postgres@localhost:5432/postgres?schema=matma",
  DIRECT_URL:
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=matma",
};

const remote = {
  DATABASE_URL:
    "postgresql://postgres.example:secret@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
  DIRECT_URL:
    "postgresql://postgres.example:secret@aws-1-eu-west-1.pooler.supabase.com:5432/postgres",
};

describe("db guard", () => {
  it("treats localhost as safe when no marker is configured", () => {
    expect(isLocalDatabaseUrl(local.DATABASE_URL)).toBe(true);
    expect(isProductionDatabase(local)).toBe(false);
    expect(isProductionDatabase({})).toBe(false);
  });

  it("fails safe: any remote database is production when markers are unset", () => {
    expect(isProductionDatabase(remote)).toBe(true);
    expect(() => assertSafePrismaCli(["migrate", "reset"], remote)).toThrow(
      /zablokowane/,
    );
    expect(() => assertSafePrismaCli(["db", "push"], remote)).toThrow(
      /zablokowane/,
    );
    expect(() => assertSafePrismaCli(["migrate", "dev"], remote)).toThrow(
      /zablokowane/,
    );
  });

  it("still allows deploy and create-only migrations on production", () => {
    expect(() =>
      assertSafePrismaCli(["migrate", "deploy"], remote),
    ).not.toThrow();
    expect(() =>
      assertSafePrismaCli(["migrate", "dev", "--create-only"], remote),
    ).not.toThrow();
  });

  it("uses PROTECTED_DB_MARKERS when they are set", () => {
    expect(
      isProductionDatabase({
        ...local,
        PROTECTED_DB_MARKERS: "localhost",
      }),
    ).toBe(true);
    expect(
      isProductionDatabase({
        ...remote,
        PROTECTED_DB_MARKERS: "some-other-project",
      }),
    ).toBe(false);
  });

  it("does not block a local reset", () => {
    expect(() =>
      assertSafePrismaCli(["migrate", "reset"], local),
    ).not.toThrow();
  });
});
