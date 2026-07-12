export const COOKIE_CONSENT_KEY = "matma_cookie_consent" as const;

export type CookieConsent = "granted" | "denied";

export const COOKIE_CONSENT_CHANGE_EVENT = "matma-cookie-consent-change";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(COOKIE_CONSENT_KEY);

  if (value === "granted" || value === "denied") {
    return value;
  }

  return null;
}

export function setCookieConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, consent);
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
  window.dispatchEvent(
    new CustomEvent<CookieConsent | null>(COOKIE_CONSENT_CHANGE_EVENT, {
      detail: null,
    }),
  );
}
