import { notFound } from "next/navigation";
import { PaymentType } from "@prisma/client";

import { LeadsTable } from "@/components/admin/LeadsTable";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";
import { verifyAdminSecret } from "@/lib/auth";

type AdminPageProps = {
  searchParams: Promise<{ secret?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { secret } = await searchParams;

  if (!verifyAdminSecret(secret)) {
    notFound();
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      payments: {
        where: { type: PaymentType.DEPOSIT },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const rows = leads.map((lead) => ({
    id: lead.id,
    parentName: lead.parentName,
    studentName: lead.studentName,
    email: lead.email,
    phoneNumber: lead.phoneNumber,
    requestedPackage: lead.requestedPackage,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
    payments: lead.payments.map((payment) => ({
      token: payment.token,
      status: payment.status,
      expiresAt: payment.expiresAt?.toISOString() ?? null,
    })),
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
            Weryfikacja leadów i generowanie linków płatności kaucji.
          </p>
        </div>

        <LeadsTable leads={rows} secret={secret ?? ""} />
      </Container>
    </main>
  );
}
