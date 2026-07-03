"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { getSectionIdFromHref, scrollToSectionId } from "@/lib/scroll";

export function HashScrollOnLoad() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sectionId = getSectionIdFromHref(window.location.hash);
    if (!sectionId) {
      return;
    }

    const scroll = () => scrollToSectionId(sectionId, "auto");

    scroll();
    const timeoutId = window.setTimeout(scroll, 150);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
