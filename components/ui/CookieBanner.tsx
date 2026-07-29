"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

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

  useEffect(() => {
    if (consent !== null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [consent]);

  if (consent !== null) {
    return null;
  }

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        "bg-black/30 backdrop-blur-sm",
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        className={cn(
          "w-full max-w-md rounded-3xl border border-ink/10 bg-cream p-6 shadow-soft",
          "sm:p-8",
        )}
      >
        <h2
          id="cookie-banner-title"
          className="font-serif text-2xl leading-tight text-ink sm:text-3xl"
        >
          Cenimy Twoją prywatność
        </h2>

        <p
          id="cookie-banner-description"
          className="mt-3 text-sm leading-relaxed text-ink/70"
        >
          Używamy niezbędnych plików cookies oraz - za Twoją zgodą -
          analitycznych (Google Analytics 4, Microsoft Clarity) i marketingowych
          (Meta Pixel i pomiar konwersji Meta), aby lepiej rozumieć, jak
          korzystasz ze strony.{" "}
          <Link
            href="/polityka-prywatnosci"
            className="font-medium text-olive-800 underline-offset-2 hover:underline"
          >
            Polityka prywatności
          </Link>
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handleChoice("denied")}
            className="inline-flex w-full items-center justify-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink/5 sm:w-auto"
          >
            Tylko niezbędne
          </button>
          <button
            type="button"
            onClick={() => handleChoice("granted")}
            className="inline-flex w-full flex-1 items-center justify-center rounded-full bg-olive-700 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-olive-800"
          >
            Akceptuj wszystkie
          </button>
        </div>
      </div>
    </div>
  );
}
