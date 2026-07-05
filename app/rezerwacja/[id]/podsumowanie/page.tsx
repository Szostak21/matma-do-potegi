import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PaymentView } from "@/components/pay/PaymentView";
import { Container } from "@/components/ui/Container";
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
    where: { id },
    include: {
      group: true,
      payments: {
        where: { type: "DEPOSIT" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead || !lead.group) {
    notFound();
  }

  const activePayment = findActiveDepositPayment(lead.payments);
  const latestDeposit = lead.payments[0];

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
            groupName={lead.group.name}
            scheduleSlot={lead.group.scheduleSlot}
            amount={activePayment.amount}
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
            groupName={lead.group.name}
            scheduleSlot={lead.group.scheduleSlot}
            amount={latestDeposit.amount}
          />
        </Container>
      </main>
    );
  }

  notFound();
}
