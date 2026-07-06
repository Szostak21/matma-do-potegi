import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, FOOTER } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-cream py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-serif text-xl text-ink">{FOOTER.brand}</p>
            <p className="mt-2 text-sm text-ink/60">{FOOTER.location}</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                Dokumenty
              </p>
              {FOOTER.legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink/60 transition hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm text-ink/60">
              <Link
                href={`mailto:${FOOTER.email}`}
                className="transition hover:text-ink"
              >
                {FOOTER.email}
              </Link>
              <Link
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="transition hover:text-ink"
              >
                {CONTACT_PHONE}
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 border-t border-ink/5 pt-8 text-xs text-ink/40">
          {FOOTER.copyright}
        </p>
      </Container>
    </footer>
  );
}
