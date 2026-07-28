import { Card } from "@/components/ui/Card";
import { SectionLinkButton } from "@/components/ui/SectionLinkButton";
import { cn } from "@/lib/cn";

export type PricingCardProps = {
  name: string;
  price: string;
  period: string;
  features: readonly string[];
  highlighted?: boolean;
  ctaHref?: string;
};

export function PricingCard({
  name,
  price,
  period,
  features,
  highlighted = false,
  ctaHref = "/#zapisy",
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        highlighted && "ring-2 ring-olive-600/30 bg-white",
      )}
    >
      {highlighted && (
        <span className="mb-4 inline-flex w-fit rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-800">
          Najpopularniejszy
        </span>
      )}
      <h3 className="font-serif text-2xl text-ink">{name}</h3>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="font-serif text-4xl text-ink">{price}</span>
        <span className="text-sm text-ink/60">{period}</span>
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-ink/70">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-olive-600" />
            {feature}
          </li>
        ))}
      </ul>
      <SectionLinkButton
        href={ctaHref}
        variant={highlighted ? "primary" : "secondary"}
        className="mt-8 w-full"
      >
        Zapisz się
      </SectionLinkButton>
    </Card>
  );
}
