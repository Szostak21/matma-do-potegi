import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 transition focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-500/20",
        className,
      )}
      {...props}
    />
  );
}
