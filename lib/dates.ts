export function getBillingPeriod(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

/** "2026-10-01" → "październik 2026" (miesiąc rozliczeniowy trzymamy w UTC). */
export function formatBillingMonth(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "2026-10-01" → "2026-10" (wartość dla `input type="month"`). */
export function toMonthInputValue(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

/** "2026-10" → Date UTC pierwszego dnia miesiąca. `null` gdy format jest nieprawidłowy. */
export function parseMonthInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, 1));
}

/** Czesne płatne do 5. dnia miesiąca, którego dotyczy. */
export const TUITION_DUE_DAY = 5;

/** "2026-10-01" → "5 października" (termin płatności w treści wiadomości). */
export function formatTuitionDueDate(
  month: Date,
  day: number = TUITION_DUE_DAY,
): string {
  const dueDate = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day),
  );

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(dueDate);
}

export const ONLINE_PAYMENT_EXPIRY_MINUTES = 30;
export const PHONE_PAYMENT_EXPIRY_HOURS = 24;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
