import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TEACHER } from "@/lib/content";

export function Teacher() {
  return (
    <Section id="nauczyciel" variant="deep">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-olive-200 shadow-soft ring-1 ring-ink/5">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink/70 backdrop-blur-sm">
                Zdjęcie nauczyciela
              </span>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Nauczyciel"
              title={TEACHER.title}
              description={TEACHER.description}
            />
            <ul className="mt-8 space-y-3">
              {TEACHER.experience.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-ink/70"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-olive-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
