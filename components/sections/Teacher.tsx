import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IMAGE_ASSETS } from "@/lib/assets";
import { TEACHER } from "@/lib/content";

export function Teacher() {
  return (
    <Section id="nauczyciel" variant="deep">
      <Container>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="shrink-0 self-center lg:self-auto lg:pt-2">
            <div className="relative size-24 overflow-hidden rounded-full bg-olive-200 shadow-soft ring-2 ring-olive-200 sm:size-28 lg:size-32">
              <Image
                src={IMAGE_ASSETS.teacher.portrait}
                alt={`${TEACHER.title} - nauczyciel matematyki`}
                fill
                sizes="(max-width: 640px) 96px, (max-width: 1024px) 112px, 128px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
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
