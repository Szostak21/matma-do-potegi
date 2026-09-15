import "server-only";

import type {
  CheckoutInput,
  CheckoutProvider,
  CheckoutResult,
} from "@/lib/payments/provider";
import { getStripe } from "@/lib/stripe";

/** Stripe wymaga, by sesja Checkout wygasała nie wcześniej niż po 30 minutach. */
const STRIPE_MIN_EXPIRY_SECONDS = 30 * 60;

/**
 * Stripe Checkout Session żyje maksymalnie 24 h od utworzenia, dlatego dla płatności
 * bez terminu (czesne) nie ustawiamy `expires_at` — sesja powstaje dopiero w momencie
 * kliknięcia naszego linku, więc jej krótkie życie nie ogranicza ważności linku.
 */
function resolveExpiresAtUnix(expiresAt: Date | null): number | undefined {
  if (!expiresAt) {
    return undefined;
  }

  const nowUnix = Math.floor(Date.now() / 1000);
  const requestedUnix = Math.floor(expiresAt.getTime() / 1000);

  return Math.max(requestedUnix, nowUnix + STRIPE_MIN_EXPIRY_SECONDS);
}

async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const stripe = getStripe();
    const expiresAtUnix = resolveExpiresAtUnix(input.expiresAt);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      ...(expiresAtUnix ? { expires_at: expiresAtUnix } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: input.amountGrosze,
            product_data: {
              name: input.title,
              description: input.description,
            },
          },
        },
      ],
      metadata: input.metadata,
      payment_intent_data: {
        metadata: input.metadata,
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    if (!session.url) {
      return {
        status: "error",
        message: "Nie udało się utworzyć sesji płatności.",
      };
    }

    return { status: "success", url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("stripeCheckoutProvider.createCheckout failed:", error);

    return {
      status: "error",
      message: "Wystąpił błąd podczas tworzenia sesji płatności.",
    };
  }
}

export const stripeCheckoutProvider: CheckoutProvider = {
  id: "STRIPE",
  createCheckout,
};
