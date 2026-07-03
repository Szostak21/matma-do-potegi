import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaymentView } from "@/components/pay/PaymentView";
import { Container } from "@/components/ui/Container";
import { getPaymentDisplayState } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

type PayPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Płatność kaucji | Matma do potęgi",
};

export default async function PayPage({ params }: PayPageProps) {
  const { token } = await params;

  const payment = await prisma.payment.findUnique({
    where: { token },
    include: { lead: true },
  });

  if (!payment) {
    notFound();
  }

  const displayState = getPaymentDisplayState(payment);
  const studentName =
    payment.lead.studentName ?? payment.lead.parentName;

  return (
    <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
      <Container className="w-full max-w-lg">
        <PaymentView
          token={token}
          displayState={displayState}
          studentName={studentName}
          amount={payment.amount}
          requestedPackage={payment.lead.requestedPackage}
        />
      </Container>
    </main>
  );
}
