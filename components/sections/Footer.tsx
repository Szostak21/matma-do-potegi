import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { LogoImage } from "@/components/ui/Logo";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, FOOTER } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-cream py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <LogoImage className="h-10" />
            <p className="mt-3 text-sm text-ink/60">{FOOTER.location}</p>
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

        <p className="mt-8 border-t border-ink/5 pt-8 text-xs text-ink/40">
          {FOOTER.copyright}
        </p>
      </Container>
    </footer>
  );
}
