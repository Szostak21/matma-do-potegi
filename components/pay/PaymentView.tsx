"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import type { PackageType, PaymentType } from "@prisma/client";

import {
  DepositNote,
} from "@/components/pay/DepositPaymentExtras";
import { PayButton } from "@/components/pay/PayButton";
import { AlternateTermPhoneGate } from "@/components/ui/AlternateTermPhoneGate";
import { Card } from "@/components/ui/Card";
import { DEPOSIT_PAYMENT } from "@/lib/content";
import { packageLabel } from "@/lib/labels";
import { formatPln } from "@/lib/money";
import type { PaymentDisplayState } from "@/lib/payments";

type PaymentViewProps = {
  token: string;
  displayState: PaymentDisplayState;
  paymentType: PaymentType;
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
      <SummaryRow label="Rodzaj" value={DEPOSIT_PAYMENT.summaryType} />
      <SummaryRow label="Kwota" value={formatPln(amount)} />
    </div>
  );
}

function DepositExtras() {
  return (
    <div className="mt-6 space-y-4">
      <DepositNote />
      <AlternateTermPhoneGate variant="payment-doubt" />
    </div>
  );
}

export function PaymentView({
  token,
  displayState,
  paymentType,
  studentName,
  amount,
  requestedPackage,
}: PaymentViewProps) {
  const isDeposit = paymentType === "DEPOSIT";

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
          {DEPOSIT_PAYMENT.paidMessage}
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
        {isDeposit ? <DepositExtras /> : null}
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
        {isDeposit ? <DepositExtras /> : null}
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
        Matma do potęgi
      </p>
      <h1 className="mt-2 font-serif text-3xl text-ink">
        {DEPOSIT_PAYMENT.pageTitle}
      </h1>
      <p className="mt-2 text-sm text-ink/60">{DEPOSIT_PAYMENT.confirmHint}</p>

      <PaymentSummary
        studentName={studentName}
        requestedPackage={requestedPackage}
        amount={amount}
      />

      {isDeposit ? (
        <div className="mt-6">
          <DepositNote />
        </div>
      ) : null}

      <div className="mt-6">
        <PayButton token={token} />
      </div>

      {isDeposit ? (
        <div className="mt-6">
          <AlternateTermPhoneGate variant="payment-doubt" />
        </div>
      ) : null}
    </Card>
  );
}
