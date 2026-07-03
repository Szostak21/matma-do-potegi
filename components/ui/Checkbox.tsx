import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 shrink-0 rounded-md border border-ink/20 bg-white text-olive-700 accent-olive-700 transition focus:outline-none focus:ring-2 focus:ring-olive-500/20",
        className,
      )}
      {...props}
    />
  );
}
