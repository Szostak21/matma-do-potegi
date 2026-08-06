"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/content";
import { getSectionIdFromHref, scrollToSectionId } from "@/lib/scroll";
import { cn } from "@/lib/cn";

const MOBILE_MENU_CLOSE_MS = 320;
const MD_MIN_WIDTH = "(min-width: 768px)";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Backdrop click / Escape / resize→desktop: zamykanie.
  // Body scroll lock: żeby scroll strony pod menu nie „uciekał”.
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarGap > 0) {
      body.style.paddingRight = `${scrollbarGap}px`;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    function onResize() {
      if (window.matchMedia(MD_MIN_WIDTH).matches) {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  const handleSectionLinkClick = useCallback(
    (event: MouseEvent<HTMLElement>, href: string) => {
      const sectionId = getSectionIdFromHref(href);
      if (!sectionId) {
        return;
      }

      const isHome = window.location.pathname === "/";

      const scrollToSection = () => {
        if (!isHome) {
          window.location.href = href;
          return;
        }

        scrollToSectionId(sectionId);
        window.history.pushState(null, "", `/#${sectionId}`);
      };

      if (mobileOpen) {
        event.preventDefault();
        setMobileOpen(false);
        window.setTimeout(scrollToSection, MOBILE_MENU_CLOSE_MS);
        return;
      }

      if (isHome) {
        event.preventDefault();
        scrollToSection();
      }
    },
    [mobileOpen],
  );

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const isHome = window.location.pathname === "/";

      const scrollToTop = () => {
        if (!isHome) {
          window.location.href = "/";
          return;
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      };

      if (mobileOpen) {
        event.preventDefault();
        setMobileOpen(false);
        window.setTimeout(scrollToTop, MOBILE_MENU_CLOSE_MS);
        return;
      }

      if (isHome) {
        event.preventDefault();
        scrollToTop();
      }
    },
    [mobileOpen],
  );

  const backdrop =
    portalReady && mobileOpen
      ? createPortal(
          <button
            type="button"
            tabIndex={-1}
            aria-label="Zamknij menu"
            className="fixed inset-0 z-40 cursor-default bg-ink/25 md:hidden"
            onClick={closeMobileMenu}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {backdrop}
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/80 backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-ink"
              onClick={handleLogoClick}
            >
              Matma do potęgi
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink/70 transition hover:text-ink"
                  onClick={(event) => handleSectionLinkClick(event, link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:block">
              <Button
                href="/#zapisy"
                variant="primary"
                onClick={(event) => handleSectionLinkClick(event, "/#zapisy")}
              >
                Zapisz się
              </Button>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-ink md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Zamknij menu" : "Otwórz menu"}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>

          <div
            id="mobile-nav"
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
                  onClick={(event) => {
                    handleSectionLinkClick(event, link.href);
                    if (!mobileOpen) {
                      setMobileOpen(false);
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                href="/#zapisy"
                variant="primary"
                className="w-full"
                onClick={(event) => handleSectionLinkClick(event, "/#zapisy")}
              >
                Zapisz się
              </Button>
            </nav>
          </div>
        </Container>
      </header>
    </>
  );
}
