"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  generateDepositPayment,
  type GeneratePaymentState,
} from "@/actions/payments";
import { Button } from "@/components/ui/Button";

const initialState: GeneratePaymentState = { status: "idle" };

type GeneratePaymentButtonProps = {
  leadId: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Generowanie...
      </>
    );
  }

  return <>Generuj link płatności</>;
}

export function GeneratePaymentButton({ leadId }: GeneratePaymentButtonProps) {
  const [state, formAction] = useActionState(
    generateDepositPayment,
    initialState,
  );

  return (
    <div className="space-y-2">
      <form action={formAction} className="inline">
        <input type="hidden" name="leadId" value={leadId} />
        <Button type="submit" variant="secondary" className="text-xs">
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "success" && state.payUrl ? (
        <p className="text-xs text-olive-700">
          Link:{" "}
          <a
            href={state.payUrl}
            className="break-all font-medium underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {state.payUrl}
          </a>
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-600">{state.message}</p>
      ) : null}
    </div>
  );
}
