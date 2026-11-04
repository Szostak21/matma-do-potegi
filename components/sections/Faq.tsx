import Link from "next/link";

import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT_PHONE_TEL, FAQ_ITEMS, FOOTER } from "@/lib/content";

export function Faq() {
  return (
    <Section id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Najczęściej zadawane pytania"
            description={
              <>
                Nie znalazłeś odpowiedzi?{" "}
                <Link
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  className="font-medium text-olive-800 underline-offset-4 hover:underline"
                >
                  Zadzwoń do nas
                </Link>{" "}
                lub napisz na{" "}
                <Link
                  href={`mailto:${FOOTER.email}`}
                  className="font-medium text-olive-800 underline-offset-4 hover:underline"
                >
                  {FOOTER.email}
                </Link>{" "}
                - chętnie rozwiejemy wszystkie wątpliwości.
              </>
            }
          />
          <Accordion items={[...FAQ_ITEMS]} />
        </div>
      </Container>
    </Section>
  );
}
