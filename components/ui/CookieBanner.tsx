"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

function subscribeToConsentChanges(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

export function CookieBanner() {
  const consent = useSyncExternalStore(
    subscribeToConsentChanges,
    getCookieConsent,
    () => "denied" as CookieConsent,
  );

  function handleChoice(choice: CookieConsent) {
    setCookieConsent(choice);
  }

  if (consent !== null) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-description"
      suppressHydrationWarning
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-cream/95 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3",
          "sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-2.5",
        )}
      >
        <p
          id="cookie-banner-description"
          className="min-w-0 text-xs leading-snug text-ink/70 sm:text-sm sm:leading-normal"
        >
          Używamy niezbędnych plików cookies oraz - za Twoją zgodą -
          analitycznych (Google Analytics 4) i marketingowych (Meta Pixel).{" "}
          <Link
            href="/polityka-prywatnosci"
            className="font-medium text-olive-800 underline-offset-2 hover:underline"
          >
            Polityka prywatności
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="inline-flex items-center justify-center rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-medium text-ink transition hover:bg-ink/5 sm:px-4 sm:py-2 sm:text-sm"
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="inline-flex items-center justify-center rounded-full bg-olive-700 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-olive-800 sm:px-4 sm:py-2 sm:text-sm"
          >
            Akceptuj wszystkie
          </button>
        </div>
      </div>
    </div>
  );
}
