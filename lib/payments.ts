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

export function buildPayUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (base) {
    return `${base}/pay/${token}`;
  }

  return `/pay/${token}`;
}

export function findActiveDepositPayment<
  T extends PaymentLike & { token: string; status: PaymentStatus },
>(payments: T[]): T | undefined {
  return payments.find(
    (payment) =>
      payment.status === "PENDING" && !isPaymentExpired(payment),
  );
}
