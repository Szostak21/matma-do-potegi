import type { LeadStatus, PackageType, TuitionPeriodStatus } from "@prisma/client";

import { PACKAGES } from "@/lib/constants";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  PENDING_DEPOSIT: "Oczekuje na zaliczkę",
  PAID_DEPOSIT: "Zaliczka opłacona",
  ACTIVE: "Aktywny",
  CANCELLED: "Anulowany",
  RESIGNED: "Rezygnacja",
  REFUNDED: "Zwrot zaliczki",
};

export const TUITION_STATUS_LABELS: Record<TuitionPeriodStatus, string> = {
  DUE: "Do zapłaty",
  PAID: "Opłacone",
  PARTIAL: "Częściowo",
  WAIVED: "Umorzone",
};

export function packageLabel(pkg: PackageType | null | undefined): string {
  if (!pkg) {
    return "-";
  }

  return PACKAGES[pkg]?.name ?? pkg;
}
