import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink transition focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
