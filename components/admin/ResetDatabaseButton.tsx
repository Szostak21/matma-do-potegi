"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { resetDatabase, type ResetDatabaseState } from "@/actions/admin";
import { Button } from "@/components/ui/Button";

const initialState: ResetDatabaseState = { status: "idle" };

type ResetDatabaseButtonProps = {
  secret: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Resetowanie...
      </>
    );
  }

  return <>Resetuj bazę do seeda</>;
}

export function ResetDatabaseButton({ secret }: ResetDatabaseButtonProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(resetDatabase, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-red-700">
        Narzędzia deweloperskie
      </p>
      <h2 className="mt-1 font-serif text-lg text-ink">Reset bazy danych</h2>
      <p className="mt-2 text-sm text-ink/70">
        Usuwa wszystkie leady, płatności i przywraca grupy oraz nauczyciela do
        stanu po <code className="text-xs">npm run db:seed</code>. Operacja
        jest nieodwracalna.
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="secret" value={secret} />
        <div className="space-y-1">
          <label
            htmlFor="reset-confirm"
            className="text-xs font-medium text-ink/70"
          >
            Wpisz RESET, aby potwierdzić
          </label>
          <input
            id="reset-confirm"
            name="confirm"
            type="text"
            autoComplete="off"
            placeholder="RESET"
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none ring-olive-600 focus:ring-2"
          />
        </div>

        <Button
          type="submit"
          variant="secondary"
          className="border-red-300 text-red-800 hover:bg-red-100"
        >
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "success" && state.message ? (
        <p className="mt-3 text-sm text-olive-700" role="status">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
