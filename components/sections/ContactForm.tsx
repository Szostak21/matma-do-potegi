import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Select } from "@/components/ui/Select";
import { CONTACT, PACKAGE_OPTIONS } from "@/lib/content";

export function ContactForm() {
  return (
    <Section id="zapis" variant="deep">
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Zapis"
            title={CONTACT.title}
            description={CONTACT.description}
            align="center"
            className="mx-auto"
          />

          <Card className="mt-10">
            <form className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="parentName">
                    Imię i nazwisko osoby zgłaszającej *
                  </Label>
                  <Input
                    id="parentName"
                    name="parentName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jan Kowalski"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numer telefonu *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="+48 600 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adres e-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jan@example.com"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="studentName">Imię ucznia (opcjonalnie)</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    type="text"
                    placeholder="Kasia"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="package">Wybór pakietu *</Label>
                  <Select id="package" name="package" required defaultValue="">
                    {PACKAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentGrade">
                    Obecna ocena / poziom *
                  </Label>
                  <Input
                    id="currentGrade"
                    name="currentGrade"
                    type="text"
                    required
                    placeholder="np. 4, średniozaawansowany"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedResult">Oczekiwany wynik *</Label>
                  <Input
                    id="expectedResult"
                    name="expectedResult"
                    type="text"
                    required
                    placeholder="np. 70% na maturze"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Wyślij zgłoszenie
              </Button>

              <p className="text-center text-xs text-ink/50">
                Formularz jest statyczny — podłączenie do systemu zapisów nastąpi
                w kolejnym etapie.
              </p>
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
