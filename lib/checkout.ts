import type { Group, Lead, Payment, TuitionPeriod } from "@prisma/client";

import { formatBillingMonth } from "@/lib/dates";
import { packageLabel } from "@/lib/labels";
import { getServerMarketingContext } from "@/lib/meta-capi";
import { getCheckoutProvider } from "@/lib/payments/provider";
import { markPaymentPaid } from "@/lib/payment-completion";
import {
  buildCancelUrl,
  buildSuccessUrl,
  isPaymentExpired,
  isTuitionPeriodSettled,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { isPaymentsSimulateEnabled } from "@/lib/stripe";

export type CheckoutSessionResult = {
  status: "success" | "error";
  url?: string;
  message?: string;
};

type PaymentWithContext = Payment & {
  lead: Lead & { group: Group | null };
  tuitionPeriod: TuitionPeriod | null;
};

function buildDepositLineItem(lead: Lead & { group: Group | null }): {
  title: string;
  description: string;
} {
  const packageName = packageLabel(lead.requestedPackage);

  return {
    title: `Zaliczka - ${packageName}`,
    description: lead.group
      ? `Rezerwujący: ${lead.parentName} · ${packageName} · ${lead.group.name}`
      : `Rezerwujący: ${lead.parentName} · ${packageName}`,
  };
}

function buildTuitionLineItem(payment: PaymentWithContext): {
  title: string;
  description: string;
} {
  const packageName = packageLabel(payment.lead.requestedPackage);
  const month = payment.tuitionPeriod?.periodMonth ?? payment.billingPeriod;
  const monthLabel = month ? formatBillingMonth(month) : null;

  return {
    title: monthLabel ? `Czesne ${monthLabel}` : "Czesne",
    description: `${payment.lead.parentName} · ${packageName}`,
  };
}

function buildLineItem(payment: PaymentWithContext): {
  title: string;
  description: string;
} {
  return payment.type === "DEPOSIT"
    ? buildDepositLineItem(payment.lead)
    : buildTuitionLineItem(payment);
}

async function loadPaymentWithContext(
  paymentId: string,
): Promise<PaymentWithContext | null> {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      lead: { include: { group: true } },
      tuitionPeriod: true,
    },
  });
}

/**
 * Kwota pobierana od klienta. Dla czesnego źródłem prawdy jest `TuitionPeriod`,
 * więc korekta kwoty w panelu nie wymaga rozsyłania nowych linków.
 */
function resolveAmountGrosze(payment: PaymentWithContext): number {
  if (payment.type === "DEPOSIT" || !payment.tuitionPeriod) {
    return payment.amount;
  }

  const remaining =
    payment.tuitionPeriod.amountDueGrosze -
    payment.tuitionPeriod.amountPaidGrosze;

  return Math.max(0, remaining);
}

export async function createCheckoutSession(
  paymentId: string,
  options?: { forceNew?: boolean },
): Promise<CheckoutSessionResult> {
  try {
    const payment = await loadPaymentWithContext(paymentId);

    if (!payment) {
      return { status: "error", message: "Nie znaleziono płatności." };
    }

    if (payment.status === "PAID") {
      return { status: "success", url: buildSuccessUrl(payment.token) };
    }

    if (payment.status !== "PENDING") {
      return { status: "error", message: "Płatność jest nieważna." };
    }

    if (isPaymentExpired(payment)) {
      return { status: "error", message: "Link płatności wygasł." };
    }

    if (
      payment.tuitionPeriod &&
      isTuitionPeriodSettled(payment.tuitionPeriod)
    ) {
      return {
        status: "error",
        message: "Ta płatność została już rozliczona.",
      };
    }

    const amountGrosze = resolveAmountGrosze(payment);

    if (amountGrosze <= 0) {
      return { status: "error", message: "Nie ma nic do zapłaty." };
    }

    // Ponowne wejście w ten sam link: sesja u dostawcy jest reużywalna tylko wtedy,
    // gdy kwota się nie zmieniła — inaczej trzeba ją odtworzyć.
    const amountUnchanged = amountGrosze === payment.amount;

    if (
      !options?.forceNew &&
      amountUnchanged &&
      payment.providerCheckoutUrl &&
      payment.providerSessionId &&
      !isPaymentExpired(payment)
    ) {
      return { status: "success", url: payment.providerCheckoutUrl };
    }

    if (isPaymentsSimulateEnabled()) {
      await markPaymentPaid(payment.id);
      return { status: "success", url: buildSuccessUrl(payment.token) };
    }

    if (payment.type === "DEPOSIT" && !payment.expiresAt) {
      return { status: "error", message: "Brak terminu ważności płatności." };
    }

    // Kontekst marketingowy zapisujemy tylko dla zaliczki — to jedyna płatność
    // raportowana do Meta (Purchase). Czesne jest operacyjne, nie reklamowe.
    const marketingMetadata: Record<string, string> = {};

    if (payment.type === "DEPOSIT") {
      const marketingCtx = await getServerMarketingContext();
      marketingMetadata.mktConsent = marketingCtx.consentGranted
        ? "granted"
        : "denied";

      if (marketingCtx.fbp) {
        marketingMetadata.fbp = marketingCtx.fbp;
      }
      if (marketingCtx.fbc) {
        marketingMetadata.fbc = marketingCtx.fbc;
      }
      if (marketingCtx.clientIpAddress) {
        marketingMetadata.clientIp = marketingCtx.clientIpAddress.slice(0, 500);
      }
      if (marketingCtx.clientUserAgent) {
        marketingMetadata.clientUa = marketingCtx.clientUserAgent.slice(0, 500);
      }
    }

    const lineItem = buildLineItem(payment);
    const provider = await getCheckoutProvider();

    const checkout = await provider.createCheckout({
      paymentId: payment.id,
      amountGrosze,
      title: lineItem.title,
      description: lineItem.description,
      customerEmail: payment.lead.email,
      successUrl: buildSuccessUrl(payment.token),
      cancelUrl: buildCancelUrl(),
      // Czesne nie wygasa po naszej stronie, więc nie narzucamy terminu dostawcy.
      expiresAt: payment.type === "DEPOSIT" ? payment.expiresAt : null,
      metadata: {
        leadId: payment.leadId,
        paymentId: payment.id,
        paymentToken: payment.token,
        paymentType: payment.type,
        ...marketingMetadata,
      },
    });

    if (checkout.status === "error") {
      return { status: "error", message: checkout.message };
    }

    // Zaliczka: Stripe wymaga min. 30 min. Przed wydzieleniem providera ten sam
    // `expiresAtUnix` szedł do Stripe i z powrotem do `Payment.expiresAt`.
    let extendedDepositExpiresAt: Date | undefined;

    if (payment.type === "DEPOSIT" && payment.expiresAt) {
      const nowUnix = Math.floor(Date.now() / 1000);
      const paymentExpiryUnix = Math.floor(payment.expiresAt.getTime() / 1000);
      const expiresAtUnix = Math.max(paymentExpiryUnix, nowUnix + 30 * 60);

      if (expiresAtUnix > paymentExpiryUnix) {
        extendedDepositExpiresAt = new Date(expiresAtUnix * 1000);
      }
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        provider: provider.id,
        providerSessionId: checkout.sessionId,
        providerCheckoutUrl: checkout.url,
        ...(amountUnchanged ? {} : { amount: amountGrosze }),
        ...(extendedDepositExpiresAt
          ? { expiresAt: extendedDepositExpiresAt }
          : {}),
      },
    });

    return { status: "success", url: checkout.url };
  } catch (error) {
    console.error("createCheckoutSession failed:", error);
    return {
      status: "error",
      message: "Wystąpił błąd podczas tworzenia sesji płatności.",
    };
  }
}

/**
 * Domknięcie płatności po powrocie klienta ze bramki — siatka bezpieczeństwa,
 * gdy webhook się spóźni albo nie dojdzie.
 */
export async function confirmPaymentByToken(token: string): Promise<void> {
  try {
    const payment = await prisma.payment.findUnique({ where: { token } });

    if (!payment || payment.status === "PAID") {
      return;
    }

    if (isPaymentsSimulateEnabled()) {
      await markPaymentPaid(payment.id);
      return;
    }

    if (!payment.providerSessionId) {
      return;
    }

    // Weryfikacja stanu sesji jest dziś specyficzna dla Stripe. Po dodaniu Tpay
    // trafi za `CheckoutProvider.getSessionStatus`.
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      payment.providerSessionId,
    );

    if (session.payment_status === "paid") {
      await markPaymentPaid(payment.id, {
        consentGranted: session.metadata?.mktConsent === "granted",
        fbp: session.metadata?.fbp ?? null,
        fbc: session.metadata?.fbc ?? null,
        clientIpAddress: session.metadata?.clientIp ?? null,
        clientUserAgent: session.metadata?.clientUa ?? null,
      });
    }
  } catch (error) {
    console.error("confirmPaymentByToken failed:", error);
  }
}
