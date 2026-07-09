import type { LeadStatus, PackageType } from "@prisma/client";

import { PACKAGES } from "@/lib/constants";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  UNVERIFIED: "Niezweryfikowany",
  PENDING_DEPOSIT: "Oczekuje na zaliczkę",
  PAID_DEPOSIT: "Zaliczka opłacona",
  ACTIVE: "Aktywny",
  SUSPENDED: "Zawieszony",
  CANCELLED: "Anulowany",
};

export function packageLabel(pkg: PackageType | null | undefined): string {
  if (!pkg) {
    return "-";
  }

  return PACKAGES[pkg]?.name ?? pkg;
}
