"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import {
  renewDepositPaymentLink24h,
  type RenewPaymentLinkState,
} from "@/actions/payments";
import { Button } from "@/components/ui/Button";

const initialState: RenewPaymentLinkState = { status: "idle" };

type ResendPaymentLink24hButtonProps = {
  leadId: string;
  secret: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Wysyłanie...
      </>
    );
  }

  return <>Wyślij link 24h</>;
}

export function ResendPaymentLink24hButton({
  leadId,
  secret,
}: ResendPaymentLink24hButtonProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    renewDepositPaymentLink24h,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="space-y-2">
      <form action={formAction} className="inline">
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="secret" value={secret} />
        <Button type="submit" variant="primary" className="text-xs">
          <SubmitLabel />
        </Button>
      </form>

      {state.status === "success" && state.message ? (
        <p className="text-xs text-olive-700" role="status">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <div className="space-y-1">
          <p className="text-xs text-red-600" role="alert">
            {state.message}
          </p>
          {state.payUrl ? (
            <p className="text-xs text-ink/70">
              Link:{" "}
              <a
                href={state.payUrl}
                className="break-all font-medium text-ink underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {state.payUrl}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
