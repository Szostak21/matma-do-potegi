import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { markDepositPaymentPaid } from "@/lib/payment-completion";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") {
    return;
  }

  const paymentId = session.metadata?.paymentId;
  const stripeSessionId = session.id;

  const payment = paymentId
    ? await prisma.payment.findUnique({ where: { id: paymentId } })
    : await prisma.payment.findFirst({
        where: { stripeSessionId },
      });

  if (!payment) {
    console.warn("Stripe webhook: payment not found", {
      paymentId,
      stripeSessionId,
    });
    return;
  }

  await markDepositPaymentPaid(payment.id, {
    consentGranted: session.metadata?.mktConsent === "granted",
    fbp: session.metadata?.fbp ?? null,
    fbc: session.metadata?.fbc ?? null,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
