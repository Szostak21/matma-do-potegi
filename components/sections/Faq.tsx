import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_ITEMS } from "@/lib/content";

export function Faq() {
  return (
    <Section id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Najczęściej zadawane pytania"
            description="Nie znalazłeś odpowiedzi? Napisz do nas przez formularz zapisu — chętnie wszystko wyjaśnimy."
          />
          <Accordion items={[...FAQ_ITEMS]} />
        </div>
      </Container>
    </Section>
  );
}
