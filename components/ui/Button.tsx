import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "link";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink/90",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5",
  link: "inline-flex items-center gap-1 text-sm font-medium text-ink underline-offset-4 hover:underline",
};

export function Button({
  children,
  variant = "primary",
  href,
  className,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(variantClasses[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
