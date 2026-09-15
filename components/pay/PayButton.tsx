"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { startCheckout, type StartCheckoutState } from "@/actions/payments";
import { Button } from "@/components/ui/Button";
import { trackBeginCheckout } from "@/lib/analytics-events";

const initialState: StartCheckoutState = { status: "idle" };

type PayButtonProps = {
  token: string;
  label: string;
  /**
   * Zdarzenie begin_checkout wysyłamy tylko dla płatności marketingowych (zaliczka).
   * Czesne jest operacyjne, więc przekierowujemy od razu.
   */
  analytics?: { valueGrosze: number };
};

function SubmitLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Przekierowujemy do płatności...
      </>
    );
  }

  return <>{label}</>;
}

export function PayButton({ token, label, analytics }: PayButtonProps) {
  const [state, formAction] = useActionState(startCheckout, initialState);
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

    if (!analytics) {
      window.location.href = destination;
      return;
    }

    // Poczekaj aż InitiateCheckout/begin_checkout wyjdą, potem redirect do bramki.
    // eventId współdzielony z serwerowym CAPI (dedup po stronie Meta).
    void trackBeginCheckout({
      value: analytics.valueGrosze / 100,
      eventId: state.eventId,
    }).finally(() => {
      window.location.href = destination;
    });
  }, [analytics, state.status, state.url, state.eventId]);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary" className="w-full">
          <SubmitLabel label={label} />
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
