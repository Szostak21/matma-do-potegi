"use client";

import type { PackageType } from "@prisma/client";
import { useActionState } from "react";

import { submitLead } from "@/actions/leads";
import { GroupSelection } from "@/components/sections/GroupSelection";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TermsAcceptance } from "@/components/ui/TermsAcceptance";
import { CONTACT, GROUP_SELECTION, PACKAGE_OPTIONS } from "@/lib/content";
import type { LeadFormState } from "@/lib/validations/lead";

const initialState: LeadFormState = { status: "idle" };

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{message}</p>;
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitLead, initialState);
  const packageFieldKey = state.values?.package ?? "package-default";

  const showSelection =
    state.status === "success" && state.leadId && state.requestedPackage;

  return (
    <Section id="zapis" variant="deep">
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Zapis"
            title={showSelection ? GROUP_SELECTION.title : CONTACT.title}
            description={
              showSelection ? GROUP_SELECTION.description : CONTACT.description
            }
            align="center"
            className="mx-auto"
          />

          <Card className="mt-10">
            {showSelection ? (
              <GroupSelection
                leadId={state.leadId!}
                packageType={state.requestedPackage as PackageType}
              />
            ) : (
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
                    <Label htmlFor="studentName">Imię ucznia (opcjonalnie)</Label>
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

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="package">Wybierz grupę *</Label>
                    <Select
                      key={packageFieldKey}
                      id="package"
                      name="package"
                      defaultValue={state.values?.package ?? ""}
                      aria-invalid={Boolean(state.errors?.package)}
                    >
                      {PACKAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <FieldError message={state.errors?.package?.[0]} />
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

                <SubmitButton />
              </form>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}
