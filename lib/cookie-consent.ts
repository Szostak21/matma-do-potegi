export const COOKIE_CONSENT_KEY = "matma_cookie_consent" as const;

export type CookieConsent = "granted" | "denied";

export const COOKIE_CONSENT_CHANGE_EVENT = "matma-cookie-consent-change";

/** Preferencje zgody — 12 miesięcy (spójne z polityką prywatności). */
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseCookieConsent(
  value: string | undefined | null,
): CookieConsent | null {
  if (value === "granted" || value === "denied") {
    return value;
  }

  return null;
}

function writeConsentCookie(consent: CookieConsent): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${COOKIE_CONSENT_KEY}=${consent}; Path=/; Max-Age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearConsentCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${COOKIE_CONSENT_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function readConsentCookie(): CookieConsent | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_KEY}=`));

  if (!match) {
    return null;
  }

  return parseCookieConsent(match.slice(COOKIE_CONSENT_KEY.length + 1));
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
}

/**
 * Jednorazowa migracja: localStorage → cookie preferencji (dla CAPI po stronie serwera).
 * Wywoływać z useEffect — nie z getSnapshot / renderu.
 */
export function syncConsentCookieFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const consent = parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));

  if (consent && readConsentCookie() !== consent) {
    writeConsentCookie(consent);
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  writeConsentCookie(consent);
  window.dispatchEvent(
    new CustomEvent<CookieConsent>(COOKIE_CONSENT_CHANGE_EVENT, {
      detail: consent,
    }),
  );
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "granted";
}

export function resetCookieConsent(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(COOKIE_CONSENT_KEY);
  clearConsentCookie();
  window.dispatchEvent(
    new CustomEvent<CookieConsent | null>(COOKIE_CONSENT_CHANGE_EVENT, {
      detail: null,
    }),
  );
}
