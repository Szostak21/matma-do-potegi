"use client";

import { useEffect } from "react";

import { trackContact } from "@/lib/analytics-events";

/**
 * Globalny, delegowany listener na kliknięcia w linki tel:/mailto:.
 * Montowany tylko przy zgodzie (w obrębie <Analytics/>), więc nie trzeba
 * przerabiać wielu komponentów na klienckie. Wysyła Contact/contact.
 */
export function ContactLinkTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";

      if (href.startsWith("tel:")) {
        trackContact("phone");
      } else if (href.startsWith("mailto:")) {
        trackContact("email");
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
