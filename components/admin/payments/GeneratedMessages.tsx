"use client";

import { Check, Copy, Send } from "lucide-react";
import { useState, useTransition } from "react";

import {
  markPeriodPaid,
  toggleMessageSent,
  type GeneratedMessage,
} from "@/actions/tuition";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatPln } from "@/lib/money";

type GeneratedMessagesProps = {
  messages: GeneratedMessage[];
  skipped: Array<{ displayName: string; reason: string }>;
};

function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("px-3 py-2 text-xs", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Skopiowano" : label}
    </Button>
  );
}

function MessageCard({ message }: { message: GeneratedMessage }) {
  const [isSent, setIsSent] = useState(Boolean(message.messageSentAt));
  const [settledLabel, setSettledLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    action: () => Promise<{ status: string; message?: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      setError(result.status === "error" ? (result.message ?? null) : null);
    });
  }

  return (
    <li
      className={cn(
        "min-w-0 rounded-2xl bg-white/85 p-3.5 ring-1 ring-ink/5 transition sm:p-4",
        isPending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {message.displayName}
          </p>
          <p className="text-xs tabular-nums text-ink/50">
            {message.phoneNumber} · {formatPln(message.amountDueGrosze)}
          </p>
        </div>
        {settledLabel ? (
          <span className="rounded-full bg-olive-100 px-2 py-0.5 text-[10px] font-medium text-olive-800">
            {settledLabel}
          </span>
        ) : isSent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            <Send className="size-3" aria-hidden />
            Wysłane
          </span>
        ) : null}
      </div>

      <p className="mt-2.5 whitespace-pre-wrap break-words rounded-xl bg-oatmeal/80 px-3 py-2.5 text-sm leading-relaxed text-ink/80">
        {message.body}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <CopyButton text={message.body} label="Kopiuj" className="flex-1" />
        <CopyButton text={message.payUrl} label="Kopiuj link" />
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-2 text-xs"
          disabled={isPending}
          onClick={() => {
            const nextSent = !isSent;
            setIsSent(nextSent);
            runAction(() =>
              toggleMessageSent({
                periodId: message.periodId,
                sent: nextSent,
              }),
            );
          }}
        >
          {isSent ? "Cofnij wysłane" : "Oznacz wysłane"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-2 text-xs"
          disabled={isPending || settledLabel !== null}
          onClick={() => {
            setSettledLabel("Gotówka");
            runAction(() =>
              markPeriodPaid({
                periodId: message.periodId,
                method: "CASH",
              }),
            );
          }}
        >
          Gotówka
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-2 text-xs"
          disabled={isPending || settledLabel !== null}
          onClick={() => {
            setSettledLabel("Przelew");
            runAction(() =>
              markPeriodPaid({
                periodId: message.periodId,
                method: "TRANSFER",
              }),
            );
          }}
        >
          Przelew
        </Button>
      </div>

      {error ? (
        <p className="mt-2 text-[11px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function GeneratedMessages({
  messages,
  skipped,
}: GeneratedMessagesProps) {
  if (messages.length === 0 && skipped.length === 0) {
    return null;
  }

  const allBodies = messages
    .map(
      (message) =>
        `${message.displayName} (${message.phoneNumber})\n${message.body}`,
    )
    .join("\n\n");

  return (
    <section className="rounded-3xl bg-oatmeal/60 p-4 ring-1 ring-ink/5 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-xl text-ink">Gotowe wiadomości</h2>
          <p className="mt-0.5 text-xs text-ink/50">
            Skopiuj treść i wyślij SMS-em ze swojego telefonu.
          </p>
        </div>
        {messages.length > 0 ? (
          <CopyButton text={allBodies} label="Kopiuj wszystkie" />
        ) : null}
      </div>

      {skipped.length > 0 ? (
        <ul className="mt-3 space-y-1 rounded-2xl bg-white/60 px-3 py-2.5 text-[11px] text-ink/55">
          {skipped.map((entry) => (
            <li key={`${entry.displayName}-${entry.reason}`}>
              Pominięto {entry.displayName} — {entry.reason}
            </li>
          ))}
        </ul>
      ) : null}

      {messages.length > 0 ? (
        <ul className="mt-3 grid gap-2.5 lg:grid-cols-2">
          {messages.map((message) => (
            <MessageCard key={message.leadId} message={message} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
