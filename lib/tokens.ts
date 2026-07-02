import { randomUUID } from "crypto";

export function generatePaymentToken(): string {
  return randomUUID();
}
