"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  startDepositCheckout,
  type StartDepositCheckoutState,
} from "@/actions/payments";
import { Button } from "@/components/ui/Button";
import { DEPOSIT_PAYMENT } from "@/lib/content";
import { trackBeginCheckout } from "@/lib/analytics-events";
import { DEPOSIT_AMOUNT_GROSZE } from "@/lib/constants";

const initialState: StartDepositCheckoutState = { status: "idle" };

type PayButtonProps = {
  token: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Przekierowujemy do płatności...
      </>
    );
  }

  return <>{DEPOSIT_PAYMENT.payButtonLabel}</>;
}

export function PayButton({ token }: PayButtonProps) {
  const [state, formAction] = useActionState(startDepositCheckout, initialState);
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (
      state.status !== "success" ||
      !state.url ||
      redirectStartedRef.current
    ) {
      return;
    }

    redirectStartedRef.current = true;
    const destination = state.url;
    const eventId = state.eventId;

    // Poczekaj aż InitiateCheckout/begin_checkout wyjdą, potem redirect do Stripe.
    // eventId współdzielony z serwerowym CAPI (dedup po stronie Meta).
    void trackBeginCheckout({
      value: DEPOSIT_AMOUNT_GROSZE / 100,
      eventId,
    }).finally(() => {
      window.location.href = destination;
    });
  }, [state.status, state.url, state.eventId]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary" className="w-full">
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "error" && state.message ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
