import { Container } from "@/components/ui/Container";
import { PricingCard } from "@/components/ui/PricingCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRICING } from "@/lib/content";

export function Pricing() {
  return (
    <Section id="oferta">
      <Container>
        <SectionHeading
          eyebrow="Oferta"
          title="Cennik dopasowany do Twoich celów"
          description="Jasne zasady i kompletny system nauki. Każdy pakiet grupowy obejmuje starannie dobrane materiały, egzaminy próbne oraz stałe wsparcie."
          align="center"
          className="mx-auto"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PRICING.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              highlighted={plan.highlighted}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
