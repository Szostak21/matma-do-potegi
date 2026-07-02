import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";

type FeatureItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <Card className="h-full">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
        <Icon className="size-6" strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">{description}</p>
    </Card>
  );
}
