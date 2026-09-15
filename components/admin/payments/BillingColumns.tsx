"use client";

import type { PackageType } from "@prisma/client";

import { BillingRowCard } from "@/components/admin/payments/BillingRowCard";
import { Checkbox } from "@/components/ui/Checkbox";
import type { AdminBillingRow } from "@/lib/admin-tabs";
import { groupBillingRowsByPackage } from "@/lib/admin-tabs";
import { formatPln } from "@/lib/money";

type BillingColumnsProps = {
  rows: AdminBillingRow[];
  selectedLeadIds: Set<string>;
  pendingLeadIds: Set<string>;
  onToggleSelect: (leadId: string) => void;
  onToggleColumn: (packageType: PackageType, selectAll: boolean) => void;
  onChangeBase: (row: AdminBillingRow, grosze: number) => void;
  onChangeDiscount: (row: AdminBillingRow, grosze: number) => void;
};

/**
 * Cztery kolumny poziomów na desktopie; na mobile składają się w jedną kolumnę,
 * a nagłówki poziomów zostają jako sekcje.
 */
export function BillingColumns({
  rows,
  selectedLeadIds,
  pendingLeadIds,
  onToggleSelect,
  onToggleColumn,
  onChangeBase,
  onChangeDiscount,
}: BillingColumnsProps) {
  const columns = groupBillingRowsByPackage(rows);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const selectableRows = column.rows.filter(
          (row) => row.status !== "PAID" && row.status !== "WAIVED",
        );
        const allSelected =
          selectableRows.length > 0 &&
          selectableRows.every((row) => selectedLeadIds.has(row.leadId));
        const paidCount = column.rows.filter(
          (row) => row.status === "PAID",
        ).length;
        const dueTotal = selectableRows.reduce(
          (sum, row) => sum + row.amountDueGrosze,
          0,
        );

        return (
          <section key={column.key} className="min-w-0">
            <div className="mb-2 flex items-center gap-2 rounded-2xl bg-white/60 px-3 py-2 ring-1 ring-ink/5">
              <Checkbox
                checked={allSelected}
                disabled={selectableRows.length === 0}
                onChange={(event) =>
                  onToggleColumn(column.key, event.target.checked)
                }
                aria-label={`Zaznacz wszystkich: ${column.label}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium uppercase tracking-wide text-olive-700">
                  {column.label}
                </p>
                <p className="text-[11px] tabular-nums text-ink/45">
                  {paidCount}/{column.rows.length} opłacone ·{" "}
                  {formatPln(dueTotal)}
                </p>
              </div>
            </div>

            {column.rows.length === 0 ? (
              <p className="rounded-2xl bg-white/40 px-3 py-4 text-center text-xs text-ink/45">
                Brak klientów
              </p>
            ) : (
              <ul className="space-y-2">
                {column.rows.map((row) => (
                  <BillingRowCard
                    key={row.leadId}
                    row={row}
                    isSelected={selectedLeadIds.has(row.leadId)}
                    isPending={pendingLeadIds.has(row.leadId)}
                    onToggleSelect={onToggleSelect}
                    onChangeBase={onChangeBase}
                    onChangeDiscount={onChangeDiscount}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
