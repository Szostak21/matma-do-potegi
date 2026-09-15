import type { PackageType } from "@prisma/client";

export const DEPOSIT_AMOUNT_GROSZE = 5000;

/** Zniżka na pierwsze czesne (październik) — polecający i polecony, po opłaceniu zaliczki. */
export const REFERRAL_DISCOUNT_GROSZE = 5000;

/** Globalna pula miejsc per pakiet (niezależna od limitu miejsc w pojedynczym slocie godzinowym). */
export const PACKAGE_CAPACITY: Record<PackageType, number> = {
  MATURA_ROZSZERZONA: 16,
  MATURA_PODSTAWOWA: 8,
  OSMOKLASISTA: 8,
  INDYWIDUALNE: 999,
};

export const PACKAGES = {
  MATURA_ROZSZERZONA: {
    name: "Matura Rozszerzona",
    priceMonthly: 46000,
    durationMinutes: 120,
  },
  MATURA_PODSTAWOWA: {
    name: "Matura Podstawowa",
    priceMonthly: 34000,
    durationMinutes: 90,
  },
  OSMOKLASISTA: {
    name: "Egzamin Ósmoklasisty",
    priceMonthly: 34000,
    durationMinutes: 90,
  },
  INDYWIDUALNE: {
    name: "Zajęcia Indywidualne",
    priceHourly: 18000,
    durationMinutes: 60,
  },
} as const;

/**
 * Miesięczna stawka czesnego z cennika. Zajęcia indywidualne rozliczamy per godzina,
 * więc nie mają stawki miesięcznej — kwotę wpisuje się ręcznie.
 */
export function packageMonthlyPriceGrosze(
  packageType: PackageType | null | undefined,
): number {
  if (!packageType || packageType === "INDYWIDUALNE") {
    return 0;
  }

  const pkg = PACKAGES[packageType];

  return "priceMonthly" in pkg ? pkg.priceMonthly : 0;
}
