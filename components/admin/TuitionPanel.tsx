"use client";

import { useActionState, useState } from "react";

import {
  createTuitionPeriod,
  markTuitionPeriodPaid,
  type TuitionPeriodActionState,
} from "@/actions/admin";
import type { AdminLeadRow, AdminTuitionRow } from "@/lib/admin-tabs";
import { packageLabel, TUITION_STATUS_LABELS } from "@/lib/labels";
import { formatPln } from "@/lib/money";
import { Button } from "@/components/ui/Button";

const initialState: TuitionPeriodActionState = { status: "idle" };

type TuitionPanelProps = {
  secret: string;
  periods: AdminTuitionRow[];
  eligibleLeads: AdminLeadRow[];
};

function formatPeriod(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function toMonthKey(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function TuitionPanel({
  secret,
  periods,
  eligibleLeads,
}: TuitionPanelProps) {
  const [createState, createAction] = useActionState(
    createTuitionPeriod,
    initialState,
  );
  const [markState, markAction] = useActionState(
    markTuitionPeriodPaid,
    initialState,
  );

  const now = new Date();
  const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const [filterMonth, setFilterMonth] = useState(defaultMonth);

  const visiblePeriods = periods.filter(
    (period) => toMonthKey(period.periodMonth) === filterMonth,
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 md:max-w-none">
      <form
        action={createAction}
        className="rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-ink/5"
      >
        <h2 className="font-serif text-xl text-ink">Utwórz okres czesnego</h2>
        <p className="mt-1 text-sm text-ink/60">
          Auto-kwota: pełna stawka. −50 zł zaliczki i zniżka referral tylko przy
          pierwszym miesiącu (lub miesiącu startu czesnego). Możesz podać
          własną kwotę w groszach.
        </p>
        <input type="hidden" name="secret" value={secret} />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-ink/45">Lead</span>
            <select
              name="leadId"
              required
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2"
              defaultValue=""
            >
              <option value="" disabled>
                Wybierz…
              </option>
              {eligibleLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.parentName} · {packageLabel(lead.requestedPackage)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-ink/45">Miesiąc</span>
            <input
              type="month"
              name="periodMonth"
              required
              defaultValue={defaultMonth}
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-ink/45">
              Kwota (grosze, opcjonalnie)
            </span>
            <input
              type="number"
              name="amountDueGrosze"
              min={0}
              step={100}
              placeholder="auto"
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2"
            />
          </label>
        </div>
        <div className="mt-4">
          <Button type="submit" variant="primary">
            Utwórz
          </Button>
        </div>
        {createState.message ? (
          <p
            className={`mt-2 text-sm ${createState.status === "error" ? "text-red-700" : "text-olive-700"}`}
          >
            {createState.message}
          </p>
        ) : null}
      </form>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-ink/45">
            Podgląd miesiąca
          </span>
          <input
            type="month"
            value={filterMonth}
            onChange={(event) => setFilterMonth(event.target.value)}
            className="rounded-xl border border-ink/10 bg-white px-3 py-2"
          />
        </label>
        <p className="text-sm text-ink/50">
          {visiblePeriods.length} z {periods.length} okresów
        </p>
      </div>

      {markState.message ? (
        <p
          className={`text-sm ${markState.status === "error" ? "text-red-700" : "text-olive-700"}`}
        >
          {markState.message}
        </p>
      ) : null}

      {visiblePeriods.length === 0 ? (
        <p className="text-sm text-ink/60">
          Brak okresów czesnego w wybranym miesiącu.
        </p>
      ) : (
        <ul className="space-y-3">
          {visiblePeriods.map((period) => (
            <li
              key={period.id}
              className="rounded-3xl bg-white/80 p-5 shadow-soft ring-1 ring-ink/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-lg text-ink">
                    {period.parentName}
                  </p>
                  <p className="text-sm text-ink/60">
                    {formatPeriod(period.periodMonth)} ·{" "}
                    {packageLabel(period.packageType)}
                  </p>
                </div>
                <span className="rounded-full bg-olive-50 px-3 py-1 text-xs text-olive-800">
                  {TUITION_STATUS_LABELS[period.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/80">
                Do zapłaty:{" "}
                <strong>{formatPln(period.amountDueGrosze)}</strong>
                {period.amountPaidGrosze > 0
                  ? ` · wpłacono ${formatPln(period.amountPaidGrosze)}`
                  : ""}
              </p>
              {period.transferTitle ? (
                <p className="mt-1 font-mono text-xs text-ink/50">
                  {period.transferTitle}
                </p>
              ) : null}
              {period.status !== "PAID" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={markAction}>
                    <input type="hidden" name="secret" value={secret} />
                    <input type="hidden" name="periodId" value={period.id} />
                    <input type="hidden" name="paymentMethod" value="CASH" />
                    <Button type="submit" variant="secondary">
                      Oznacz gotówka
                    </Button>
                  </form>
                  <form action={markAction}>
                    <input type="hidden" name="secret" value={secret} />
                    <input type="hidden" name="periodId" value={period.id} />
                    <input type="hidden" name="paymentMethod" value="TRANSFER" />
                    <Button type="submit" variant="secondary">
                      Oznacz przelew
                    </Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
