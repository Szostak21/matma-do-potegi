"use client";

import type { PackageType } from "@prisma/client";
import { Calendar, Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { reserveGroup } from "@/actions/groups";
import { Button } from "@/components/ui/Button";
import { AlternateTermPhoneGate } from "@/components/ui/AlternateTermPhoneGate";
import { Card } from "@/components/ui/Card";
import {
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  FOOTER,
  formatRemainingSpots,
  getDisplayedAvailableSpots,
  GROUP_MAX_CAPACITY,
  GROUP_SELECTION,
} from "@/lib/content";
import type { AvailableGroup } from "@/lib/types/groups";
import { cn } from "@/lib/cn";
import { formatPln } from "@/lib/money";

type GroupSelectionProps = {
  leadId: string;
  packageType: PackageType;
};

export function GroupSelection({ leadId, packageType }: GroupSelectionProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<AvailableGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadGroups() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/groups?package=${encodeURIComponent(packageType)}`,
        );

        if (!response.ok) {
          throw new Error("fetch failed");
        }

        const data = (await response.json()) as { groups: AvailableGroup[] };

        if (!cancelled) {
          setGroups(data.groups);
        }
      } catch {
        if (!cancelled) {
          setError("Nie udało się pobrać dostępnych terminów.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      cancelled = true;
    };
  }, [packageType]);

  function handleReserve() {
    if (!selectedGroupId) {
      setError(GROUP_SELECTION.selectGroup);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await reserveGroup(leadId, selectedGroupId);

      if (result.status === "success" && result.leadId) {
        router.push(`/rezerwacja/${result.leadId}/podsumowanie`);
        return;
      }

      setError(result.message ?? GROUP_SELECTION.errorReserve);
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Loader2 className="size-8 animate-spin text-olive-600" aria-hidden />
        <p className="text-sm text-ink/60">{GROUP_SELECTION.loading}</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="space-y-6 py-4 text-center">
        <h3 className="font-serif text-2xl text-ink">
          {GROUP_SELECTION.noGroupsTitle}
        </h3>
        <p className="text-sm leading-relaxed text-ink/70">
          {GROUP_SELECTION.noGroupsDescription}
        </p>
        <div className="rounded-2xl bg-oatmeal/80 p-5 text-sm text-ink/80">
          <p className="font-medium">{GROUP_SELECTION.contactPrompt}</p>
          <p className="mt-2">
            <a
              href={`mailto:${FOOTER.email}`}
              className="underline-offset-2 hover:underline"
            >
              {FOOTER.email}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="underline-offset-2 hover:underline"
            >
              {CONTACT_PHONE}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          const displayedAvailable = getDisplayedAvailableSpots(
            group.availableSpots,
          );
          const spotsText = formatRemainingSpots(
            displayedAvailable,
            GROUP_MAX_CAPACITY,
          );

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroupId(group.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  "cursor-pointer transition hover:ring-olive-200",
                  isSelected && "ring-2 ring-olive-600",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">{group.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink/70">
                      <Calendar className="size-4 shrink-0" aria-hidden />
                      {group.scheduleSlot}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-olive-800">
                      <Users className="size-4 shrink-0" aria-hidden />
                      {spotsText}
                    </span>
                    <span className="text-sm text-ink/70">
                      Abonament: {formatPln(group.priceMonthly)}/mies.
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        disabled={isPending || !selectedGroupId}
        onClick={handleReserve}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {GROUP_SELECTION.reserving}
          </>
        ) : (
          GROUP_SELECTION.reserveButton
        )}
      </Button>

      <AlternateTermPhoneGate />
    </div>
  );
}
