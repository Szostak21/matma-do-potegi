import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { AlternateTermPhoneGate } from "@/components/ui/AlternateTermPhoneGate";
import { DEPOSIT_PAYMENT } from "@/lib/content";
import { prisma } from "@/lib/prisma";

type PayCancelPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const metadata: Metadata = {
  title: "Płatność przerwana | Matma do potęgi",
};

export default async function PayCancelPage({ searchParams }: PayCancelPageProps) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  const payment = await prisma.payment.findUnique({
    where: { token },
  });

  if (!payment) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 items-center bg-oatmeal py-12">
      <Container className="w-full max-w-lg">
        <Card className="text-center">
          <AlertCircle
            className="mx-auto size-12 text-amber-600"
            aria-hidden="true"
          />
          <h1 className="mt-4 font-serif text-3xl text-ink">
            {DEPOSIT_PAYMENT.cancelTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {DEPOSIT_PAYMENT.cancelMessage}
          </p>
          <div className="mt-8">
            <AlternateTermPhoneGate />
          </div>
          <Button href="/" variant="secondary" className="mt-8">
            {DEPOSIT_PAYMENT.backHome}
          </Button>
        </Card>
      </Container>
    </main>
  );
}
