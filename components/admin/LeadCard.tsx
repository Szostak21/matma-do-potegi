"use client";

import { useActionState, useState } from "react";

import {
  toggleSkipDeposit,
  type ToggleSkipDepositState,
} from "@/actions/admin";
import type { AdminGroupOption } from "@/components/admin/AssignGroupControl";
import { AssignGroupControl } from "@/components/admin/AssignGroupControl";
import { GeneratePaymentButton } from "@/components/admin/GeneratePaymentButton";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { PlacementNotesEditor } from "@/components/admin/PlacementNotesEditor";
import { ResendPaymentLink24hButton } from "@/components/admin/ResendPaymentLink24hButton";
import { StandingDiscountEditor } from "@/components/admin/StandingDiscountEditor";
import { StudentNameEditor } from "@/components/admin/StudentNameEditor";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AdminLeadRow } from "@/lib/admin-tabs";
import { packageMonthlyPriceGrosze } from "@/lib/constants";
import { LEAD_STATUS_LABELS, packageLabel } from "@/lib/labels";
import { formatPln } from "@/lib/money";
import {
  findActiveDepositPayment,
  getActiveDepositCheckoutUrl,
} from "@/lib/payments";
import { formatTrafficSourceLabel } from "@/lib/utm";

const skipDepositInitial: ToggleSkipDepositState = { status: "idle" };

type LeadCardProps = {
  lead: AdminLeadRow;
  groups: AdminGroupOption[];
  secret: string;
  showGroupAssign?: boolean;
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
      className="w-full"
      onClick={handleCopy}
    >
      {copied ? "Skopiowano" : "Kopiuj link płatności"}
    </Button>
  );
}

export function LeadCard({
  lead,
  groups,
  secret,
  showGroupAssign = true,
}: LeadCardProps) {
  const activePayment = findActiveDepositPayment(
    lead.payments.map((payment) => ({
      ...payment,
      expiresAt: payment.expiresAt ? new Date(payment.expiresAt) : null,
    })),
  );
  const checkoutUrl = getActiveDepositCheckoutUrl(activePayment);
  const canGenerateLink = lead.status === "PENDING_DEPOSIT";
  const canRenewLink =
    lead.status === "PENDING_DEPOSIT" || lead.status === "CANCELLED";
  const [skipState, skipAction] = useActionState(
    toggleSkipDeposit,
    skipDepositInitial,
  );
  const trafficSource = formatTrafficSourceLabel(lead);
  const isBilled = lead.status === "PAID_DEPOSIT" || lead.status === "ACTIVE";

  return (
    <article className="min-w-0 w-full overflow-hidden rounded-3xl bg-white/80 p-4 shadow-soft ring-1 ring-ink/5 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <StudentNameEditor
          leadId={lead.id}
          secret={secret}
          parentName={lead.parentName}
          studentName={lead.studentName}
        >
          <p className="mt-1 text-sm text-ink/60">
            {packageLabel(lead.requestedPackage)}
            {lead.schoolClass ? ` · kl. ${lead.schoolClass}` : ""}
          </p>
        </StudentNameEditor>
        <Badge>{LEAD_STATUS_LABELS[lead.status]}</Badge>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink/45">Telefon</dt>
          <dd>
            <a
              href={`tel:${lead.phoneNumber}`}
              className="underline-offset-2 hover:underline"
            >
              {lead.phoneNumber}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink/45">E-mail</dt>
          <dd className="break-all">{lead.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink/45">Utworzono</dt>
          <dd>{formatDate(lead.createdAt)}</dd>
        </div>
        {lead.groupName ? (
          <div>
            <dt className="text-xs text-ink/45">Grupa</dt>
            <dd>
              {lead.groupName}
              {lead.groupScheduleSlot ? ` · ${lead.groupScheduleSlot}` : ""}
            </dd>
          </div>
        ) : null}
        {lead.firstMonthDiscountGrosze > 0 ? (
          <div>
            <dt className="text-xs text-ink/45">Zniżka X</dt>
            <dd>{formatPln(lead.firstMonthDiscountGrosze)}</dd>
          </div>
        ) : null}
        {lead.referredByParentName ? (
          <div>
            <dt className="text-xs text-ink/45">Polecenie od</dt>
            <dd>{lead.referredByParentName}</dd>
          </div>
        ) : null}
        {lead.skipDeposit && lead.requestedPackage !== "INDYWIDUALNE" ? (
          <div>
            <dt className="text-xs text-ink/45">Zaliczka</dt>
            <dd>Pominięta</dd>
          </div>
        ) : null}
      </dl>

      {trafficSource ? (
        <p className="mt-3 text-[11px] leading-snug text-ink/35">
          Źródło: {trafficSource}
        </p>
      ) : null}

      {lead.notes ? (
        <p className="mt-3 rounded-2xl bg-oatmeal/80 px-3 py-2 text-sm text-ink/70">
          {lead.notes}
        </p>
      ) : null}

      <div className="mt-4 space-y-3 border-t border-ink/5 pt-4">
        <LeadStatusSelect
          key={`${lead.id}-${lead.status}`}
          leadId={lead.id}
          secret={secret}
          currentStatus={lead.status}
        />

        {showGroupAssign &&
        (lead.status === "PAID_DEPOSIT" || lead.status === "ACTIVE") ? (
          <AssignGroupControl
            key={`${lead.id}-group-${lead.groupId ?? "none"}`}
            leadId={lead.id}
            secret={secret}
            currentGroupId={lead.groupId}
            requestedPackage={lead.requestedPackage}
            groups={groups}
          />
        ) : null}

        {isBilled ? (
          <StandingDiscountEditor
            key={`${lead.id}-standing-${lead.standingDiscountGrosze}`}
            leadId={lead.id}
            secret={secret}
            standingDiscountGrosze={lead.standingDiscountGrosze}
            monthlyPriceGrosze={packageMonthlyPriceGrosze(
              lead.requestedPackage,
            )}
          />
        ) : null}

        {canGenerateLink || canRenewLink ? (
          <div className="space-y-2">
            {canGenerateLink && checkoutUrl ? (
              <CopyLinkButton url={checkoutUrl} />
            ) : null}
            {canGenerateLink ? (
              <GeneratePaymentButton leadId={lead.id} secret={secret} />
            ) : null}
            {canRenewLink ? (
              <ResendPaymentLink24hButton leadId={lead.id} secret={secret} />
            ) : null}
          </div>
        ) : null}

        {lead.requestedPackage !== "INDYWIDUALNE" && lead.skipDeposit ? (
          <form action={skipAction} className="space-y-1">
            <input type="hidden" name="secret" value={secret} />
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="skipDeposit" value="false" />
            <Button
              type="submit"
              variant="secondary"
              className="w-full text-xs"
            >
              Wymagaj zaliczki
            </Button>
            {skipState.message ? (
              <p
                className={`text-xs ${skipState.status === "error" ? "text-red-700" : "text-olive-700"}`}
              >
                {skipState.message}
              </p>
            ) : null}
          </form>
        ) : null}

        <PlacementNotesEditor
          key={`${lead.id}-notes`}
          leadId={lead.id}
          secret={secret}
          defaultValue={lead.placementTestNotes}
        />
      </div>
    </article>
  );
}
