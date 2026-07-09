"use client";

import type { PackageType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

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
import type { LeadFormState } from "@/lib/validations/lead";

const initialState: LeadFormState = { status: "idle" };

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

  if (!entry) {
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
  const packageFieldKey = state.values?.package ?? "package-default";

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
      router.push(`/rezerwacja/${state.leadId}/podsumowanie`);
    }
  }, [state.status, state.leadId, router]);

  const selectedAvailability = availability.find(
    (item) => item.packageType === selectedPackage,
  );
  const isPackageFull = selectedAvailability
    ? selectedAvailability.available <= 0
    : false;

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
            <form action={formAction} className="space-y-6">
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
                    aria-invalid={Boolean(state.errors?.parentName)}
                  />
                  <FieldError message={state.errors?.parentName?.[0]} />
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
                    aria-invalid={Boolean(state.errors?.phone)}
                  />
                  <FieldError message={state.errors?.phone?.[0]} />
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
                    aria-invalid={Boolean(state.errors?.email)}
                  />
                  <FieldError message={state.errors?.email?.[0]} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="package">Wybierz poziom zajęć *</Label>
                  <Select
                    key={packageFieldKey}
                    id="package"
                    name="package"
                    defaultValue={state.values?.package ?? ""}
                    aria-invalid={Boolean(state.errors?.package)}
                    onChange={(event) => setSelectedPackage(event.target.value)}
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
                              ? `${packageName} — brak miejsc`
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
                  <FieldError message={state.errors?.package?.[0]} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="studentName">Imię ucznia</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    type="text"
                    placeholder="Kasia"
                    defaultValue={state.values?.studentName}
                    aria-invalid={Boolean(state.errors?.studentName)}
                  />
                  <FieldError message={state.errors?.studentName?.[0]} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentGrade">Ocena z matematyki</Label>
                  <Input
                    id="currentGrade"
                    name="currentGrade"
                    type="text"
                    placeholder="np. 4"
                    defaultValue={state.values?.currentGrade}
                    aria-invalid={Boolean(state.errors?.currentGrade)}
                  />
                  <FieldError message={state.errors?.currentGrade?.[0]} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedResult">Oczekiwany wynik</Label>
                  <Input
                    id="expectedResult"
                    name="expectedResult"
                    type="text"
                    placeholder="np. 70% na maturze"
                    defaultValue={state.values?.expectedResult}
                    aria-invalid={Boolean(state.errors?.expectedResult)}
                  />
                  <FieldError message={state.errors?.expectedResult?.[0]} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes">Uwagi</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Np. preferowany termin, pytania o zajęcia..."
                    defaultValue={state.values?.notes}
                    aria-invalid={Boolean(state.errors?.notes)}
                  />
                  <FieldError message={state.errors?.notes?.[0]} />
                </div>
              </div>

              <TermsAcceptance
                defaultChecked={state.values?.acceptTerms === "on"}
                error={state.errors?.acceptTerms?.[0]}
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
