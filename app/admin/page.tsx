import { notFound } from "next/navigation";
import { PaymentType } from "@prisma/client";

import { LeadsTable } from "@/components/admin/LeadsTable";
import { PackagePoolSummary } from "@/components/admin/PackagePoolSummary";
import { ResetDatabaseButton } from "@/components/admin/ResetDatabaseButton";
import { Container } from "@/components/ui/Container";
import { verifyAdminSecret } from "@/lib/auth";
import { runLazyValidation } from "@/lib/groups";
import { getAllPackagesAvailability } from "@/lib/packages";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string; showDeleted?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret, showDeleted } = await searchParams;

  if (!verifyAdminSecret(secret)) {
    notFound();
  }

  await runLazyValidation();

  const includeDeleted = showDeleted === "1";

  const [leads, groups, packageAvailability] = await Promise.all([
    prisma.lead.findMany({
      where: includeDeleted ? undefined : { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        group: true,
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
  ]);

  const rows = leads.map((lead) => ({
    id: lead.id,
    parentName: lead.parentName,
    studentName: lead.studentName,
    schoolClass: lead.schoolClass,
    expectedResult: lead.expectedResult,
    email: lead.email,
    phoneNumber: lead.phoneNumber,
    requestedPackage: lead.requestedPackage,
    status: lead.status,
    groupId: lead.groupId,
    groupName: lead.group?.name ?? null,
    groupScheduleSlot: lead.group?.scheduleSlot ?? null,
    notes: lead.notes,
    placementTestNotes: lead.placementTestNotes,
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

  const groupOptions = groups.map((group) => ({
    id: group.id,
    name: group.name,
    scheduleSlot: group.scheduleSlot,
    packageType: group.packageType,
    availableSpots: group.maxCapacity - group.currentCount,
    maxCapacity: group.maxCapacity,
  }));

  return (
    <main className="min-h-full flex-1 select-text bg-oatmeal py-12">
      <Container>
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
            Panel administratora
          </p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Zgłoszenia</h1>
          <p className="mt-2 text-sm text-ink/60">
            Rezerwacja na poziomie, przypisanie do grupy, generowanie linków
            płatności i zarządzanie zgłoszeniami.
          </p>
        </div>

        <PackagePoolSummary availability={packageAvailability} />

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <ResetDatabaseButton secret={secret ?? ""} />
          <a
            href={
              includeDeleted
                ? `/admin?secret=${encodeURIComponent(secret ?? "")}`
                : `/admin?secret=${encodeURIComponent(secret ?? "")}&showDeleted=1`
            }
            className="text-sm text-ink/60 underline-offset-2 hover:text-ink hover:underline"
          >
            {includeDeleted ? "Ukryj usunięte" : "Pokaż usunięte"}
          </a>
        </div>

        <LeadsTable
          leads={rows}
          groups={groupOptions}
          secret={secret ?? ""}
        />
      </Container>
    </main>
  );
}
