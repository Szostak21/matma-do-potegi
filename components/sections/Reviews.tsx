import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REVIEWS } from "@/lib/content";

export function Reviews() {
  return (
    <Section id="opinie" variant="deep">
      <Container>
        <SectionHeading
          eyebrow="Opinie"
          title="Co mówią rodzice i uczniowie"
          description="Zaufanie budujemy wynikami i relacją — oto kilka opinii z naszych grup."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <Card key={review.author} className="flex h-full flex-col">
              <p className="flex-1 text-sm leading-relaxed text-ink/70">
                &ldquo;{review.quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-ink/5 pt-4">
                <p className="font-medium text-ink">{review.author}</p>
                <p className="text-sm text-ink/50">{review.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
