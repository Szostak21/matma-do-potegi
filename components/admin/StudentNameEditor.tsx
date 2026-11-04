"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import {
  updateStudentName,
  type UpdateStudentNameState,
} from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { leadDisplayName } from "@/lib/admin-tabs";

const initialState: UpdateStudentNameState = { status: "idle" };

type StudentNameEditorProps = {
  leadId: string;
  parentName: string;
  studentName: string | null;
  children?: ReactNode;
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

export function StudentNameEditor({
  leadId,
  parentName,
  studentName,
  children,
}: StudentNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateStudentName, initialState);

  if (state.status === "success" && editing) {
    setEditing(false);
  }

  const hasStudentName = Boolean(studentName?.trim());

  if (editing) {
    return (
      <div className="min-w-0 flex-1">
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="leadId" value={leadId} />
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink/45">
              Imię ucznia
            </span>
            <input
              name="studentName"
              defaultValue={studentName ?? ""}
              maxLength={80}
              autoFocus
              placeholder="np. Ania"
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              variant="secondary"
              className="px-4 py-2 text-xs"
            >
              <SubmitLabel />
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-ink/50 underline-offset-2 hover:underline"
            >
              Anuluj
            </button>
          </div>
          {state.status === "error" && state.message ? (
            <p className="text-xs text-red-600">{state.message}</p>
          ) : null}
        </form>
        {children}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="font-serif text-xl text-ink">
          {leadDisplayName({ studentName, parentName })}
        </h3>
        {hasStudentName ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-ink/50 underline-offset-2 hover:underline"
          >
            Zmień
          </button>
        ) : null}
      </div>
      {hasStudentName ? (
        <p className="mt-1 text-sm text-ink/60">Rodzic: {parentName}</p>
      ) : null}
      {children}
      {!hasStudentName ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 text-xs text-ink/50 underline-offset-2 hover:underline"
        >
          Dodaj imię ucznia
        </button>
      ) : null}
    </div>
  );
}
