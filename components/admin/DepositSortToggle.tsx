"use client";

import { Calendar, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

import type { DepositSort } from "@/lib/admin-tabs";
import { cn } from "@/lib/cn";

type DepositSortToggleProps = {
  secret: string;
  activeSort: DepositSort;
};

const OPTIONS: Array<{
  id: DepositSort;
  label: string;
  Icon: typeof Calendar;
}> = [
  { id: "date", label: "Data", Icon: Calendar },
  { id: "level", label: "Poziom", Icon: Layers },
];

function hrefForSort(secret: string, sort: DepositSort): string {
  const params = new URLSearchParams({
    secret,
    tab: "deposit",
  });
  if (sort === "level") {
    params.set("sort", "level");
  }
  return `/admin?${params.toString()}`;
}

export function DepositSortToggle({
  secret,
  activeSort,
}: DepositSortToggleProps) {
  const router = useRouter();

  return (
    <div className="mb-4 flex flex-col gap-1.5 sm:mb-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink/45">
        Sortowanie
      </span>
      <div
        role="group"
        aria-label="Sortowanie zaliczek"
        className="grid grid-cols-2 rounded-full bg-white/80 p-1 ring-1 ring-ink/10 sm:inline-flex"
      >
        {OPTIONS.map((option) => {
          const isActive = activeSort === option.id;
          const Icon = option.Icon;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                router.replace(hrefForSort(secret, option.id), {
                  scroll: false,
                })
              }
              className={cn(
                "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm transition sm:px-4",
                isActive
                  ? "bg-ink text-cream shadow-sm"
                  : "text-ink/60 hover:text-ink",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
