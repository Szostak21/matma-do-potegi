"use client";

import type { MouseEvent, ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { getSectionIdFromHref, scrollToSectionId } from "@/lib/scroll";

type SectionLinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "link";
  className?: string;
};

export function SectionLinkButton({
  href,
  children,
  variant,
  className,
}: SectionLinkButtonProps) {
  function handleClick(event: MouseEvent<HTMLElement>) {
    const sectionId = getSectionIdFromHref(href);
    if (!sectionId) {
      return;
    }

    // Poza stroną główną pozwalamy Next.js przejść na "/" z hashem.
    if (window.location.pathname !== "/") {
      return;
    }

    // Na stronie głównej przewijamy ręcznie - działa też, gdy hash już jest
    // ustawiony (natywna nawigacja Next.js pomija wtedy scroll) i uwzględnia
    // wysokość przyklejonego navbara.
    event.preventDefault();
    scrollToSectionId(sectionId);
    window.history.pushState(null, "", `/#${sectionId}`);
  }

  return (
    <Button
      href={href}
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
