"use client";

import { useState, useTransition } from "react";

import { updateStandingDiscount } from "@/actions/tuition";
import { MoneyField } from "@/components/admin/payments/MoneyField";
import { formatPln } from "@/lib/money";

type StandingDiscountEditorProps = {
  leadId: string;
  secret: string;
  standingDiscountGrosze: number;
  monthlyPriceGrosze: number;
};

/**
 * Stała zniżka i podgląd czesnego na karcie klienta. Rozdział jest celowy:
 * to, co opisuje klienta, edytujesz tu; kwoty jednego miesiąca — w panelu Płatności.
 */
export function StandingDiscountEditor({
  leadId,
  secret,
  standingDiscountGrosze,
  monthlyPriceGrosze,
}: StandingDiscountEditorProps) {
  const [discountGrosze, setDiscountGrosze] = useState(standingDiscountGrosze);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const monthlyDue = Math.max(0, monthlyPriceGrosze - discountGrosze);

  return (
    <div className="rounded-2xl bg-oatmeal/60 p-3">
      <div className="flex items-end gap-3">
        <div className="w-28 shrink-0">
          <MoneyField
            label="Stała zniżka"
            valueGrosze={discountGrosze}
            disabled={isPending}
            onCommit={(grosze) => {
              setDiscountGrosze(grosze);
              startTransition(async () => {
                const result = await updateStandingDiscount({
                  secret,
                  leadId,
                  standingDiscountGrosze: grosze,
                });
                setMessage(result.message ?? null);
              });
            }}
          />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-[10px] uppercase tracking-wide text-ink/40">
            Czesne miesięcznie
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">
            {monthlyPriceGrosze > 0
              ? formatPln(monthlyDue)
              : "ustalane ręcznie"}
          </p>
          {monthlyPriceGrosze > 0 && discountGrosze !== 0 ? (
            <p className="text-[11px] tabular-nums text-ink/45">
              {formatPln(monthlyPriceGrosze)} − {formatPln(discountGrosze)}
            </p>
          ) : null}
        </div>
      </div>
      {message ? (
        <p className="mt-1.5 text-[11px] text-ink/55">{message}</p>
      ) : null}
    </div>
  );
}
