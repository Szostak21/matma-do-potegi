"use client";

import { useActionState, useRef } from "react";
import { LeadStatus } from "@prisma/client";

import {
  updateLeadStatus,
  type UpdateLeadStatusState,
} from "@/actions/admin";
import { LEAD_STATUS_LABELS } from "@/lib/labels";

const initialState: UpdateLeadStatusState = { status: "idle" };

type LeadStatusSelectProps = {
  leadId: string;
  secret: string;
  currentStatus: LeadStatus;
};

export function LeadStatusSelect({
  leadId,
  secret,
  currentStatus,
}: LeadStatusSelectProps) {
  const [state, formAction] = useActionState(updateLeadStatus, initialState);
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <form
      action={formAction}
      className="space-y-1"
      onSubmit={(event) => {
        const next = selectRef.current?.value;
        if (!next || next === currentStatus) {
          event.preventDefault();
          return;
        }

        const label = LEAD_STATUS_LABELS[next as LeadStatus] ?? next;
        if (
          !window.confirm(
            `Zmienić status na „${label}"? Tej zmiany nie da się cofnąć jednym kliknięciem.`,
          )
        ) {
          event.preventDefault();
          if (selectRef.current) {
            selectRef.current.value = currentStatus;
          }
        }
      }}
    >
      <input type="hidden" name="secret" value={secret} />
      <input type="hidden" name="leadId" value={leadId} />
      <label className="block text-[11px] font-medium uppercase tracking-wide text-ink/45">
        Zmień status
      </label>
      <select
        ref={selectRef}
        name="status"
        defaultValue={currentStatus}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
      >
        {Object.values(LeadStatus).map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {state.status === "error" ? (
        <p className="text-xs text-red-700">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-xs text-olive-700">{state.message}</p>
      ) : null}
    </form>
  );
}
