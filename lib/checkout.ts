import type { Group, Lead, Payment } from "@prisma/client";

import { packageLabel } from "@/lib/labels";
import { markDepositPaymentPaid } from "@/lib/payment-completion";
import {
  buildCancelUrl,
  buildSuccessUrl,
  isPaymentExpired,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { getStripe, isPaymentsSimulateEnabled } from "@/lib/stripe";

export type CheckoutSessionResult = {
  status: "success" | "error";
  url?: string;
  message?: string;
};

type PaymentWithLead = Payment & {
  lead: Lead & { group: Group | null };
};

function buildLineItemName(lead: Lead): string {
  const packageName = packageLabel(lead.requestedPackage);
  return `Kaucja rezerwacyjna - ${packageName}`;
}

function buildLineItemDescription(lead: Lead & { group: Group | null }): string {
  if (lead.group) {
    return `${lead.group.name} · ${lead.group.scheduleSlot}`;
  }

  return "Rezerwacja miejsca w grupie Matma do potęgi";
}

async function loadPaymentWithLead(
  paymentId: string,
): Promise<PaymentWithLead | null> {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      lead: {
        include: { group: true },
      },
    },
  });
}

export async function createDepositCheckoutSession(
  paymentId: string,
): Promise<CheckoutSessionResult> {
  try {
    const payment = await loadPaymentWithLead(paymentId);

    if (!payment) {
      return { status: "error", message: "Nie znaleziono płatności." };
    }

    if (payment.status === "PAID") {
      return {
        status: "success",
        url: buildSuccessUrl(payment.token),
      };
    }

    if (payment.status !== "PENDING") {
      return { status: "error", message: "Płatność jest nieważna." };
    }

    if (isPaymentExpired(payment)) {
      return { status: "error", message: "Link płatności wygasł." };
    }

    if (
      payment.stripeSessionUrl &&
      payment.stripeSessionId &&
      !isPaymentExpired(payment)
    ) {
      return { status: "success", url: payment.stripeSessionUrl };
    }

    if (isPaymentsSimulateEnabled()) {
      await markDepositPaymentPaid(payment.id);
      return {
        status: "success",
        url: buildSuccessUrl(payment.token),
      };
    }

    if (!payment.expiresAt) {
      return { status: "error", message: "Brak terminu ważności płatności." };
    }

    const stripe = getStripe();
    const nowUnix = Math.floor(Date.now() / 1000);
    const stripeMinExpiryUnix = nowUnix + 30 * 60;
    const paymentExpiryUnix = Math.floor(payment.expiresAt.getTime() / 1000);
    const expiresAtUnix = Math.max(paymentExpiryUnix, stripeMinExpiryUnix);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payment.lead.email,
      expires_at: expiresAtUnix,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: payment.amount,
            product_data: {
              name: buildLineItemName(payment.lead),
              description: buildLineItemDescription(payment.lead),
            },
          },
        },
      ],
      metadata: {
        leadId: payment.leadId,
        paymentId: payment.id,
        paymentToken: payment.token,
      },
      payment_intent_data: {
        metadata: {
          leadId: payment.leadId,
          paymentId: payment.id,
          paymentToken: payment.token,
        },
      },
      success_url: buildSuccessUrl(payment.token),
      cancel_url: buildCancelUrl(payment.token),
    });

    if (!session.url) {
      return {
        status: "error",
        message: "Nie udało się utworzyć sesji płatności.",
      };
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripeSessionId: session.id,
        stripeSessionUrl: session.url,
        ...(expiresAtUnix > paymentExpiryUnix
          ? { expiresAt: new Date(expiresAtUnix * 1000) }
          : {}),
      },
    });

    return { status: "success", url: session.url };
  } catch (error) {
    console.error("createDepositCheckoutSession failed:", error);
    return {
      status: "error",
      message: "Wystąpił błąd podczas tworzenia sesji płatności.",
    };
  }
}

export async function confirmDepositPaymentByToken(
  token: string,
): Promise<void> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { token },
    });

    if (!payment) {
      return;
    }

    if (payment.status === "PAID") {
      return;
    }

    if (isPaymentsSimulateEnabled()) {
      await markDepositPaymentPaid(payment.id);
      return;
    }

    if (!payment.stripeSessionId) {
      return;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      payment.stripeSessionId,
    );

    if (session.payment_status === "paid") {
      await markDepositPaymentPaid(payment.id);
    }
  } catch (error) {
    console.error("confirmDepositPaymentByToken failed:", error);
  }
}
