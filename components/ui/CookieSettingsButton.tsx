"use client";

import { resetCookieConsent } from "@/lib/cookie-consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => resetCookieConsent()}
      className="text-left text-sm text-ink/60 transition hover:text-ink"
    >
      Ustawienia plików cookies
    </button>
  );
}
