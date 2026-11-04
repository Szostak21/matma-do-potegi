import { afterEach, describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
  verifySharedSecret,
} from "@/lib/auth";

describe("admin session", () => {
  const previous = process.env.ADMIN_SECRET;

  afterEach(() => {
    process.env.ADMIN_SECRET = previous;
  });

  it("accepts only the configured password", () => {
    process.env.ADMIN_SECRET = "a+b";
    expect(verifyAdminPassword("a+b")).toBe(true);
    expect(verifyAdminPassword("a b")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);

    delete process.env.ADMIN_SECRET;
    expect(verifyAdminPassword("a+b")).toBe(false);
  });

  it("round-trips a signed cookie and rejects tampering and expiry", () => {
    const now = Date.UTC(2026, 0, 1);
    const token = createAdminSessionToken(now, "session-secret");

    expect(verifyAdminSessionToken(token, now + 1000, "session-secret")).toBe(
      true,
    );
    expect(verifyAdminSessionToken(token, now + 1000, "other")).toBe(false);
    expect(
      verifyAdminSessionToken(
        token.slice(0, -1) + (token.endsWith("a") ? "b" : "a"),
        now,
        "session-secret",
      ),
    ).toBe(false);
    expect(
      verifyAdminSessionToken(
        token,
        now + 1000 * 60 * 60 * 24 * 20,
        "session-secret",
      ),
    ).toBe(false);
    expect(verifySharedSecret("cron", "cron")).toBe(true);
    expect(verifySharedSecret("cron", "other")).toBe(false);
  });
});
