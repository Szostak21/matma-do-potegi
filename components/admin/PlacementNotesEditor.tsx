"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updatePlacementTestNotes,
  type UpdatePlacementNotesState,
} from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const initialState: UpdatePlacementNotesState = { status: "idle" };

type PlacementNotesEditorProps = {
  leadId: string;
  secret: string;
  defaultValue: string | null;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Zapis...
      </>
    );
  }

  return <>Zapisz</>;
}

export function PlacementNotesEditor({
  leadId,
  secret,
  defaultValue,
}: PlacementNotesEditorProps) {
  const [state, formAction] = useActionState(
    updatePlacementTestNotes,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="secret" value={secret} />
      <Textarea
        name="placementTestNotes"
        rows={2}
        defaultValue={defaultValue ?? ""}
        placeholder="Wynik testu poziomującego, obserwacje..."
        className="text-xs"
      />
      <Button type="submit" variant="secondary" className="text-xs">
        <SubmitLabel />
      </Button>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-600">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="text-xs text-olive-700">{state.message}</p>
      ) : null}
    </form>
  );
}
