/**
 * Client-safe helpers for ?ref= (localStorage, 30-day TTL).
 * Server-only resolve lives in lib/referral-server.ts.
 */

export const REF_STORAGE_KEY = "matma_referral_ref";
export const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REF_QUERY_PARAM = "ref";

const MAX_REF_ID_LENGTH = 40;

type StoredRef = {
  id: string;
  savedAt: number;
};

export function sanitizeRefId(
  value: string | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().slice(0, MAX_REF_ID_LENGTH);
  if (!/^[a-z0-9]+$/i.test(trimmed)) {
    return undefined;
  }

  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseRefFromSearch(search: string): string | undefined {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return sanitizeRefId(params.get(REF_QUERY_PARAM));
}

/** First-touch: nie nadpisuj ważnego ref w localStorage. */
export function captureFirstTouchRefFromSearch(search: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const id = parseRefFromSearch(search);
  if (!id) {
    return;
  }

  try {
    const existing = readStoredRef();
    if (existing) {
      return;
    }

    const payload: StoredRef = { id, savedAt: Date.now() };
    localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage niedostępny
  }
}

export function readStoredRef(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed?.id || typeof parsed.savedAt !== "number") {
      clearStoredRef();
      return undefined;
    }

    if (Date.now() - parsed.savedAt > REF_TTL_MS) {
      clearStoredRef();
      return undefined;
    }

    return sanitizeRefId(parsed.id);
  } catch {
    return undefined;
  }
}

export function clearStoredRef(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function buildReferralUrl(leadId: string, appBaseUrl: string): string {
  const base = appBaseUrl.replace(/\/$/, "");
  return `${base}/?${REF_QUERY_PARAM}=${encodeURIComponent(leadId)}`;
}
