import Link from "next/link";

import { Checkbox } from "@/components/ui/Checkbox";
import { TERMS } from "@/lib/content";
import { cn } from "@/lib/cn";

type TermsAcceptanceProps = {
  error?: string;
  defaultChecked?: boolean;
};

export function TermsAcceptance({ error, defaultChecked }: TermsAcceptanceProps) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-2xl border bg-oatmeal/80 p-4 ring-1 ring-ink/5",
          error ? "border-red-300" : "border-ink/10",
        )}
      >
        <label
          htmlFor="acceptTerms"
          className="flex cursor-pointer items-start gap-3"
        >
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            value="on"
            defaultChecked={defaultChecked}
            aria-invalid={Boolean(error)}
            className="mt-0.5"
          />
          <span className="text-sm leading-relaxed text-ink/80">
            {TERMS.acceptancePrefix}{" "}
            <Link
              href={TERMS.href}
              className="font-medium text-olive-800 underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {TERMS.linkLabel}
            </Link>{" "}
            oraz{" "}
            <Link
              href={TERMS.privacyHref}
              className="font-medium text-olive-800 underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {TERMS.privacyLinkLabel}
            </Link>
            {" *"}
          </span>
        </label>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
