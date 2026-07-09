"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  softDeleteLead,
  type SoftDeleteLeadState,
} from "@/actions/admin";
import { Button } from "@/components/ui/Button";

const initialState: SoftDeleteLeadState = { status: "idle" };

type DeleteLeadButtonProps = {
  leadId: string;
  secret: string;
  parentName: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Usuwanie...
      </>
    );
  }

  return <>Usuń</>;
}

export function DeleteLeadButton({
  leadId,
  secret,
  parentName,
}: DeleteLeadButtonProps) {
  const [state, formAction] = useActionState(softDeleteLead, initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Usunąć zgłoszenie: ${parentName}? Miejsce w puli zostanie zwolnione.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div className="space-y-1">
      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="secret" value={secret} />
        <Button type="submit" variant="secondary" className="text-xs text-red-700">
          <SubmitLabel />
        </Button>
      </form>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-600">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="text-xs text-olive-700">{state.message}</p>
      ) : null}
    </div>
  );
}
