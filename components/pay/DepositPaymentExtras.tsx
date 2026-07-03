import { ShieldCheck } from "lucide-react";

import { DEPOSIT_PAYMENT } from "@/lib/content";

export function DepositNote() {
  return (
    <div className="rounded-2xl border border-olive-200 bg-olive-50/60 p-4">
      <div className="flex gap-3">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-olive-700"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-ink/80">
          {DEPOSIT_PAYMENT.depositNote}
        </p>
      </div>
    </div>
  );
}
