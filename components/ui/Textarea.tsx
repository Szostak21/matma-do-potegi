import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 transition focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-500/20",
        className,
      )}
      {...props}
    />
  );
}
