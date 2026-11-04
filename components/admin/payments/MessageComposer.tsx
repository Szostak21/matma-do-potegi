"use client";

import { ChevronDown, Plus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { deleteMessageTemplate, saveMessageTemplate } from "@/actions/tuition";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { AdminMessageTemplate } from "@/lib/admin-tabs";
import { cn } from "@/lib/cn";
import {
  countSmsSegments,
  findUnknownVariables,
  MESSAGE_VARIABLE_HINTS,
  MESSAGE_VARIABLE_NAMES,
} from "@/lib/messages/render";

type MessageComposerProps = {
  templates: AdminMessageTemplate[];
  body: string;
  onChangeBody: (body: string) => void;
};

function TemplateList({
  templates,
  activeId,
  onSelect,
}: {
  templates: AdminMessageTemplate[];
  activeId: string | null;
  onSelect: (template: AdminMessageTemplate) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ul className="space-y-1.5">
      {templates.map((template) => (
        <li key={template.id} className="flex items-stretch gap-1.5">
          <button
            type="button"
            onClick={() => onSelect(template)}
            className={cn(
              "min-w-0 flex-1 rounded-xl px-3 py-2 text-left text-xs transition",
              template.id === activeId
                ? "bg-ink text-cream"
                : "bg-white/70 text-ink/70 ring-1 ring-ink/5 hover:bg-white",
            )}
          >
            <span className="block truncate font-medium">{template.name}</span>
            <span
              className={cn(
                "mt-0.5 block truncate text-[11px]",
                template.id === activeId ? "text-cream/60" : "text-ink/40",
              )}
            >
              {template.body}
            </span>
          </button>
          {template.isDefault ? null : (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteMessageTemplate({ id: template.id });
                })
              }
              aria-label={`Usuń szablon ${template.name}`}
              className="shrink-0 rounded-xl px-2 text-ink/35 ring-1 ring-ink/5 transition hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function SaveTemplateForm({
  body,
  onSaved,
}: {
  body: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-2 space-y-2 rounded-xl bg-white/70 p-2.5 ring-1 ring-ink/5">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nazwa nowego szablonu"
        className="px-3 py-2 text-xs"
      />
      <Button
        type="button"
        variant="secondary"
        className="w-full px-3 py-2 text-xs"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await saveMessageTemplate({ name, body });
            setMessage(result.message ?? null);

            if (result.status === "success") {
              setName("");
              onSaved();
            }
          })
        }
      >
        <Save className="size-3.5" aria-hidden />
        Zapisz jako nowy
      </Button>
      {message ? <p className="text-[11px] text-ink/55">{message}</p> : null}
    </div>
  );
}

export function MessageComposer({
  templates,
  body,
  onChangeBody,
}: MessageComposerProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSaveFormOpen, setIsSaveFormOpen] = useState(false);

  const sms = countSmsSegments(body);
  const unknownVariables = findUnknownVariables(body);

  function handleSelect(template: AdminMessageTemplate) {
    setActiveTemplateId(template.id);
    onChangeBody(template.body);
    setIsTemplatesOpen(false);
  }

  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-soft ring-1 ring-ink/5 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="order-2 min-w-0 lg:order-1">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/45">
              Treść wiadomości
            </span>
            <Textarea
              value={body}
              rows={5}
              onChange={(event) => {
                onChangeBody(event.target.value);
                setActiveTemplateId(null);
              }}
              placeholder="Dzień dobry! Czesne za {miesiac} dla {imie} wynosi {kwota}. Płatność: {link}"
            />
          </label>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/45">
            <span className="tabular-nums">
              {sms.characters} znaków · {sms.segments} SMS
            </span>
            {sms.isUnicode ? (
              <span className="text-amber-700">
                polskie znaki — limit 70 znaków na SMS
              </span>
            ) : null}
          </div>

          {unknownVariables.length > 0 ? (
            <p className="mt-2 text-[11px] text-red-600" role="alert">
              Nieznane zmienne:{" "}
              {unknownVariables.map((name) => `{${name}}`).join(", ")}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {MESSAGE_VARIABLE_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                title={MESSAGE_VARIABLE_HINTS[name]}
                onClick={() => onChangeBody(`${body}{${name}}`)}
                className="rounded-full bg-oatmeal px-2.5 py-1 font-mono text-[11px] text-ink/60 transition hover:bg-olive-100 hover:text-olive-800"
              >
                {`{${name}}`}
              </button>
            ))}
          </div>
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <button
            type="button"
            onClick={() => setIsTemplatesOpen((open) => !open)}
            aria-expanded={isTemplatesOpen}
            className="flex w-full items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-ink/45 lg:pointer-events-none"
          >
            Szablony
            <ChevronDown
              className={cn(
                "size-4 transition lg:hidden",
                isTemplatesOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <div
            className={cn(
              "mt-2",
              isTemplatesOpen ? "block" : "hidden lg:block",
            )}
          >
            <TemplateList
              templates={templates}
              activeId={activeTemplateId}
              onSelect={handleSelect}
            />

            {isSaveFormOpen ? (
              <SaveTemplateForm
                body={body}
                onSaved={() => setIsSaveFormOpen(false)}
              />
            ) : (
              <button
                type="button"
                disabled={body.trim().length === 0}
                onClick={() => setIsSaveFormOpen(true)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[11px] text-ink/50 ring-1 ring-ink/5 transition hover:text-ink disabled:opacity-40"
              >
                <Plus className="size-3.5" aria-hidden />
                Zapisz obecną treść jako szablon
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
