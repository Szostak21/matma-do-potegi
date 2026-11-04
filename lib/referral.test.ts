import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildReferralUrl,
  captureFirstTouchRefFromSearch,
  clearStoredRef,
  parseRefFromSearch,
  readStoredRef,
  REF_STORAGE_KEY,
  sanitizeRefId,
} from "@/lib/referral";

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  });
}

describe("referral", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts only short alphanumeric ids", () => {
    expect(sanitizeRefId("  abc123  ")).toBe("abc123");
    expect(sanitizeRefId("../etc")).toBeUndefined();
    expect(sanitizeRefId("")).toBeUndefined();
  });

  it("reads ref from a query string", () => {
    expect(parseRefFromSearch("?ref=lead1&utm_source=google")).toBe("lead1");
    expect(parseRefFromSearch("?ref=bad id")).toBeUndefined();
  });

  it("builds a stable referral link", () => {
    expect(buildReferralUrl("abc", "https://www.matmadopotegi.pl/")).toBe(
      "https://www.matmadopotegi.pl/?ref=abc",
    );
  });

  it("keeps the first stored ref", () => {
    installLocalStorage();
    captureFirstTouchRefFromSearch("?ref=first");
    captureFirstTouchRefFromSearch("?ref=second");
    expect(readStoredRef()).toBe("first");
    expect(localStorage.getItem(REF_STORAGE_KEY)).toContain("first");
    clearStoredRef();
    expect(readStoredRef()).toBeUndefined();
  });
});
