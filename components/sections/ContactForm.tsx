"use client";

import type { PackageType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { submitLead } from "@/actions/leads";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TermsAcceptance } from "@/components/ui/TermsAcceptance";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONTACT,
  PACKAGE_AVAILABILITY,
  PACKAGE_OPTIONS,
} from "@/lib/content";
import { PACKAGES } from "@/lib/constants";
import type { PackageAvailability } from "@/lib/packages";
import { trackFormStart, trackLeadSubmit } from "@/lib/analytics-events";
import { scrollUpToFirstInvalidFieldLabel } from "@/lib/scroll";
import type { LeadFormState } from "@/lib/validations/lead";

const initialState: LeadFormState = { status: "idle" };

/** Kolejność pól obowiązkowych w formularzu (do scrolla przy błędach walidacji). */
const REQUIRED_FIELD_IDS = [
  "parentName",
  "phone",
  "email",
  "package",
  "schoolClass",
  "acceptTerms",
] as const;

function mapFieldErrors(
  errors: Record<string, string[] | undefined>,
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages?.[0];
    if (message) {
      mapped[key] = message;
    }
  }

  return mapped;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

function PackageAvailabilityHint({
  packageType,
  availability,
}: {
  packageType: string;
  availability: PackageAvailability[];
}) {
  if (!packageType) {
    return null;
  }

  const entry = availability.find((item) => item.packageType === packageType);

  if (!entry || entry.displayedAvailable === null) {
    return null;
  }

  if (entry.available <= 0) {
    return (
      <p className="text-sm text-amber-700">{PACKAGE_AVAILABILITY.noSpots}</p>
    );
  }

  return (
    <p className="text-sm text-olive-700">
      {PACKAGE_AVAILABILITY.spotsRemaining(entry.displayedAvailable)}
    </p>
  );
}

export function ContactForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(submitLead, initialState);
  const [selectedPackage, setSelectedPackage] = useState(
    state.values?.package ?? "",
  );
  const [availability, setAvailability] = useState<PackageAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  /**
   * Pola, których komunikat użytkownik już zamknął focusem w tej rundzie walidacji.
   * Resetowane synchronicznie przy nowym `state.errors` (wzorzec React: adjust state
   * when props change) — bez setState w useEffect.
   */
  const [clearedFields, setClearedFields] = useState<Set<string>>(
    () => new Set(),
  );
  const [trackedErrors, setTrackedErrors] = useState(state.errors);
  const packageFieldKey = state.values?.package ?? "package-default";
  const formStartTracked = useRef(false);

  // Nowa odpowiedź walidacji → pełna lista komunikatów od nowa.
  if (state.errors !== trackedErrors) {
    setTrackedErrors(state.errors);
    setClearedFields(new Set());
  }

  const serverErrors =
    state.status === "error" && state.errors
      ? mapFieldErrors(state.errors)
      : {};

  function activeError(fieldId: string): string | undefined {
    if (clearedFields.has(fieldId)) {
      return undefined;
    }

    return serverErrors[fieldId];
  }

  function clearFieldError(fieldId: string) {
    setClearedFields((prev) => {
      if (prev.has(fieldId) || !serverErrors[fieldId]) {
        return prev;
      }

      const next = new Set(prev);
      next.add(fieldId);
      return next;
    });
  }

  function handleFormInteraction() {
    if (formStartTracked.current) {
      return;
    }

    formStartTracked.current = true;
    trackFormStart();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoadingAvailability(true);

      try {
        const response = await fetch("/api/packages");
        const data = (await response.json()) as {
          packages: PackageAvailability[];
        };

        if (!cancelled) {
          setAvailability(data.packages);
        }
      } catch {
        if (!cancelled) {
          setAvailability([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.status === "success" && state.leadId) {
      trackLeadSubmit({
        packageType: state.values?.package ?? selectedPackage,
        eventId: state.eventId,
      });
      router.push(`/rezerwacja/${state.leadId}/podsumowanie`);
    }
  }, [
    state.status,
    state.leadId,
    state.eventId,
    state.values?.package,
    selectedPackage,
    router,
  ]);

  useEffect(() => {
    if (state.status !== "error" || !state.errors) {
      return;
    }

    const next = mapFieldErrors(state.errors);
    const invalidIds = REQUIRED_FIELD_IDS.filter((id) => next[id]);

    if (invalidIds.length === 0) {
      return;
    }

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;

    // Double rAF — poczekaj aż komunikaty wejdą w layout przed pomiarem pozycji.
    outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        if (!cancelled) {
          scrollUpToFirstInvalidFieldLabel(invalidIds);
        }
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, [state.status, state.errors]);

  const selectedAvailability = availability.find(
    (item) => item.packageType === selectedPackage,
  );
  const isPackageFull = selectedAvailability
    ? selectedAvailability.available <= 0
    : false;

  const parentNameError = activeError("parentName");
  const phoneError = activeError("phone");
  const emailError = activeError("email");
  const packageError = activeError("package");
  const schoolClassError = activeError("schoolClass");
  const expectedResultError = activeError("expectedResult");
  const studentNameError = activeError("studentName");
  const notesError = activeError("notes");
  const acceptTermsError = activeError("acceptTerms");

  return (
    <Section id="zapisy" variant="deep">
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Zapisy"
            title={CONTACT.title}
            description={CONTACT.description}
            align="center"
            className="mx-auto"
          />

          <Card className="mt-10">
            <form
              action={formAction}
              className="space-y-6"
              onFocus={handleFormInteraction}
              onChange={handleFormInteraction}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="parentName">
                    Imię i nazwisko osoby zgłaszającej *
                  </Label>
                  <Input
                    id="parentName"
                    name="parentName"
                    type="text"
                    autoComplete="name"
                    placeholder="Jan Kowalski"
                    defaultValue={state.values?.parentName}
                    aria-invalid={Boolean(parentNameError)}
                    onFocus={() => clearFieldError("parentName")}
                  />
                  <FieldError message={parentNameError} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numer telefonu *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+48 000 000 000"
                    defaultValue={state.values?.phone}
                    aria-invalid={Boolean(phoneError)}
                    onFocus={() => clearFieldError("phone")}
                  />
                  <FieldError message={phoneError} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adres e-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jan@example.com"
                    defaultValue={state.values?.email}
                    aria-invalid={Boolean(emailError)}
                    onFocus={() => clearFieldError("email")}
                  />
                  <FieldError message={emailError} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="package">Wybierz poziom zajęć *</Label>
                  <Select
                    key={packageFieldKey}
                    id="package"
                    name="package"
                    defaultValue={state.values?.package ?? ""}
                    aria-invalid={Boolean(packageError)}
                    onFocus={() => clearFieldError("package")}
                    onChange={(event) => {
                      clearFieldError("package");
                      setSelectedPackage(event.target.value);
                    }}
                  >
                    {PACKAGE_OPTIONS.map((option) => {
                      const entry = availability.find(
                        (item) => item.packageType === option.value,
                      );
                      const isFull = entry ? entry.available <= 0 : false;
                      const packageName =
                        option.value &&
                        PACKAGES[option.value as PackageType]?.name;

                      return (
                        <option
                          key={option.value || "empty"}
                          value={option.value}
                          disabled={Boolean(option.value && isFull)}
                        >
                          {option.value && packageName
                            ? isFull
                              ? `${packageName} - brak miejsc`
                              : packageName
                            : option.label}
                        </option>
                      );
                    })}
                  </Select>
                  {loadingAvailability ? (
                    <p className="text-sm text-ink/50">
                      {PACKAGE_AVAILABILITY.loading}
                    </p>
                  ) : (
                    <PackageAvailabilityHint
                      packageType={selectedPackage}
                      availability={availability}
                    />
                  )}
                  <FieldError message={packageError} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolClass">Klasa (od września) *</Label>
                  <Input
                    id="schoolClass"
                    name="schoolClass"
                    type="text"
                    placeholder="np. 4"
                    defaultValue={state.values?.schoolClass}
                    aria-invalid={Boolean(schoolClassError)}
                    onFocus={() => clearFieldError("schoolClass")}
                  />
                  <FieldError message={schoolClassError} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedResult">Oczekiwany wynik</Label>
                  <Input
                    id="expectedResult"
                    name="expectedResult"
                    type="text"
                    placeholder="np. 70% na maturze"
                    defaultValue={state.values?.expectedResult}
                    aria-invalid={Boolean(expectedResultError)}
                    onFocus={() => clearFieldError("expectedResult")}
                  />
                  <FieldError message={expectedResultError} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="studentName">Imię ucznia</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    type="text"
                    placeholder="Kasia"
                    defaultValue={state.values?.studentName}
                    aria-invalid={Boolean(studentNameError)}
                    onFocus={() => clearFieldError("studentName")}
                  />
                  <FieldError message={studentNameError} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Uwagi</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Np. preferowany termin, pytania o zajęcia..."
                    defaultValue={state.values?.notes}
                    aria-invalid={Boolean(notesError)}
                    onFocus={() => clearFieldError("notes")}
                  />
                  <FieldError message={notesError} />
                </div>
              </div>

              <TermsAcceptance
                defaultChecked={state.values?.acceptTerms === "on"}
                error={acceptTermsError}
                onInteract={() => clearFieldError("acceptTerms")}
              />

              {state.message ? (
                <p
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {state.message}
                </p>
              ) : null}

              <SubmitButton disabled={isPackageFull} />
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
