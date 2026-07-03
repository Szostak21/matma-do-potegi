"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import type { PackageType } from "@prisma/client";

import { PayButton } from "@/components/pay/PayButton";
import { Card } from "@/components/ui/Card";
import { packageLabel } from "@/lib/labels";
import { formatPln } from "@/lib/money";
import type { PaymentDisplayState } from "@/lib/payments";

type PaymentViewProps = {
  token: string;
  displayState: PaymentDisplayState;
  studentName: string;
  amount: number;
  requestedPackage: PackageType | null;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <span className="text-sm text-ink/60">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function PaymentSummary({
  studentName,
  requestedPackage,
  amount,
}: {
  studentName: string;
  requestedPackage: PackageType | null;
  amount: number;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-oatmeal/80 p-5 ring-1 ring-ink/5">
      <SummaryRow label="Uczeń" value={studentName} />
      <SummaryRow label="Pakiet" value={packageLabel(requestedPackage)} />
      <SummaryRow label="Rodzaj" value="Wpłata kaucji" />
      <SummaryRow label="Kwota" value={formatPln(amount)} />
    </div>
  );
}

export function PaymentView({
  token,
  displayState,
  studentName,
  amount,
  requestedPackage,
}: PaymentViewProps) {
  if (displayState === "paid") {
    return (
      <Card className="text-center">
        <CheckCircle
          className="mx-auto size-12 text-olive-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-serif text-3xl text-ink">
          Płatność zakończona
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Kaucja została opłacona. Wkrótce skontaktujemy się w sprawie dalszych
          kroków zapisu.
        </p>
        <PaymentSummary
          studentName={studentName}
          requestedPackage={requestedPackage}
          amount={amount}
        />
      </Card>
    );
  }

  if (displayState === "expired") {
    return (
      <Card className="text-center">
        <AlertCircle
          className="mx-auto size-12 text-amber-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-serif text-3xl text-ink">Link wygasł</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Ten link płatności nie jest już aktywny. Skontaktuj się z nami, aby
          otrzymać nowy.
        </p>
      </Card>
    );
  }

  if (displayState === "cancelled") {
    return (
      <Card className="text-center">
        <AlertCircle
          className="mx-auto size-12 text-red-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-serif text-3xl text-ink">
          Płatność nieważna
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Ta płatność została anulowana lub wygasła. Skontaktuj się z nami po
          pomoc.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
        Matma do potęgi
      </p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Wpłata kaucji</h1>
      <p className="mt-2 text-sm text-ink/60">
        Potwierdź płatność, aby zarezerwować miejsce w grupie.
      </p>

      <PaymentSummary
        studentName={studentName}
        requestedPackage={requestedPackage}
        amount={amount}
      />

      <div className="mt-8">
        <PayButton token={token} />
      </div>
    </Card>
  );
}
