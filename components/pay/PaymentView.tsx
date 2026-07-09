"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import type { PaymentType } from "@prisma/client";

import { DepositNote } from "@/components/pay/DepositPaymentExtras";
import { PayButton } from "@/components/pay/PayButton";
import { AlternateTermPhoneGate } from "@/components/ui/AlternateTermPhoneGate";
import { Card } from "@/components/ui/Card";
import { DEPOSIT_PAYMENT } from "@/lib/content";
import { formatPln } from "@/lib/money";
import type { PaymentDisplayState } from "@/lib/payments";

type PaymentViewProps = {
  token: string;
  displayState: PaymentDisplayState;
  paymentType: PaymentType;
  reserverName: string;
  packageName: string;
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

function ReservationSummary({
  reserverName,
  packageName,
  amount,
}: {
  reserverName: string;
  packageName: string;
  amount: number;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-oatmeal/80 p-5 ring-1 ring-ink/5 text-left">
      <SummaryRow
        label={DEPOSIT_PAYMENT.summaryReserver}
        value={reserverName}
      />
      <SummaryRow
        label={DEPOSIT_PAYMENT.summaryPackage}
        value={packageName}
      />
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
  reserverName,
  packageName,
  amount,
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
          {DEPOSIT_PAYMENT.successTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {DEPOSIT_PAYMENT.paidMessage}
        </p>
        <ReservationSummary
          reserverName={reserverName}
          packageName={packageName}
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
        <h1 className="mt-4 font-serif text-3xl text-ink">
          {DEPOSIT_PAYMENT.expiredTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {DEPOSIT_PAYMENT.expiredMessage}
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
          {DEPOSIT_PAYMENT.invalidTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {DEPOSIT_PAYMENT.invalidMessage}
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
        {DEPOSIT_PAYMENT.reservationTitle}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {DEPOSIT_PAYMENT.reservationHint}
      </p>

      <ReservationSummary
        reserverName={reserverName}
        packageName={packageName}
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
