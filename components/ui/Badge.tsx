import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
