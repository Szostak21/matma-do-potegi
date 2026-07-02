import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/70 p-8 shadow-soft ring-1 ring-ink/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
