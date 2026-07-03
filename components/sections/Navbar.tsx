"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/content";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-ink"
          >
            Matma do potęgi
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink/70 transition hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button href="/#zapis" variant="primary">
              Zapisz się
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-ink md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 md:hidden",
            mobileOpen ? "max-h-96 pb-6" : "max-h-0",
          )}
        >
          <nav className="flex flex-col gap-4 border-t border-ink/5 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink/70 transition hover:text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/#zapis" variant="primary" className="w-full">
              Zapisz się
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
