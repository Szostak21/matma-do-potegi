"use client";

import type { LeadStatus, PackageType } from "@prisma/client";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GeneratePaymentButton } from "@/components/admin/GeneratePaymentButton";
import { LEAD_STATUS_LABELS, packageLabel } from "@/lib/labels";
import { buildPayUrl, findActiveDepositPayment } from "@/lib/payments";

export type AdminLeadRow = {
  id: string;
  parentName: string;
  studentName: string | null;
  email: string;
  phoneNumber: string;
  requestedPackage: PackageType | null;
  status: LeadStatus;
  createdAt: string;
  payments: Array<{
    token: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
  }>;
};

type LeadsTableProps = {
  leads: AdminLeadRow[];
  secret: string;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="text-xs"
      onClick={handleCopy}
    >
      {copied ? "Skopiowano" : "Kopiuj link"}
    </Button>
  );
}

function LeadAction({
  lead,
  secret,
}: {
  lead: AdminLeadRow;
  secret: string;
}) {
  const activePayment = findActiveDepositPayment(
    lead.payments.map((payment) => ({
      ...payment,
      expiresAt: payment.expiresAt ? new Date(payment.expiresAt) : null,
    })),
  );

  if (lead.status === "UNVERIFIED") {
    return <GeneratePaymentButton leadId={lead.id} secret={secret} />;
  }

  if (lead.status === "PENDING_DEPOSIT" && activePayment) {
    const payUrl = buildPayUrl(activePayment.token);

    return (
      <div className="space-y-2">
        <p className="text-xs text-ink/70">
          <a
            href={payUrl}
            className="break-all font-medium text-ink underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {payUrl}
          </a>
        </p>
        <CopyLinkButton url={payUrl} />
      </div>
    );
  }

  if (lead.status === "PENDING_DEPOSIT") {
    return (
      <GeneratePaymentButton leadId={lead.id} secret={secret} />
    );
  }

  if (lead.status === "PAID_DEPOSIT") {
    return (
      <span className="text-xs font-medium text-olive-700">
        Kaucja opłacona
      </span>
    );
  }

  return <span className="text-xs text-ink/40">—</span>;
}

export function LeadsTable({ leads, secret }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-ink/60">
          Brak zgłoszeń w bazie.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
            <th className="px-6 py-4 font-medium">Rodzic</th>
            <th className="px-6 py-4 font-medium">Uczeń</th>
            <th className="px-6 py-4 font-medium">Kontakt</th>
            <th className="px-6 py-4 font-medium">Pakiet</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Data</th>
            <th className="px-6 py-4 font-medium">Akcja</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b border-ink/5 last:border-b-0"
            >
              <td className="px-6 py-4 font-medium text-ink">
                {lead.parentName}
              </td>
              <td className="px-6 py-4 text-ink/80">
                {lead.studentName ?? "—"}
              </td>
              <td className="px-6 py-4 text-ink/80">
                <div>{lead.email}</div>
                <div className="text-xs text-ink/50">{lead.phoneNumber}</div>
              </td>
              <td className="px-6 py-4 text-ink/80">
                {packageLabel(lead.requestedPackage)}
              </td>
              <td className="px-6 py-4">
                <Badge>{LEAD_STATUS_LABELS[lead.status]}</Badge>
              </td>
              <td className="px-6 py-4 text-ink/60">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-6 py-4">
                <LeadAction lead={lead} secret={secret} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
