import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PaymentView } from "@/components/pay/PaymentView";
import { Container } from "@/components/ui/Container";
import { leadDisplayName } from "@/lib/admin-tabs";
import { formatBillingMonth } from "@/lib/dates";
import { packageLabel } from "@/lib/labels";
import {
  getPaymentDisplayState,
  isTuitionPeriodSettled,
  type PaymentDisplayState,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";

type ShortPaymentPageProps = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = {
  title: "Płatność | Matma do potęgi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Krótki link wysyłany klientom SMS-em. Nie wygasa z czasem — o ważności decyduje
 * stan okresu rozliczeniowego, dzięki czemu można go wysłać na tydzień przed terminem.
 */
export default async function ShortPaymentPage({
  params,
}: ShortPaymentPageProps) {
  const { code } = await params;

  const payment = await prisma.payment.findUnique({
    where: { shortCode: code },
    include: { lead: true, tuitionPeriod: true },
  });

  if (!payment || payment.lead.isDeleted) {
    notFound();
  }

  if (payment.status === "PAID") {
    redirect(`/pay/success?token=${encodeURIComponent(payment.token)}`);
  }

  const period = payment.tuitionPeriod;

  // Okres opłacony gotówką lub umorzony — link nie powinien już nic pobierać.
  const displayState: PaymentDisplayState =
    period && isTuitionPeriodSettled(period)
      ? "paid"
      : getPaymentDisplayState(payment);

  const amountDisplayed =
    displayState === "paid"
      ? (period?.amountDueGrosze ?? payment.amount)
      : period
        ? Math.max(0, period.amountDueGrosze - period.amountPaidGrosze)
        : payment.amount;

  return (
    <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
      <Container className="w-full max-w-lg">
        <PaymentView
          token={payment.token}
          displayState={displayState}
          paymentType={payment.type}
          reserverName={leadDisplayName(payment.lead)}
          packageName={packageLabel(payment.lead.requestedPackage)}
          amount={amountDisplayed}
          monthLabel={
            period ? formatBillingMonth(period.periodMonth) : undefined
          }
        />
      </Container>
    </main>
  );
}
