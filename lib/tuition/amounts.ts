import type { Lead } from "@prisma/client";

import {
  DEPOSIT_AMOUNT_GROSZE,
  packageMonthlyPriceGrosze,
} from "@/lib/constants";

/** Po 20. dniu miesiąca rozliczamy już kolejny miesiąc. */
const NEXT_MONTH_SWITCH_DAY = 20;

export type SuggestedAmounts = {
  baseAmountGrosze: number;
  discountGrosze: number;
};

export type SuggestionContext = {
  /** Czy to pierwszy rozliczany miesiąc tego klienta. */
  isFirstBillableMonth: boolean;
  hasPaidDeposit: boolean;
  /** Ostatnia kwota bazowa tego klienta — źródło stawki dla zajęć indywidualnych. */
  previousBaseAmountGrosze: number | null;
};

/**
 * Domyślny miesiąc panelu: do 20. bieżący (jeszcze zbierasz wpłaty),
 * od 21. następny (wysyłasz linki z wyprzedzeniem).
 */
export function resolveBillingMonth(now: Date = new Date()): Date {
  const monthOffset = now.getDate() > NEXT_MONTH_SWITCH_DAY ? 1 : 0;

  return new Date(Date.UTC(now.getFullYear(), now.getMonth() + monthOffset, 1));
}

export function computeAmountDue(
  baseAmountGrosze: number,
  discountGrosze: number,
): number {
  return Math.max(0, baseAmountGrosze - discountGrosze);
}

/**
 * Propozycja kwoty i zniżki dla klienta w danym miesiącu. Zniżka jest sumą stałej
 * zniżki z profilu oraz — tylko w pierwszym miesiącu — zaliczki i bonusów z poleceń.
 */
export function computeSuggestedAmounts(
  lead: Pick<
    Lead,
    | "requestedPackage"
    | "skipDeposit"
    | "firstMonthPaid"
    | "firstMonthDiscountGrosze"
    | "standingDiscountGrosze"
  >,
  context: SuggestionContext,
): SuggestedAmounts {
  const baseFromPricing = packageMonthlyPriceGrosze(lead.requestedPackage);
  const baseAmountGrosze =
    baseFromPricing > 0
      ? baseFromPricing
      : (context.previousBaseAmountGrosze ?? 0);

  let discountGrosze = lead.standingDiscountGrosze;

  if (context.isFirstBillableMonth) {
    discountGrosze += lead.firstMonthDiscountGrosze;

    const depositCounts =
      !lead.skipDeposit && (context.hasPaidDeposit || lead.firstMonthPaid);

    if (depositCounts) {
      discountGrosze += DEPOSIT_AMOUNT_GROSZE;
    }
  }

  return { baseAmountGrosze, discountGrosze };
}
