import { notFound } from "next/navigation";
import { PackageType, PaymentType } from "@prisma/client";

import { AddLeadModal } from "@/components/admin/AddLeadModal";
import { AdminTabsNav } from "@/components/admin/AdminTabsNav";
import type { AdminGroupOption } from "@/components/admin/AssignGroupControl";
import { DepositSortToggle } from "@/components/admin/DepositSortToggle";
import { LeadCard } from "@/components/admin/LeadCard";
import { PackagePoolSummary } from "@/components/admin/PackagePoolSummary";
import { TuitionPanel } from "@/components/admin/TuitionPanel";
import {
  filterLeadsForTab,
  groupDepositLeadsByLevel,
  parseAdminTab,
  parseDepositSort,
  sortLeadsForDepositTab,
  type AdminLeadRow,
  type AdminTabId,
  type AdminTuitionRow,
} from "@/lib/admin-tabs";
import { verifyAdminSecret } from "@/lib/auth";
import { runLazyValidation } from "@/lib/groups";
import { getAllPackagesAvailability } from "@/lib/packages";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string; tab?: string; sort?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret, tab: tabParam, sort: sortParam } = await searchParams;

  if (!verifyAdminSecret(secret)) {
    notFound();
  }

  await runLazyValidation();

  const tab = parseAdminTab(tabParam);
  const depositSort = parseDepositSort(sortParam);

  const [leads, groups, packageAvailability, tuitionPeriods] =
    await Promise.all([
      prisma.lead.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          group: true,
          referredBy: {
            select: { id: true, parentName: true },
          },
          _count: {
            select: { referrals: true },
          },
          payments: {
            where: { type: PaymentType.DEPOSIT },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.group.findMany({
        orderBy: { scheduleSlot: "asc" },
      }),
      getAllPackagesAvailability(),
      prisma.tuitionPeriod.findMany({
        orderBy: [{ periodMonth: "desc" }, { createdAt: "desc" }],
        include: {
          lead: {
            select: {
              id: true,
              parentName: true,
              studentName: true,
              phoneNumber: true,
              requestedPackage: true,
            },
          },
        },
        take: 100,
      }),
    ]);

  const rows: AdminLeadRow[] = leads.map((lead) => ({
    id: lead.id,
    parentName: lead.parentName,
    studentName: lead.studentName,
    schoolClass: lead.schoolClass,
    email: lead.email,
    phoneNumber: lead.phoneNumber,
    requestedPackage: lead.requestedPackage,
    status: lead.status,
    skipDeposit: lead.skipDeposit,
    groupId: lead.groupId,
    groupName: lead.group?.name ?? null,
    groupScheduleSlot: lead.group?.scheduleSlot ?? null,
    notes: lead.notes,
    placementTestNotes: lead.placementTestNotes,
    referredByParentName: lead.referredBy?.parentName ?? null,
    referralCount: lead._count.referrals,
    firstMonthDiscountGrosze: lead.firstMonthDiscountGrosze,
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    utmContent: lead.utmContent,
    createdAt: lead.createdAt.toISOString(),
    payments: lead.payments.map((payment) => ({
      token: payment.token,
      status: payment.status,
      expiresAt: payment.expiresAt?.toISOString() ?? null,
      stripeSessionUrl: payment.stripeSessionUrl,
    })),
  }));

  const tuitionRows: AdminTuitionRow[] = tuitionPeriods.map((period) => ({
    id: period.id,
    leadId: period.leadId,
    parentName: period.lead.parentName,
    studentName: period.lead.studentName,
    phoneNumber: period.lead.phoneNumber,
    packageType: period.lead.requestedPackage,
    periodMonth: period.periodMonth.toISOString(),
    amountDueGrosze: period.amountDueGrosze,
    amountPaidGrosze: period.amountPaidGrosze,
    status: period.status,
    paymentMethod: period.paymentMethod,
    transferTitle: period.transferTitle,
  }));

  const groupOptions = groups.map((group) => ({
    id: group.id,
    name: group.name,
    scheduleSlot: group.scheduleSlot,
    packageType: group.packageType,
    availableSpots: group.maxCapacity - group.currentCount,
    maxCapacity: group.maxCapacity,
  }));

  const counts: Partial<Record<AdminTabId, number>> = {
    funnel: filterLeadsForTab(rows, "funnel").length,
    deposit: filterLeadsForTab(rows, "deposit").length,
    active: filterLeadsForTab(rows, "active").length,
    individual: filterLeadsForTab(rows, "individual").length,
    tuition: tuitionRows.length,
    resigned: filterLeadsForTab(rows, "resigned").length,
    groups: groups.length,
  };

  const filteredLeads = filterLeadsForTab(rows, tab);
  const visibleLeads =
    tab === "deposit"
      ? sortLeadsForDepositTab(filteredLeads, depositSort)
      : filteredLeads;
  const tuitionEligible = rows.filter(
    (lead) =>
      lead.requestedPackage !== PackageType.INDYWIDUALNE &&
      (lead.status === "PAID_DEPOSIT" || lead.status === "ACTIVE"),
  );

  return (
    <main className="min-h-full flex-1 select-text overflow-x-hidden bg-oatmeal py-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
              Panel administratora
            </p>
            <h1 className="mt-2 font-serif text-3xl text-ink">Operacje</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink/60 sm:mx-0">
              Leady, zaliczki, aktywni, indywidualne, czesne i grupy.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <AddLeadModal secret={secret ?? ""} />
          </div>
        </div>

        <div className="mb-6">
          <AdminTabsNav
            secret={secret ?? ""}
            activeTab={tab}
            counts={counts}
          />
        </div>

        {tab === "groups" ? (
          <div className="space-y-6">
            <PackagePoolSummary availability={packageAvailability} />
            <ul className="mx-auto grid w-full max-w-lg grid-cols-1 gap-3 sm:max-w-none sm:grid-cols-2">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="min-w-0 rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-ink/5"
                >
                  <p className="font-serif text-lg text-ink">{group.name}</p>
                  <p className="mt-1 text-sm text-ink/60">
                    {group.scheduleSlot} · {group.currentCount}/
                    {group.maxCapacity}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "tuition" ? (
          <TuitionPanel
            secret={secret ?? ""}
            periods={tuitionRows}
            eligibleLeads={tuitionEligible}
          />
        ) : null}

        {tab !== "groups" && tab !== "tuition" ? (
          <>
            {tab === "deposit" && visibleLeads.length > 0 ? (
              <DepositSortToggle
                secret={secret ?? ""}
                activeSort={depositSort}
              />
            ) : null}
            {visibleLeads.length === 0 ? (
              <p className="rounded-3xl bg-white/60 px-5 py-8 text-center text-sm text-ink/60 ring-1 ring-ink/5">
                Brak zgłoszeń w tej sekcji.
              </p>
            ) : tab === "deposit" && depositSort === "level" ? (
              <div className="space-y-8">
                {groupDepositLeadsByLevel(visibleLeads).map((group) => (
                  <section key={group.key} className="space-y-3">
                    <div className="flex items-baseline gap-2 px-1">
                      <h2 className="text-xs font-medium uppercase tracking-widest text-olive-700">
                        {group.label}
                      </h2>
                      <span className="text-xs tabular-nums text-ink/40">
                        {group.leads.length}
                      </span>
                    </div>
                    <LeadCardsGrid
                      leads={group.leads}
                      groups={groupOptions}
                      secret={secret ?? ""}
                      showGroupAssign
                    />
                  </section>
                ))}
              </div>
            ) : (
              <LeadCardsGrid
                leads={visibleLeads}
                groups={groupOptions}
                secret={secret ?? ""}
                showGroupAssign={tab !== "individual"}
              />
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

function LeadCardsGrid({
  leads,
  groups,
  secret,
  showGroupAssign,
}: {
  leads: AdminLeadRow[];
  groups: AdminGroupOption[];
  secret: string;
  showGroupAssign: boolean;
}) {
  return (
    <div className="mx-auto grid w-full max-w-lg grid-cols-1 gap-4 md:max-w-none md:grid-cols-2">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          groups={groups}
          secret={secret}
          showGroupAssign={showGroupAssign}
        />
      ))}
    </div>
  );
}
