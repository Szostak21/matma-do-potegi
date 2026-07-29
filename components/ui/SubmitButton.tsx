"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, type MutableRefObject } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";

type SubmitButtonProps = {
  disabled?: boolean;
};

/**
 * Musi być potomkiem <form> — useFormStatus czyta pending z akcji formularza.
 * Chroni przed przypadkowym zamknięciem / odświeżeniem w trakcie wysyłki.
 */
export function PreventUnloadWhilePending() {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!pending) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pending]);

  return null;
}

type ReleaseSubmitLockOnSettleProps = {
  lockedRef: MutableRefObject<boolean>;
  /** true np. przy success — zostaw lock do redirectu. */
  keepLocked: boolean;
};

/**
 * Odblokowuje lokalny lock submitu, gdy pending kończy się bez sukcesu
 * (błąd walidacji, fail sieci, timeout). Musi być wewnątrz <form>.
 */
export function ReleaseSubmitLockOnSettle({
  lockedRef,
  keepLocked,
}: ReleaseSubmitLockOnSettleProps) {
  const { pending } = useFormStatus();
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !pending && !keepLocked) {
      lockedRef.current = false;
    }

    wasPendingRef.current = pending;
  }, [pending, keepLocked, lockedRef]);

  return null;
}

export function SubmitButton({ disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      className="w-full"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Wysyłanie...
        </>
      ) : (
        "Wyślij zgłoszenie"
      )}
    </Button>
  );
}
