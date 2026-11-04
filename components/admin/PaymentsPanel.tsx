"use client";

import type { PackageType } from "@prisma/client";
import { Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  bulkSetBaseAmount,
  generatePaymentMessages,
  updateBillingRow,
  type GeneratedMessage,
} from "@/actions/tuition";
import { GeneratedMessages } from "@/components/admin/payments/GeneratedMessages";
import { BillingColumns } from "@/components/admin/payments/BillingColumns";
import { MessageComposer } from "@/components/admin/payments/MessageComposer";
import { MoneyField } from "@/components/admin/payments/MoneyField";
import { Button } from "@/components/ui/Button";
import type { AdminBillingRow, AdminMessageTemplate } from "@/lib/admin-tabs";
import { formatBillingMonth, parseMonthInputValue } from "@/lib/dates";
import { formatPln } from "@/lib/money";

type PaymentsPanelProps = {
  /** Format `YYYY-MM` — źródłem prawdy jest URL, żeby dane szły z serwera. */
  month: string;
  rows: AdminBillingRow[];
  templates: AdminMessageTemplate[];
};

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-ink/5">
      <p className="text-[10px] uppercase tracking-wide text-ink/40">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function selectionStorageKey(month: string): string {
  return `matma-payments-selection-${month}`;
}

export function PaymentsPanel({ month, rows, templates }: PaymentsPanelProps) {
  const router = useRouter();

  const defaultTemplateBody =
    templates.find((template) => template.isDefault)?.body ??
    templates[0]?.body ??
    "";

  const [body, setBody] = useState(defaultTemplateBody);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pendingLeadIds, setPendingLeadIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [defaultAmountGrosze, setDefaultAmountGrosze] = useState(0);
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [skipped, setSkipped] = useState<
    Array<{ displayName: string; reason: string }>
  >([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();

  // Przypadkowe odświeżenie nie może skasować pracy — zaznaczenie trzymamy per miesiąc.
  // sessionStorage istnieje dopiero po hydratacji, więc przywrócenie musi być w efekcie.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = window.sessionStorage.getItem(selectionStorageKey(month));

    setSelectedLeadIds(
      stored ? new Set(JSON.parse(stored) as string[]) : new Set(),
    );
    setMessages([]);
    setSkipped([]);
    setFeedback(null);
  }, [month]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    window.sessionStorage.setItem(
      selectionStorageKey(month),
      JSON.stringify([...selectedLeadIds]),
    );
  }, [month, selectedLeadIds]);

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedLeadIds.has(row.leadId)),
    [rows, selectedLeadIds],
  );

  const totals = useMemo(() => {
    const unsettled = rows.filter(
      (row) => row.status !== "PAID" && row.status !== "WAIVED",
    );

    return {
      dueGrosze: unsettled.reduce((sum, row) => sum + row.amountDueGrosze, 0),
      paidGrosze: rows
        .filter((row) => row.status === "PAID")
        .reduce((sum, row) => sum + row.amountDueGrosze, 0),
      sentCount: unsettled.filter((row) => row.messageSentAt).length,
      paidCount: rows.filter((row) => row.status === "PAID").length,
      selectedGrosze: selectedRows.reduce(
        (sum, row) => sum + row.amountDueGrosze,
        0,
      ),
    };
  }, [rows, selectedRows]);

  const withRowPending = useCallback(
    (
      leadId: string,
      action: () => Promise<{ status: string; message?: string }>,
    ) => {
      setPendingLeadIds((current) => new Set(current).add(leadId));

      void action()
        .then((result) => {
          setFeedback(
            result.status === "error" ? (result.message ?? null) : null,
          );
          router.refresh();
        })
        .finally(() => {
          setPendingLeadIds((current) => {
            const next = new Set(current);
            next.delete(leadId);
            return next;
          });
        });
    },
    [router],
  );

  const handleChangeBase = useCallback(
    (row: AdminBillingRow, grosze: number) => {
      withRowPending(row.leadId, () =>
        updateBillingRow({
          leadId: row.leadId,
          month,
          baseAmountGrosze: grosze,
          discountGrosze: row.discountGrosze,
        }),
      );
    },
    [month, withRowPending],
  );

  const handleChangeDiscount = useCallback(
    (row: AdminBillingRow, grosze: number) => {
      withRowPending(row.leadId, () =>
        updateBillingRow({
          leadId: row.leadId,
          month,
          baseAmountGrosze: row.baseAmountGrosze,
          discountGrosze: grosze,
        }),
      );
    },
    [month, withRowPending],
  );

  function handleToggleSelect(leadId: string) {
    setSelectedLeadIds((current) => {
      const next = new Set(current);

      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }

      return next;
    });
  }

  function handleToggleColumn(packageType: PackageType, selectAll: boolean) {
    const columnLeadIds = rows
      .filter(
        (row) =>
          row.packageType === packageType &&
          row.status !== "PAID" &&
          row.status !== "WAIVED",
      )
      .map((row) => row.leadId);

    setSelectedLeadIds((current) => {
      const next = new Set(current);

      for (const leadId of columnLeadIds) {
        if (selectAll) {
          next.add(leadId);
        } else {
          next.delete(leadId);
        }
      }

      return next;
    });
  }

  function handleMonthChange(value: string) {
    if (!parseMonthInputValue(value)) {
      return;
    }

    const params = new URLSearchParams({
      tab: "payments",
      month: value,
    });

    router.replace(`/admin?${params.toString()}`, { scroll: false });
  }

  function handleApplyDefaultAmount() {
    if (selectedRows.length === 0) {
      setFeedback("Zaznacz klientów, dla których chcesz ustawić kwotę.");
      return;
    }

    startGenerating(async () => {
      const result = await bulkSetBaseAmount({
        month,
        leadIds: selectedRows.map((row) => row.leadId),
        baseAmountGrosze: defaultAmountGrosze,
      });

      setFeedback(result.message ?? null);
      router.refresh();
    });
  }

  function handleGenerate() {
    if (selectedRows.length === 0) {
      setFeedback("Zaznacz przynajmniej jednego klienta.");
      return;
    }

    startGenerating(async () => {
      const result = await generatePaymentMessages({
        month,
        leadIds: selectedRows.map((row) => row.leadId),
        templateBody: body,
      });

      if (result.status === "error") {
        setFeedback(result.message);
        return;
      }

      setMessages(result.messages);
      setSkipped(result.skipped);
      setFeedback(
        result.messages.length === 0
          ? "Nie udało się wygenerować żadnej wiadomości."
          : null,
      );
      router.refresh();
    });
  }

  const monthDate = parseMonthInputValue(month);

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl text-ink">Płatności</h2>
          <p className="mt-1 text-sm text-ink/60">
            {monthDate
              ? `Czesne za ${formatBillingMonth(monthDate)}`
              : "Wybierz miesiąc rozliczeniowy"}
          </p>
        </div>
        <label className="block shrink-0 text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wide text-ink/40">
            Miesiąc
          </span>
          <input
            type="month"
            value={month}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm tabular-nums sm:w-auto"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryTile label="Do zapłaty" value={formatPln(totals.dueGrosze)} />
        <SummaryTile label="Opłacone" value={formatPln(totals.paidGrosze)} />
        <SummaryTile
          label="Wysłane"
          value={`${totals.sentCount} z ${rows.length}`}
        />
        <SummaryTile
          label="Rozliczeni"
          value={`${totals.paidCount} z ${rows.length}`}
        />
      </div>

      <MessageComposer
        templates={templates}
        body={body}
        onChangeBody={setBody}
      />

      <div className="flex flex-col gap-3 rounded-3xl bg-white/60 p-3.5 ring-1 ring-ink/5 sm:flex-row sm:items-end sm:gap-4 sm:p-4">
        <div className="w-full sm:w-40">
          <MoneyField
            label="Kwota domyślna"
            valueGrosze={defaultAmountGrosze}
            onCommit={setDefaultAmountGrosze}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full px-4 py-2.5 text-xs sm:w-auto"
          disabled={isGenerating}
          onClick={handleApplyDefaultAmount}
        >
          Zastosuj do zaznaczonych
        </Button>
        <p className="text-[11px] leading-snug text-ink/45 sm:ml-auto sm:max-w-xs sm:text-right">
          Kwoty i zniżki jednorazowe edytujesz tutaj. Stała zniżka klienta jest
          na jego karcie w zakładkach Aktywni i Zaliczki.
        </p>
      </div>

      {feedback ? (
        <p className="rounded-2xl bg-white/70 px-4 py-2.5 text-sm text-ink/70 ring-1 ring-ink/5">
          {feedback}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-3xl bg-white/60 px-5 py-8 text-center text-sm text-ink/60 ring-1 ring-ink/5">
          Brak aktywnych klientów do rozliczenia.
        </p>
      ) : (
        <BillingColumns
          rows={rows}
          selectedLeadIds={selectedLeadIds}
          pendingLeadIds={pendingLeadIds}
          onToggleSelect={handleToggleSelect}
          onToggleColumn={handleToggleColumn}
          onChangeBase={handleChangeBase}
          onChangeDiscount={handleChangeDiscount}
        />
      )}

      <GeneratedMessages messages={messages} skipped={skipped} />

      {/* Pasek akcji: na mobile przyklejony do dołu, na desktopie w toku strony. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-cream/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:rounded-3xl lg:border lg:border-ink/5 lg:bg-white/70 lg:px-5 lg:py-4 lg:pb-4 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="min-w-0 text-xs text-ink/60 sm:text-sm">
            Zaznaczono {selectedRows.length}
            {selectedRows.length > 0 ? (
              <span className="tabular-nums">
                {" · "}
                {formatPln(totals.selectedGrosze)}
              </span>
            ) : null}
          </p>
          <Button
            type="button"
            variant="primary"
            className="shrink-0 px-4 py-2.5 text-xs sm:px-6 sm:text-sm"
            disabled={isGenerating || selectedRows.length === 0}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <MessageSquare className="size-4" aria-hidden />
            )}
            Wygeneruj wiadomości
          </Button>
        </div>
      </div>
    </div>
  );
}
