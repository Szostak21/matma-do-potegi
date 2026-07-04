import type { Payment, PaymentStatus } from "@prisma/client";

export type PaymentDisplayState =
  | "paid"
  | "pending"
  | "expired"
  | "cancelled";

type PaymentLike = Pick<Payment, "status" | "expiresAt">;

export function isPaymentExpired(payment: PaymentLike): boolean {
  if (payment.status !== "PENDING") {
    return false;
  }

  if (!payment.expiresAt) {
    return false;
  }

  return payment.expiresAt < new Date();
}

export function getPaymentDisplayState(
  payment: PaymentLike,
): PaymentDisplayState {
  if (payment.status === "PAID") {
    return "paid";
  }

  if (payment.status === "CANCELLED" || payment.status === "EXPIRED") {
    return "cancelled";
  }

  if (isPaymentExpired(payment)) {
    return "expired";
  }

  return "pending";
}

export function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  return base;
}

export function buildSuccessUrl(token: string): string {
  return `${getAppBaseUrl()}/pay/success?token=${encodeURIComponent(token)}`;
}

export function buildCancelUrl(token: string): string {
  return `${getAppBaseUrl()}/pay/cancel?token=${encodeURIComponent(token)}`;
}

export function findActiveDepositPayment<
  T extends PaymentLike & {
    token: string;
    status: PaymentStatus;
    stripeSessionUrl?: string | null;
  },
>(payments: T[]): T | undefined {
  return payments.find(
    (payment) =>
      payment.status === "PENDING" && !isPaymentExpired(payment),
  );
}

export function getActiveDepositCheckoutUrl<
  T extends PaymentLike & {
    status: PaymentStatus;
    stripeSessionUrl?: string | null;
  },
>(payment: T | undefined): string | undefined {
  if (!payment || isPaymentExpired(payment)) {
    return undefined;
  }

  return payment.stripeSessionUrl ?? undefined;
}
