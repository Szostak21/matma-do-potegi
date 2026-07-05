import { notFound } from "next/navigation";
import { PaymentType } from "@prisma/client";

import { LeadsTable } from "@/components/admin/LeadsTable";
import { ResetDatabaseButton } from "@/components/admin/ResetDatabaseButton";
import { Container } from "@/components/ui/Container";
import { verifyAdminSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret } = await searchParams;

  if (!verifyAdminSecret(secret)) {
    notFound();
  }

  const [leads, groups] = await Promise.all([
    prisma.lead.findMany({
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
  ]);

  const rows = leads.map((lead) => ({
    id: lead.id,
    parentName: lead.parentName,
    studentName: lead.studentName,
    email: lead.email,
    phoneNumber: lead.phoneNumber,
    requestedPackage: lead.requestedPackage,
    status: lead.status,
    groupId: lead.groupId,
    groupName: lead.group?.name ?? null,
    groupScheduleSlot: lead.group?.scheduleSlot ?? null,
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
    <main className="min-h-full flex-1 bg-oatmeal py-12">
      <Container>
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-olive-700">
            Panel administratora
          </p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Zgłoszenia</h1>
          <p className="mt-2 text-sm text-ink/60">
            Przypisanie grupy, generowanie linków płatności i wysyłka maili z
            linkiem do zaliczki.
          </p>
        </div>

        <div className="mb-8">
          <ResetDatabaseButton secret={secret ?? ""} />
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
