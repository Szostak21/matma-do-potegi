import type { PackageType } from "@prisma/client";

import { Card } from "@/components/ui/Card";
import { DEPOSIT_PAYMENT, PACKAGE_AVAILABILITY } from "@/lib/content";
import { packageLabel } from "@/lib/labels";
import { formatPln } from "@/lib/money";

type PaymentSummaryProps = {
  reserverName: string;
  requestedPackage: PackageType | null;
  amount: number;
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
  reserverName,
  requestedPackage,
  amount,
}: PaymentSummaryProps) {
  return (
    <Card className="mt-6 text-left">
      <SummaryRow
        label={DEPOSIT_PAYMENT.summaryReserver}
        value={reserverName}
      />
      <SummaryRow
        label={DEPOSIT_PAYMENT.summaryPackage}
        value={packageLabel(requestedPackage)}
      />
      <SummaryRow
        label={DEPOSIT_PAYMENT.summaryStartNote}
        value={PACKAGE_AVAILABILITY.octoberNote}
      />
      <SummaryRow label="Rodzaj" value={DEPOSIT_PAYMENT.summaryType} />
      <SummaryRow label="Kwota" value={formatPln(amount)} />
    </Card>
  );
}
