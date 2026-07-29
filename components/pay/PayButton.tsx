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
  /** Generowany w przeglądarce przed submitem — ten sam ID idzie do CAPI i Pixela. */
  const checkoutEventIdRef = useRef<string | null>(null);

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
    // Preferuj ID wygenerowane lokalnie (gwarantowany match z CAPI).
    const eventId = checkoutEventIdRef.current ?? state.eventId;

    void trackBeginCheckout({
      value: DEPOSIT_AMOUNT_GROSZE / 100,
      eventId,
    }).finally(() => {
      window.location.href = destination;
    });
  }, [state.status, state.url, state.eventId]);

  function handleAction(formData: FormData) {
    const eventId = crypto.randomUUID();
    checkoutEventIdRef.current = eventId;
    formData.set("eventId", eventId);
    formAction(formData);
  }

  return (
    <div className="space-y-3">
      <form action={handleAction}>
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
