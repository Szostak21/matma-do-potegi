"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import {
  simulatePayment,
  type SimulatePaymentState,
} from "@/actions/payments";
import { Button } from "@/components/ui/Button";

const initialState: SimulatePaymentState = { status: "idle" };

type PayButtonProps = {
  token: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Przetwarzanie...
      </>
    );
  }

  return <>Zapłać</>;
}

export function PayButton({ token }: PayButtonProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(simulatePayment, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary" className="w-full">
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "error" && state.message ? (
        <p className="text-center text-sm text-red-600">{state.message}</p>
      ) : null}
    </div>
  );
}
