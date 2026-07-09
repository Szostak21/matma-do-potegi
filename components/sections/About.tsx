import { BookOpen, MapPin, MessageCircle, Users } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { FeatureItem } from "@/components/ui/FeatureItem";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ABOUT, FEATURES } from "@/lib/content";

const ICON_MAP = {
  Users,
  BookOpen,
  MessageCircle,
  MapPin,
} as const;

export function About() {
  return (
    <Section id="o-nas">
      <Container>
        <SectionHeading
          eyebrow="O nas"
          title={ABOUT.title}
          description={ABOUT.description}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureItem
              key={feature.title}
              icon={ICON_MAP[feature.icon]}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
