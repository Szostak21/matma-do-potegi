import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBentoGrid } from "@/components/ui/HeroBentoGrid";
import { HERO } from "@/lib/content";

export function Hero() {
  return (
    <section className="overflow-hidden py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <Badge>{HERO.badge}</Badge>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              {HERO.title}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-ink/70 sm:text-lg">
              {HERO.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={HERO.primaryCta.href} variant="primary">
                {HERO.primaryCta.label}
              </Button>
              <Button href={HERO.secondaryCta.href} variant="secondary">
                {HERO.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className="min-w-0">
            <HeroBentoGrid />
          </div>
        </div>
      </Container>
    </section>
  );
}
