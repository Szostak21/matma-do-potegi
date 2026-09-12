import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TEACHERS, TEACHERS_SECTION } from "@/lib/content";

export function Teachers() {
  return (
    <Section id="nauczyciele" variant="deep">
      <Container>
        <SectionHeading
          eyebrow={TEACHERS_SECTION.eyebrow}
          title={TEACHERS_SECTION.title}
          description={TEACHERS_SECTION.description}
          align="center"
          className="mx-auto"
        />
        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr_auto_auto]">
          {TEACHERS.map((teacher) => (
            <Card
              key={teacher.name}
              className="flex flex-col gap-6 p-6 sm:p-8 lg:row-span-4 lg:grid lg:grid-rows-subgrid"
            >
              <div className="flex items-center gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-olive-200 ring-2 ring-olive-200 sm:size-24">
                  <Image
                    src={teacher.image}
                    alt={`${teacher.name} - nauczyciel matematyki`}
                    fill
                    sizes="(max-width: 640px) 80px, 96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl text-ink">
                    {teacher.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60">{teacher.role}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-ink/70">
                {teacher.description}
              </p>

              <ul className="space-y-3">
                {teacher.experience.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink/70"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-olive-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                  Prowadzi:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {teacher.focus.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-ink/70"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-olive-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
