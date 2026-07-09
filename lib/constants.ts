import type { PackageType } from "@prisma/client";

export const DEPOSIT_AMOUNT_GROSZE = 5000;

/** Globalna pula miejsc per pakiet (niezależna od limitu 4 osób w grupie). */
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
    priceHourly: 12000,
    durationMinutes: 60,
  },
} as const;
