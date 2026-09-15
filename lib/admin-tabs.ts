import type {
  LeadStatus,
  PackageType,
  TuitionPeriodStatus,
  TuitionPaymentMethod,
} from "@prisma/client";

export type AdminTabId =
  | "funnel"
  | "deposit"
  | "active"
  | "individual"
  | "payments"
  | "resigned"
  | "groups";

export const ADMIN_TABS: Array<{ id: AdminTabId; label: string }> = [
  { id: "funnel", label: "Leady" },
  { id: "deposit", label: "Zaliczki" },
  { id: "active", label: "Aktywni" },
  { id: "individual", label: "Indywidualne" },
  { id: "payments", label: "Płatności" },
  { id: "resigned", label: "Rezygnacje" },
  { id: "groups", label: "Grupy" },
];

export function parseAdminTab(value: string | undefined): AdminTabId {
  // Zapisane linki do starej zakładki "Czesne" prowadzą teraz do Płatności.
  if (value === "tuition") {
    return "payments";
  }

  if (value && ADMIN_TABS.some((tab) => tab.id === value)) {
    return value as AdminTabId;
  }

  return "funnel";
}

export type DepositSort = "date" | "level";

export function parseDepositSort(value: string | undefined): DepositSort {
  return value === "level" ? "level" : "date";
}

const DEPOSIT_LEVEL_RANK: Record<PackageType, number> = {
  OSMOKLASISTA: 0,
  MATURA_PODSTAWOWA: 1,
  MATURA_ROZSZERZONA: 2,
  INDYWIDUALNE: 3,
};

export const DEPOSIT_LEVEL_HEADINGS: Record<PackageType, string> = {
  OSMOKLASISTA: "E8",
  MATURA_PODSTAWOWA: "Podstawa",
  MATURA_ROZSZERZONA: "Rozszerzenie",
  INDYWIDUALNE: "Indywidualne",
};

function packageLevelRank(pkg: PackageType | null): number {
  if (!pkg) {
    return 99;
  }
  return DEPOSIT_LEVEL_RANK[pkg] ?? 99;
}

function compareLeadsByDateDesc(a: AdminLeadRow, b: AdminLeadRow): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortLeadsForDepositTab(
  leads: AdminLeadRow[],
  sort: DepositSort,
): AdminLeadRow[] {
  const copy = [...leads];
  if (sort === "date") {
    return copy.sort(compareLeadsByDateDesc);
  }

  return copy.sort((a, b) => {
    const rankDiff =
      packageLevelRank(a.requestedPackage) -
      packageLevelRank(b.requestedPackage);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return compareLeadsByDateDesc(a, b);
  });
}

export function groupDepositLeadsByLevel(
  leads: AdminLeadRow[],
): Array<{ key: string; label: string; leads: AdminLeadRow[] }> {
  const buckets = new Map<string, AdminLeadRow[]>();

  for (const lead of leads) {
    const key = lead.requestedPackage ?? "UNKNOWN";
    const existing = buckets.get(key);
    if (existing) {
      existing.push(lead);
    } else {
      buckets.set(key, [lead]);
    }
  }

  return [...buckets.entries()]
    .map(([key, groupLeads]) => ({
      key,
      label:
        key in DEPOSIT_LEVEL_HEADINGS
          ? DEPOSIT_LEVEL_HEADINGS[key as PackageType]
          : "Inne",
      leads: groupLeads,
      rank: packageLevelRank(
        key === "UNKNOWN" ? null : (key as PackageType),
      ),
    }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ key, label, leads: groupLeads }) => ({
      key,
      label,
      leads: groupLeads,
    }));
}

export type AdminLeadRow = {
  id: string;
  parentName: string;
  studentName: string | null;
  schoolClass: string | null;
  email: string;
  phoneNumber: string;
  requestedPackage: PackageType | null;
  status: LeadStatus;
  skipDeposit: boolean;
  groupId: string | null;
  groupName: string | null;
  groupScheduleSlot: string | null;
  notes: string | null;
  placementTestNotes: string | null;
  referredByParentName: string | null;
  referralCount: number;
  firstMonthDiscountGrosze: number;
  standingDiscountGrosze: number;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  createdAt: string;
  payments: Array<{
    token: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
    providerCheckoutUrl: string | null;
  }>;
};

/**
 * Wiersz panelu Płatności. Typ mieszka tutaj (a nie w `lib/tuition/service.ts`),
 * bo `service` jest `server-only`, a panel to komponent kliencki.
 */
export type AdminBillingRow = {
  leadId: string;
  /** `null` = wiersz wirtualny, okres jeszcze nie istnieje w bazie. */
  periodId: string | null;
  parentName: string;
  studentName: string | null;
  displayName: string;
  phoneNumber: string;
  packageType: PackageType | null;
  baseAmountGrosze: number;
  discountGrosze: number;
  amountDueGrosze: number;
  amountPaidGrosze: number;
  status: TuitionPeriodStatus;
  paymentMethod: TuitionPaymentMethod | null;
  messageSentAt: string | null;
  transferTitle: string | null;
  payUrl: string | null;
  isFirstBillableMonth: boolean;
};

export type AdminMessageTemplate = {
  id: string;
  name: string;
  body: string;
  isDefault: boolean;
};

/** Kolejność kolumn w panelu Płatności — ta sama, co w sortowaniu zaliczek. */
export const BILLING_COLUMNS: Array<{ key: PackageType; label: string }> = [
  { key: "OSMOKLASISTA", label: "E8" },
  { key: "MATURA_PODSTAWOWA", label: "Podstawa" },
  { key: "MATURA_ROZSZERZONA", label: "Rozszerzenie" },
  { key: "INDYWIDUALNE", label: "Indywidualne" },
];

export function groupBillingRowsByPackage(
  rows: AdminBillingRow[],
): Array<{ key: PackageType; label: string; rows: AdminBillingRow[] }> {
  return BILLING_COLUMNS.map((column) => ({
    ...column,
    rows: rows.filter((row) => row.packageType === column.key),
  }));
}

export function filterLeadsForTab(
  leads: AdminLeadRow[],
  tab: AdminTabId,
): AdminLeadRow[] {
  switch (tab) {
    case "funnel":
      return leads.filter(
        (lead) =>
          lead.requestedPackage !== "INDYWIDUALNE" &&
          (lead.status === "PENDING_DEPOSIT" || lead.status === "CANCELLED"),
      );
    case "deposit":
      return leads.filter(
        (lead) =>
          lead.requestedPackage !== "INDYWIDUALNE" &&
          lead.status === "PAID_DEPOSIT",
      );
    case "active":
      return leads.filter(
        (lead) =>
          lead.requestedPackage !== "INDYWIDUALNE" &&
          lead.status === "ACTIVE",
      );
    case "individual":
      return leads.filter(
        (lead) =>
          lead.requestedPackage === "INDYWIDUALNE" &&
          lead.status !== "RESIGNED" &&
          lead.status !== "REFUNDED",
      );
    case "resigned":
      return leads.filter(
        (lead) => lead.status === "RESIGNED" || lead.status === "REFUNDED",
      );
    default:
      return [];
  }
}

export function leadDisplayName(lead: {
  studentName: string | null;
  parentName: string;
}): string {
  const studentName = lead.studentName?.trim();
  return studentName ? studentName : lead.parentName;
}
