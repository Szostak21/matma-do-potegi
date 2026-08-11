"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminTabId } from "@/lib/admin-tabs";
import { ADMIN_TABS } from "@/lib/admin-tabs";
import { cn } from "@/lib/cn";

type AdminTabsNavProps = {
  secret: string;
  activeTab: AdminTabId;
  counts: Partial<Record<AdminTabId, number>>;
};

function tabHref(secret: string, tabId: AdminTabId): string {
  return `/admin?secret=${encodeURIComponent(secret)}&tab=${tabId}`;
}

export function AdminTabsNav({
  secret,
  activeTab,
  counts,
}: AdminTabsNavProps) {
  const router = useRouter();
  const [showResigned, setShowResigned] = useState(activeTab === "resigned");

  const visibleTabs = ADMIN_TABS.filter(
    (tab) => tab.id !== "resigned" || showResigned,
  );

  return (
    <div className="w-full space-y-2">
      {/* Mobile: select — no horizontal scroll */}
      <label className="block md:hidden">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink/45">
          Sekcja
        </span>
        <select
          value={activeTab}
          onChange={(event) => {
            const next = event.target.value as AdminTabId;
            if (next === "resigned") {
              setShowResigned(true);
            }
            router.push(tabHref(secret, next));
          }}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base text-ink"
        >
          {visibleTabs.map((tab) => {
            const count = counts[tab.id];
            const label =
              typeof count === "number" ? `${tab.label} (${count})` : tab.label;
            return (
              <option key={tab.id} value={tab.id}>
                {label}
              </option>
            );
          })}
          {!showResigned ? (
            <option value="resigned">
              Rezygnacje
              {typeof counts.resigned === "number"
                ? ` (${counts.resigned})`
                : ""}
            </option>
          ) : null}
        </select>
      </label>

      {/* Desktop: wrap, never overflow-x */}
      <nav
        className="hidden flex-wrap gap-2 md:flex"
        aria-label="Sekcje panelu"
      >
        {visibleTabs.map((tab) => {
          const href = tabHref(secret, tab.id);
          const count = counts[tab.id];
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm transition",
                isActive
                  ? "bg-ink text-cream"
                  : "bg-white/70 text-ink/70 ring-1 ring-ink/10 hover:text-ink",
              )}
            >
              {tab.label}
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    isActive ? "text-cream/70" : "text-ink/40",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {!showResigned ? (
        <button
          type="button"
          onClick={() => {
            setShowResigned(true);
            router.push(tabHref(secret, "resigned"));
          }}
          className="hidden text-xs text-ink/50 underline-offset-2 hover:underline md:inline"
        >
          Pokaż rezygnacje
          {typeof counts.resigned === "number" ? ` (${counts.resigned})` : ""}
        </button>
      ) : null}
    </div>
  );
}
