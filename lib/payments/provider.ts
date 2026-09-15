import "server-only";

import type { PaymentProvider as PaymentProviderEnum } from "@prisma/client";

/**
 * Warstwa dostawcy płatności — wszystko, co panel i strony publiczne wiedzą o bramce.
 *
 * Linki wysyłane klientom prowadzą na nasz adres (`/p/<shortCode>`), a sesja u dostawcy
 * powstaje dopiero w momencie kliknięcia. Dzięki temu migracja Stripe → Tpay polega na
 * dodaniu drugiej implementacji `CheckoutProvider` i nie unieważnia rozesłanych linków.
 */

export type CheckoutInput = {
  paymentId: string;
  amountGrosze: number;
  /** Nazwa pozycji widoczna na stronie płatności (np. "Czesne październik 2026"). */
  title: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  /** `null` = bez wygasania po stronie dostawcy (czesne). */
  expiresAt: Date | null;
  metadata: Record<string, string>;
};

export type CheckoutResult =
  | { status: "success"; url: string; sessionId: string }
  | { status: "error"; message: string };

export type CheckoutProvider = {
  id: PaymentProviderEnum;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
};

/**
 * Dziś zawsze Stripe. Po założeniu firmy i uzyskaniu NIP-u wystarczy tu przełączyć
 * (np. na podstawie zmiennej środowiskowej) na implementację Tpay.
 */
export async function getCheckoutProvider(): Promise<CheckoutProvider> {
  const { stripeCheckoutProvider } = await import(
    "@/lib/payments/stripe-provider"
  );

  return stripeCheckoutProvider;
}
