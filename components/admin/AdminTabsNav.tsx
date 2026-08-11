"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminTabId } from "@/lib/admin-tabs";
import { ADMIN_TABS } from "@/lib/admin-tabs";
import { cn } from "@/lib/cn";

type AdminTabsNavProps = {
  secret: string;
  activeTab: AdminTabId;
  counts: Partial<Record<AdminTabId, number>>;
};

export function AdminTabsNav({
  secret,
  activeTab,
  counts,
}: AdminTabsNavProps) {
  const [showResigned, setShowResigned] = useState(activeTab === "resigned");

  const visibleTabs = ADMIN_TABS.filter(
    (tab) => tab.id !== "resigned" || showResigned,
  );

  return (
    <div className="space-y-2">
      <nav
        className="-mx-1 flex gap-1 overflow-x-auto pb-1"
        aria-label="Sekcje panelu"
      >
        {visibleTabs.map((tab) => {
          const href = `/admin?secret=${encodeURIComponent(secret)}&tab=${tab.id}`;
          const count = counts[tab.id];
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-sm transition",
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
          onClick={() => setShowResigned(true)}
          className="text-xs text-ink/50 underline-offset-2 hover:underline"
        >
          Pokaż rezygnacje
          {typeof counts.resigned === "number" ? ` (${counts.resigned})` : ""}
        </button>
      ) : null}
    </div>
  );
}
