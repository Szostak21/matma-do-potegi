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
  | "tuition"
  | "resigned"
  | "groups";

export const ADMIN_TABS: Array<{ id: AdminTabId; label: string }> = [
  { id: "funnel", label: "Lejek" },
  { id: "deposit", label: "Zaliczka OK" },
  { id: "active", label: "Aktywni" },
  { id: "individual", label: "Indywidualne" },
  { id: "tuition", label: "Czesne" },
  { id: "resigned", label: "Rezygnacje" },
  { id: "groups", label: "Grupy" },
];

export function parseAdminTab(value: string | undefined): AdminTabId {
  if (value && ADMIN_TABS.some((tab) => tab.id === value)) {
    return value as AdminTabId;
  }

  return "funnel";
}

export type AdminLeadRow = {
  id: string;
  parentName: string;
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
  createdAt: string;
  payments: Array<{
    token: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
    stripeSessionUrl: string | null;
  }>;
};

export type AdminTuitionRow = {
  id: string;
  leadId: string;
  parentName: string;
  phoneNumber: string;
  packageType: PackageType | null;
  periodMonth: string;
  amountDueGrosze: number;
  amountPaidGrosze: number;
  status: TuitionPeriodStatus;
  paymentMethod: TuitionPaymentMethod | null;
  transferTitle: string | null;
};

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
      return leads.filter((lead) => lead.requestedPackage === "INDYWIDUALNE");
    case "resigned":
      return leads.filter(
        (lead) => lead.status === "RESIGNED" || lead.status === "REFUNDED",
      );
    default:
      return [];
  }
}
