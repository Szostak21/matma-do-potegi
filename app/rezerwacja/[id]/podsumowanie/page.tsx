import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PaymentView } from "@/components/pay/PaymentView";
import { Container } from "@/components/ui/Container";
import { packageLabel } from "@/lib/labels";
import {
  findActiveDepositPayment,
  getPaymentDisplayState,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";

type ReservationSummaryPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Podsumowanie rezerwacji | Matma do potęgi",
};

export const dynamic = "force-dynamic";

export default async function ReservationSummaryPage({
  params,
}: ReservationSummaryPageProps) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id, isDeleted: false },
    include: {
      payments: {
        where: { type: "DEPOSIT" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead || !lead.requestedPackage) {
    notFound();
  }

  const packageName = packageLabel(lead.requestedPackage);
  const activePayment = findActiveDepositPayment(lead.payments);
  const latestDeposit = lead.payments[0];
  const hasReferral = Boolean(lead.referredById);

  if (activePayment) {
    const displayState = getPaymentDisplayState(activePayment);

    if (displayState === "paid") {
      redirect(`/pay/success?token=${encodeURIComponent(activePayment.token)}`);
    }

    return (
      <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
        <Container className="w-full max-w-lg">
          <PaymentView
            token={activePayment.token}
            displayState={displayState}
            paymentType={activePayment.type}
            reserverName={lead.parentName}
            packageName={packageName}
            amount={activePayment.amount}
            hasReferral={hasReferral}
          />
        </Container>
      </main>
    );
  }

  if (latestDeposit?.status === "PAID") {
    redirect(`/pay/success?token=${encodeURIComponent(latestDeposit.token)}`);
  }

  if (latestDeposit) {
    const displayState = getPaymentDisplayState(latestDeposit);

    return (
      <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
        <Container className="w-full max-w-lg">
          <PaymentView
            token={latestDeposit.token}
            displayState={displayState}
            paymentType={latestDeposit.type}
            reserverName={lead.parentName}
            packageName={packageName}
            amount={latestDeposit.amount}
            hasReferral={hasReferral}
          />
        </Container>
      </main>
    );
  }

  notFound();
}
