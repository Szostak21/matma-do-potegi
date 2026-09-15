import type { PackageType, PaymentType } from "@prisma/client";

import { Card } from "@/components/ui/Card";
import { DEPOSIT_PAYMENT, TUITION_PAYMENT } from "@/lib/content";
import { packageLabel } from "@/lib/labels";
import { formatPln } from "@/lib/money";

type PaymentSummaryProps = {
  paymentType: PaymentType;
  reserverName: string;
  requestedPackage: PackageType | null;
  amount: number;
  /** Miesiąc rozliczeniowy — pokazywany tylko dla czesnego. */
  monthLabel?: string;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <span className="text-sm text-ink/60">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export function PaymentSummary({
  paymentType,
  reserverName,
  requestedPackage,
  amount,
  monthLabel,
}: PaymentSummaryProps) {
  const isDeposit = paymentType === "DEPOSIT";
  const copy = isDeposit ? DEPOSIT_PAYMENT : TUITION_PAYMENT;

  return (
    <Card className="mt-6 text-left">
      <SummaryRow label={copy.summaryReserver} value={reserverName} />
      <SummaryRow
        label={copy.summaryPackage}
        value={packageLabel(requestedPackage)}
      />
      {!isDeposit && monthLabel ? (
        <SummaryRow label={TUITION_PAYMENT.summaryMonth} value={monthLabel} />
      ) : null}
      <SummaryRow label="Rodzaj" value={copy.summaryType} />
      <SummaryRow label="Kwota" value={formatPln(amount)} />
    </Card>
  );
}
