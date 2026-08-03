"use client";

import type { PackageType } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { submitLead } from "@/actions/leads";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import {
  PreventUnloadWhilePending,
  ReleaseSubmitLockOnSettle,
  SubmitButton,
} from "@/components/ui/SubmitButton";
import { TermsAcceptance } from "@/components/ui/TermsAcceptance";
import { Textarea } from "@/components/ui/Textarea";
import {
  CONTACT,
  PACKAGE_AVAILABILITY,
  PACKAGE_OPTIONS,
} from "@/lib/content";
import { PACKAGES } from "@/lib/constants";
import type { PackageAvailability } from "@/lib/packages";
import {
  trackFormStart,
  trackFormValidationError,
  trackLeadSubmit,
} from "@/lib/analytics-events";
import { scrollUpToFirstInvalidFieldLabel } from "@/lib/scroll";
import {
  captureFirstTouchUtmFromSearch,
  readStoredUtm,
  type UtmParams,
} from "@/lib/utm";
import {
  formDataToObject,
  leadFormSchema,
  type LeadFormState,
} from "@/lib/validations/lead";

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

function fieldErrorKeys(
  errors: Record<string, string[] | undefined>,
): string[] {
  return Object.keys(errors).filter((key) => Boolean(errors[key]?.[0]));
}

function scheduleScrollToInvalidFields(invalidIds: string[]) {
  if (invalidIds.length === 0) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      scrollUpToFirstInvalidFieldLabel(invalidIds);
    });
  });
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
   * Resetowane synchronicznie przy nowym `state.errors` / `clientErrors`
   * (wzorzec React: adjust state when props change) — bez setState w useEffect.
   */
  const [clearedFields, setClearedFields] = useState<Set<string>>(
    () => new Set(),
  );
  const [clientErrors, setClientErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  /** Ostatnie wartości z nieudanej walidacji klienta — hardening po ewentualnym form.reset(). */
  const [draftValues, setDraftValues] = useState<Record<
    string,
    string
  > | null>(null);
  /** Remount pól po zapisie draftu, żeby uncontrolled defaultValue weszło w życie. */
  const [draftEpoch, setDraftEpoch] = useState(0);
  const [trackedErrors, setTrackedErrors] = useState(state.errors);
  const [trackedClientErrors, setTrackedClientErrors] = useState(clientErrors);
  const [redirecting, setRedirecting] = useState(false);
  const [utm, setUtm] = useState<UtmParams>({});
  const fieldValues = draftValues ?? state.values;
  const packageFieldKey =
    fieldValues?.package ?? "package-default";
  const formStartTracked = useRef(false);
  /** Blokada od pierwszego kliknięcia — zanim useFormStatus.pending zdąży się ustawić. */
  const submitLockedRef = useRef(false);

  // Nowa odpowiedź walidacji serwera → pełna lista komunikatów od nowa.
  if (state.errors !== trackedErrors) {
    setTrackedErrors(state.errors);
    setClientErrors(null);
    if (state.values) {
      setDraftValues(state.values);
      setDraftEpoch((epoch) => epoch + 1);
    }
    setClearedFields(new Set());
  }

  if (clientErrors !== trackedClientErrors) {
    setTrackedClientErrors(clientErrors);
    setClearedFields(new Set());
  }

  const serverErrors =
    state.status === "error" && state.errors
      ? mapFieldErrors(state.errors)
      : {};
  const localErrors = clientErrors ? mapFieldErrors(clientErrors) : {};

  function activeError(fieldId: string): string | undefined {
    if (clearedFields.has(fieldId)) {
      return undefined;
    }

    return localErrors[fieldId] ?? serverErrors[fieldId];
  }

  function clearFieldError(fieldId: string) {
    setClearedFields((prev) => {
      if (
        prev.has(fieldId) ||
        (!localErrors[fieldId] && !serverErrors[fieldId])
      ) {
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

  /**
   * Fail-fast w onSubmit + preventDefault — React 19 nie woła wtedy action,
   * więc nie robi form.reset() i nie kasuje uncontrolled inputs.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submitLockedRef.current || redirecting) {
      event.preventDefault();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const values = formDataToObject(formData);
    const parsed = leadFormSchema.safeParse(values);

    if (!parsed.success) {
      event.preventDefault();
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      setDraftValues(values);
      setDraftEpoch((epoch) => epoch + 1);
      if (values.package) {
        setSelectedPackage(values.package);
      }
      setClientErrors(fieldErrors);
      trackFormValidationError({ fields: fieldErrorKeys(fieldErrors) });
      scheduleScrollToInvalidFields(
        REQUIRED_FIELD_IDS.filter((id) => fieldErrors[id]?.[0]),
      );
      return;
    }

    setClientErrors(null);
    submitLockedRef.current = true;
  }

  // Przywrócenie strony z bfcache (Wstecz) — odblokuj formularz.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        submitLockedRef.current = false;
        setRedirecting(false);
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // First-touch UTM (kampania) — z URL / sessionStorage do hidden fields.
  useEffect(() => {
    captureFirstTouchUtmFromSearch(window.location.search);
    setUtm(readStoredUtm());
  }, []);

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
      setRedirecting(true);
      trackLeadSubmit({
        packageType:
          state.requestedPackage ??
          state.values?.package ??
          selectedPackage,
        eventId: state.eventId,
      });
      router.push(`/rezerwacja/${state.leadId}/podsumowanie`);
    }
  }, [
    state.status,
    state.leadId,
    state.eventId,
    state.requestedPackage,
    state.values?.package,
    selectedPackage,
    router,
  ]);

  useEffect(() => {
    if (state.status !== "error" || !state.errors) {
      return;
    }

    trackFormValidationError({ fields: fieldErrorKeys(state.errors) });

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
              onSubmit={handleSubmit}
              className="space-y-6"
              onFocus={handleFormInteraction}
              onChange={handleFormInteraction}
            >
              <input type="hidden" name="utmSource" value={utm.utm_source ?? ""} />
              <input type="hidden" name="utmMedium" value={utm.utm_medium ?? ""} />
              <input
                type="hidden"
                name="utmCampaign"
                value={utm.utm_campaign ?? ""}
              />
              <input
                type="hidden"
                name="utmContent"
                value={utm.utm_content ?? ""}
              />
              <div key={draftEpoch} className="space-y-6">
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
                    defaultValue={fieldValues?.parentName}
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
                    defaultValue={fieldValues?.phone}
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
                    defaultValue={fieldValues?.email}
                    aria-invalid={Boolean(emailError)}
                    onFocus={() => clearFieldError("email")}
                  />
                  <FieldError message={emailError} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Wybierz poziom zajęć *</Label>
                  <Select
                    key={packageFieldKey}
                    id="package"
                    name="package"
                    defaultValue={fieldValues?.package ?? ""}
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
                    defaultValue={fieldValues?.schoolClass}
                    aria-invalid={Boolean(schoolClassError)}
                    onFocus={() => clearFieldError("schoolClass")}
                  />
                  <FieldError message={schoolClassError} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Uwagi</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Np. preferowany termin, pytania o zajęcia..."
                    defaultValue={fieldValues?.notes}
                    aria-invalid={Boolean(notesError)}
                    onFocus={() => clearFieldError("notes")}
                  />
                  <FieldError message={notesError} />
                </div>
                </div>

                <TermsAcceptance
                  defaultChecked={fieldValues?.acceptTerms === "on"}
                  error={acceptTermsError}
                  onInteract={() => clearFieldError("acceptTerms")}
                />
              </div>

              {state.message ? (
                <p
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {state.message}
                </p>
              ) : null}

              <PreventUnloadWhilePending />
              <ReleaseSubmitLockOnSettle
                lockedRef={submitLockedRef}
                keepLocked={state.status === "success" || redirecting}
              />
              <SubmitButton
                disabled={isPackageFull}
                redirecting={redirecting}
              />
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
