export function getBillingPeriod(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
}

export const ONLINE_PAYMENT_EXPIRY_MINUTES = 15;
export const PHONE_PAYMENT_EXPIRY_HOURS = 48;

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
