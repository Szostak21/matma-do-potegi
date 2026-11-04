"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { assignLeadToGroup, type AssignGroupState } from "@/actions/groups";
import { Button } from "@/components/ui/Button";

const initialState: AssignGroupState = { status: "idle" };

export type AdminGroupOption = {
  id: string;
  name: string;
  scheduleSlot: string;
  packageType: string;
  availableSpots: number;
  maxCapacity: number;
};

type AssignGroupControlProps = {
  leadId: string;
  secret: string;
  currentGroupId: string | null;
  requestedPackage: string | null;
  groups: AdminGroupOption[];
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Przypisywanie...
      </>
    );
  }

  return <>Przypisz</>;
}

export function AssignGroupControl({
  leadId,
  secret,
  currentGroupId,
  requestedPackage,
  groups,
}: AssignGroupControlProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(assignLeadToGroup, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const eligibleGroups = groups.filter(
    (group) =>
      group.packageType === requestedPackage &&
      (group.availableSpots > 0 || group.id === currentGroupId),
  );

  if (!requestedPackage) {
    return (
      <p className="text-xs text-ink/50">
        Brak pakietu - nie można przypisać grupy.
      </p>
    );
  }

  if (eligibleGroups.length === 0) {
    return (
      <p className="text-xs text-ink/50">
        Brak dostępnych grup dla tego pakietu.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <form
        key={`${leadId}-${currentGroupId ?? "none"}`}
        action={formAction}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="secret" value={secret} />
        <select
          name="groupId"
          defaultValue={currentGroupId ?? ""}
          required
          className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-4 py-2 text-xs text-ink"
        >
          <option value="" disabled>
            Wybierz grupę
          </option>
          {eligibleGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} · {group.scheduleSlot}
              {group.id === currentGroupId
                ? " (przypisana)"
                : ` (${group.availableSpots} wolnych)`}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" className="text-xs">
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "success" && state.message ? (
        <p className="text-xs text-olive-700" role="status">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
