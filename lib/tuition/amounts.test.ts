import { describe, expect, it } from "vitest";

import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";
import {
  computeAmountDue,
  computeSuggestedAmounts,
  resolveBillingMonth,
} from "@/lib/tuition/amounts";

const lead = {
  requestedPackage: "MATURA_ROZSZERZONA" as const,
  skipDeposit: false,
  firstMonthPaid: false,
  firstMonthDiscountGrosze: 5000,
  standingDiscountGrosze: 2000,
};

describe("tuition amounts", () => {
  it("never bills a negative amount and treats a negative discount as a surcharge", () => {
    expect(computeAmountDue(1000, 2500)).toBe(0);
    expect(computeAmountDue(10000, -1500)).toBe(11500);
  });

  it("applies the deposit and referral bonus only in the first month", () => {
    const first = computeSuggestedAmounts(lead, {
      isFirstBillableMonth: true,
      hasPaidDeposit: true,
      previousBaseAmountGrosze: null,
    });

    expect(first.baseAmountGrosze).toBe(46000);
    expect(first.discountGrosze).toBe(2000 + 5000 + DEPOSIT_AMOUNT_GROSZE);
    expect(computeAmountDue(first.baseAmountGrosze, first.discountGrosze)).toBe(
      34000,
    );

    const later = computeSuggestedAmounts(lead, {
      isFirstBillableMonth: false,
      hasPaidDeposit: true,
      previousBaseAmountGrosze: null,
    });
    expect(later.discountGrosze).toBe(2000);
  });

  it("skips the deposit credit when the deposit was waived", () => {
    const suggested = computeSuggestedAmounts(
      { ...lead, skipDeposit: true },
      {
        isFirstBillableMonth: true,
        hasPaidDeposit: false,
        previousBaseAmountGrosze: null,
      },
    );

    expect(suggested.discountGrosze).toBe(2000 + 5000);
  });

  it("uses the previous amount for hourly lessons", () => {
    const suggested = computeSuggestedAmounts(
      { ...lead, requestedPackage: "INDYWIDUALNE" },
      {
        isFirstBillableMonth: false,
        hasPaidDeposit: false,
        previousBaseAmountGrosze: 18000,
      },
    );

    expect(suggested.baseAmountGrosze).toBe(18000);
  });

  it("switches the billing month after the 20th", () => {
    expect(resolveBillingMonth(new Date(2026, 9, 20)).toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    expect(resolveBillingMonth(new Date(2026, 9, 21)).toISOString()).toBe(
      "2026-11-01T00:00:00.000Z",
    );
  });
});
