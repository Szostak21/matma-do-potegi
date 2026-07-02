import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  variant?: "default" | "deep";
};

export function Section({
  children,
  id,
  className,
  variant = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-28",
        variant === "deep" && "bg-cream-deep",
        className,
      )}
    >
      {children}
    </section>
  );
}
