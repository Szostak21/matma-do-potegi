"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import type { PaymentType } from "@prisma/client";

import { DepositNote } from "@/components/pay/DepositPaymentExtras";
import { PayButton } from "@/components/pay/PayButton";
import { ViewContentTracker } from "@/components/pay/ViewContentTracker";
import { AlternateTermPhoneGate } from "@/components/ui/AlternateTermPhoneGate";
import { Card } from "@/components/ui/Card";
import { ReferralActiveNotice } from "@/components/ui/ReferralActiveNotice";
import { DEPOSIT_PAYMENT, TUITION_PAYMENT } from "@/lib/content";
import { formatPln } from "@/lib/money";
import type { PaymentDisplayState } from "@/lib/payments";

type PaymentViewProps = {
  token: string;
  displayState: PaymentDisplayState;
  paymentType: PaymentType;
  reserverName: string;
  packageName: string;
  amount: number;
  hasReferral?: boolean;
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
  hasReferral = false,
  monthLabel,
}: PaymentViewProps) {
  const isDeposit = paymentType === "DEPOSIT";
  const copy = isDeposit ? DEPOSIT_PAYMENT : TUITION_PAYMENT;

  const summary = (
    <div className="mt-6 rounded-2xl bg-oatmeal/80 p-5 ring-1 ring-ink/5 text-left">
      <SummaryRow label={copy.summaryReserver} value={reserverName} />
      <SummaryRow label={copy.summaryPackage} value={packageName} />
      {!isDeposit && monthLabel ? (
        <SummaryRow label={TUITION_PAYMENT.summaryMonth} value={monthLabel} />
      ) : null}
      <SummaryRow label="Rodzaj" value={copy.summaryType} />
      <SummaryRow label="Kwota" value={formatPln(amount)} />
    </div>
  );

  if (displayState === "paid") {
    return (
      <Card className="text-center">
        <CheckCircle
          className="mx-auto size-12 text-olive-600"
          aria-hidden="true"
        />
        <h1 className="mt-4 font-serif text-3xl text-ink">
          {copy.successTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {copy.paidMessage}
        </p>
        {summary}
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
          {copy.expiredTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {copy.expiredMessage}
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
          {copy.invalidTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {copy.invalidMessage}
        </p>
        {isDeposit ? <DepositExtras /> : null}
      </Card>
    );
  }

  return (
    <Card>
      {/* ViewContent to zdarzenie reklamowe — dotyczy tylko ścieżki zaliczki. */}
      {isDeposit ? (
        <ViewContentTracker packageName={packageName} value={amount} />
      ) : null}
      <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
        Matma do potęgi
      </p>
      <h1 className="mt-2 font-serif text-3xl text-ink">
        {copy.reservationTitle}
      </h1>
      <p className="mt-2 text-sm text-ink/60">{copy.reservationHint}</p>

      {isDeposit && hasReferral ? (
        <div className="mt-5 mb-1">
          <ReferralActiveNotice />
        </div>
      ) : null}

      {summary}

      {isDeposit ? (
        <div className="mt-6">
          <DepositNote />
        </div>
      ) : null}

      <div className="mt-6">
        <PayButton
          token={token}
          label={
            isDeposit ? DEPOSIT_PAYMENT.payButtonLabel : "Zapłać teraz"
          }
          analytics={isDeposit ? { valueGrosze: amount } : undefined}
        />
      </div>

      {isDeposit ? (
        <div className="mt-6">
          <AlternateTermPhoneGate variant="payment-doubt" />
        </div>
      ) : null}
    </Card>
  );
}
