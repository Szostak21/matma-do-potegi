import type { Metadata } from "next";
import { CheckCircle, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

import { PaymentSummary } from "@/components/pay/PaymentSummary";
import { PurchaseTracker } from "@/components/pay/PurchaseTracker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { confirmDepositPaymentByToken } from "@/lib/checkout";
import { DEPOSIT_PAYMENT } from "@/lib/content";
import { getPaymentDisplayState } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

type PaySuccessPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata: Metadata = {
  title: "Płatność zakończona | Matma do potęgi",
};

export const dynamic = "force-dynamic";

export default async function PaySuccessPage({ searchParams }: PaySuccessPageProps) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  await confirmDepositPaymentByToken(token);

  const payment = await prisma.payment.findUnique({
    where: { token },
    include: { lead: true },
  });

  if (!payment) {
    notFound();
  }

  const displayState = getPaymentDisplayState(payment);
  const isPaid = displayState === "paid";

  return (
    <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
      {isPaid ? (
        <PurchaseTracker token={token} amountGrosze={payment.amount} />
      ) : null}
      <Container className="w-full max-w-lg">
        <Card className="text-center">
          {isPaid ? (
            <CheckCircle
              className="mx-auto size-12 text-olive-600"
              aria-hidden="true"
            />
          ) : (
            <Loader2
              className="mx-auto size-12 animate-spin text-olive-600"
              aria-hidden="true"
            />
          )}
          <h1 className="mt-4 font-serif text-3xl text-ink">
            {isPaid
              ? DEPOSIT_PAYMENT.successTitle
              : DEPOSIT_PAYMENT.successProcessingTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {isPaid
              ? DEPOSIT_PAYMENT.successMessage
              : DEPOSIT_PAYMENT.successProcessingMessage}
          </p>
          <PaymentSummary
            reserverName={payment.lead.parentName}
            requestedPackage={payment.lead.requestedPackage}
            amount={payment.amount}
          />
          <Button href="/" variant="secondary" className="mt-8">
            {DEPOSIT_PAYMENT.backHome}
          </Button>
        </Card>
      </Container>
    </main>
  );
}
