"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createManualLead,
  type CreateManualLeadState,
} from "@/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PACKAGE_OPTIONS } from "@/lib/content";

const initialState: CreateManualLeadState = { status: "idle" };

type AddLeadModalProps = {
  secret: string;
};

function SubmitLabel() {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Dodawanie...
      </>
    );
  }

  return <>Dodaj ucznia</>;
}

export function AddLeadModal({ secret }: AddLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction] = useActionState(createManualLead, initialState);

  function handleOpen() {
    setFormKey((current) => current + 1);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="primary" onClick={handleOpen}>
        Dodaj ucznia
      </Button>

      {state.status === "success" && state.message && !open ? (
        <p className="mt-2 text-sm text-olive-700">{state.message}</p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-xl ring-1 ring-ink/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-lead-title"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="add-lead-title"
                  className="font-serif text-2xl text-ink"
                >
                  Dodaj ucznia
                </h2>
                <p className="mt-1 text-sm text-ink/60">
                  Ręczne dodanie zgłoszenia - gotówka lub link online.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 text-xs"
                onClick={handleClose}
              >
                Zamknij
              </Button>
            </div>

            <form key={formKey} action={formAction} className="space-y-4">
              <input type="hidden" name="secret" value={secret} />

              <div className="space-y-2">
                <Label htmlFor="manual-parentName">Imię i nazwisko *</Label>
                <Input
                  id="manual-parentName"
                  name="parentName"
                  required
                  placeholder="Jan Kowalski"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-email">E-mail *</Label>
                  <Input
                    id="manual-email"
                    name="email"
                    type="email"
                    required
                    placeholder="jan@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-phone">Telefon *</Label>
                  <Input
                    id="manual-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+48 000 000 000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-studentName">Imię ucznia</Label>
                <Input
                  id="manual-studentName"
                  name="studentName"
                  placeholder="Kasia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-package">Poziom zajęć *</Label>
                <Select id="manual-package" name="package" required defaultValue="">
                  {PACKAGE_OPTIONS.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-notes">Uwagi</Label>
                <Textarea
                  id="manual-notes"
                  name="notes"
                  rows={2}
                  placeholder="Opcjonalne uwagi..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-paymentMode">Sposób płatności *</Label>
                <Select
                  id="manual-paymentMode"
                  name="paymentMode"
                  required
                  defaultValue="cash"
                >
                  <option value="cash">Opłacone gotówką</option>
                  <option value="online">Wyślij link online (24h)</option>
                </Select>
              </div>

              {state.status === "error" && state.message ? (
                <p className="text-sm text-red-600" role="alert">
                  {state.message}
                </p>
              ) : null}

              {state.status === "success" && state.message ? (
                <div className="space-y-3">
                  <p className="text-sm text-olive-700">{state.message}</p>
                  {state.payUrl ? (
                    <p className="break-all text-xs text-ink/70">{state.payUrl}</p>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={handleClose}
                  >
                    Zamknij
                  </Button>
                </div>
              ) : (
                <Button type="submit" variant="primary" className="w-full">
                  <SubmitLabel />
                </Button>
              )}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
