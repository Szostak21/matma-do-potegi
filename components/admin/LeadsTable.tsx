"use client";

import type { LeadStatus, PackageType } from "@prisma/client";
import { useState } from "react";

import {
  AssignGroupControl,
  type AdminGroupOption,
} from "@/components/admin/AssignGroupControl";
import { GeneratePaymentButton } from "@/components/admin/GeneratePaymentButton";
import { ResendPaymentLink24hButton } from "@/components/admin/ResendPaymentLink24hButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LEAD_STATUS_LABELS, packageLabel } from "@/lib/labels";
import {
  findActiveDepositPayment,
  getActiveDepositCheckoutUrl,
} from "@/lib/payments";

export type AdminLeadRow = {
  id: string;
  parentName: string;
  studentName: string | null;
  email: string;
  phoneNumber: string;
  requestedPackage: PackageType | null;
  status: LeadStatus;
  groupId: string | null;
  groupName: string | null;
  groupScheduleSlot: string | null;
  createdAt: string;
  payments: Array<{
    token: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
    expiresAt: string | null;
    stripeSessionUrl: string | null;
  }>;
};

type LeadsTableProps = {
  leads: AdminLeadRow[];
  groups: AdminGroupOption[];
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
  groups,
  secret,
}: {
  lead: AdminLeadRow;
  groups: AdminGroupOption[];
  secret: string;
}) {
  const activePayment = findActiveDepositPayment(
    lead.payments.map((payment) => ({
      ...payment,
      expiresAt: payment.expiresAt ? new Date(payment.expiresAt) : null,
    })),
  );
  const checkoutUrl = getActiveDepositCheckoutUrl(activePayment);
  const canAssign =
    lead.status === "UNVERIFIED" || lead.status === "PENDING_DEPOSIT";

  if (lead.status === "PAID_DEPOSIT") {
    return (
      <span className="text-xs font-medium text-olive-700">
        {LEAD_STATUS_LABELS.PAID_DEPOSIT}
      </span>
    );
  }

  if (lead.status === "CANCELLED") {
    const groupOption = lead.groupId
      ? groups.find((group) => group.id === lead.groupId)
      : null;

    return (
      <div className="space-y-2">
        {lead.groupName ? (
          <p className="text-xs text-ink/70">
            Grupa:{" "}
            <span className="font-medium text-ink">{lead.groupName}</span>
            {lead.groupScheduleSlot ? ` · ${lead.groupScheduleSlot}` : ""}
          </p>
        ) : (
          <p className="text-xs text-ink/50">Brak przypisanej grupy.</p>
        )}
        {groupOption ? (
          <p className="text-xs text-ink/50">
            Wolne miejsca: {groupOption.availableSpots} / {groupOption.maxCapacity}
          </p>
        ) : null}
        <p className="text-xs text-amber-700">
          Rezerwacja wygasła — możesz wysłać nowy link 24h i przywrócić miejsce,
          jeśli jest dostępne.
        </p>
        <ResendPaymentLink24hButton leadId={lead.id} secret={secret} />
      </div>
    );
  }

  if (!canAssign) {
    return <span className="text-xs text-ink/40">—</span>;
  }

  return (
    <div className="space-y-3">
      <AssignGroupControl
        leadId={lead.id}
        secret={secret}
        currentGroupId={lead.groupId}
        requestedPackage={lead.requestedPackage}
        groups={groups}
      />

      {!lead.groupId ? (
        <p className="text-xs text-ink/50">
          Warto najpierw przypisać grupę — mail z potwierdzeniem będzie
          zawierał termin zajęć.
        </p>
      ) : null}

      {lead.status === "PENDING_DEPOSIT" ? (
        <div className="space-y-2">
          {checkoutUrl ? (
            <>
              <p className="text-xs text-ink/70">
                <a
                  href={checkoutUrl}
                  className="break-all font-medium text-ink underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {checkoutUrl}
                </a>
              </p>
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton url={checkoutUrl} />
                <ResendPaymentLink24hButton leadId={lead.id} secret={secret} />
              </div>
            </>
          ) : (
            <ResendPaymentLink24hButton leadId={lead.id} secret={secret} />
          )}
        </div>
      ) : (
        <GeneratePaymentButton leadId={lead.id} secret={secret} />
      )}
    </div>
  );
}

export function LeadsTable({ leads, groups, secret }: LeadsTableProps) {
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
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
            <th className="px-6 py-4 font-medium">Rodzic</th>
            <th className="px-6 py-4 font-medium">Uczeń</th>
            <th className="px-6 py-4 font-medium">Kontakt</th>
            <th className="px-6 py-4 font-medium">Pakiet</th>
            <th className="px-6 py-4 font-medium">Grupa</th>
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
              <td className="px-6 py-4 text-ink/80">
                {lead.groupName ? (
                  <div>
                    <div className="font-medium text-ink">{lead.groupName}</div>
                    {lead.groupScheduleSlot ? (
                      <div className="text-xs text-ink/50">
                        {lead.groupScheduleSlot}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-ink/40">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                <Badge>{LEAD_STATUS_LABELS[lead.status]}</Badge>
              </td>
              <td className="px-6 py-4 text-ink/60">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-6 py-4">
                <LeadAction lead={lead} groups={groups} secret={secret} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
