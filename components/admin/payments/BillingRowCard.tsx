"use client";

import { Check, Send } from "lucide-react";

import { MoneyField } from "@/components/admin/payments/MoneyField";
import { Checkbox } from "@/components/ui/Checkbox";
import type { AdminBillingRow } from "@/lib/admin-tabs";
import { cn } from "@/lib/cn";
import { formatPln } from "@/lib/money";

type BillingRowCardProps = {
  row: AdminBillingRow;
  isSelected: boolean;
  isPending: boolean;
  onToggleSelect: (leadId: string) => void;
  onChangeBase: (row: AdminBillingRow, grosze: number) => void;
  onChangeDiscount: (row: AdminBillingRow, grosze: number) => void;
};

type StatusTone = "due" | "sent" | "paid" | "partial" | "waived";

const TONE_CLASSES: Record<StatusTone, string> = {
  due: "bg-ink/5 text-ink/55",
  sent: "bg-amber-100 text-amber-800",
  paid: "bg-olive-100 text-olive-800",
  partial: "bg-amber-100 text-amber-800",
  waived: "bg-ink/10 text-ink/50",
};

const TONE_LABELS: Record<StatusTone, string> = {
  due: "Do zapłaty",
  sent: "Wysłane",
  paid: "Opłacone",
  partial: "Częściowo",
  waived: "Umorzone",
};

function resolveTone(row: AdminBillingRow): StatusTone {
  switch (row.status) {
    case "PAID":
      return "paid";
    case "PARTIAL":
      return "partial";
    case "WAIVED":
      return "waived";
    default:
      return row.messageSentAt ? "sent" : "due";
  }
}

export function BillingRowCard({
  row,
  isSelected,
  isPending,
  onToggleSelect,
  onChangeBase,
  onChangeDiscount,
}: BillingRowCardProps) {
  const tone = resolveTone(row);
  const isSettled = row.status === "PAID" || row.status === "WAIVED";

  return (
    <li
      className={cn(
        "min-w-0 rounded-2xl bg-white/85 p-3 ring-1 transition",
        isSelected ? "ring-olive-500/60" : "ring-ink/5",
        isPending && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          className="mt-1"
          checked={isSelected}
          disabled={isSettled}
          onChange={() => onToggleSelect(row.leadId)}
          aria-label={`Zaznacz ${row.displayName}`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {row.displayName}
          </p>
          <a
            href={`tel:${row.phoneNumber}`}
            className="text-xs tabular-nums text-ink/50 underline-offset-2 hover:underline"
          >
            {row.phoneNumber}
          </a>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
            TONE_CLASSES[tone],
          )}
        >
          {tone === "paid" ? (
            <Check className="size-3" aria-hidden />
          ) : tone === "sent" ? (
            <Send className="size-3" aria-hidden />
          ) : null}
          {TONE_LABELS[tone]}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <MoneyField
          label="Kwota"
          valueGrosze={row.baseAmountGrosze}
          disabled={isSettled}
          onCommit={(grosze) => onChangeBase(row, grosze)}
        />
        <MoneyField
          label="Zniżka"
          valueGrosze={row.discountGrosze}
          disabled={isSettled}
          onCommit={(grosze) => onChangeDiscount(row, grosze)}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-ink/5 pt-2">
        <span className="text-[10px] uppercase tracking-wide text-ink/40">
          Do zapłaty
        </span>
        <span className="text-sm font-medium tabular-nums text-ink">
          {formatPln(row.amountDueGrosze)}
        </span>
      </div>

      {row.amountPaidGrosze > 0 && row.status !== "PAID" ? (
        <p className="mt-1 text-[11px] text-ink/45">
          Wpłacono {formatPln(row.amountPaidGrosze)}
        </p>
      ) : null}

      {row.isFirstBillableMonth && row.discountGrosze !== 0 && !isSettled ? (
        <p className="mt-1 text-[11px] text-olive-700">
          Pierwszy miesiąc — zniżka podstawiona automatycznie
        </p>
      ) : null}
    </li>
  );
}
