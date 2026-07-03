import type { Metadata } from "next";

import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { TERMS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Regulamin | Matma do potęgi",
};

export default function RegulaminPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream py-16">
        <Container className="max-w-2xl">
          <h1 className="font-serif text-4xl text-ink">{TERMS.pageTitle}</h1>
          <Card className="mt-8">
            <p className="text-sm leading-relaxed text-ink/70">
              {TERMS.placeholder}
            </p>
          </Card>
          <Button href="/" variant="secondary" className="mt-8">
            Wróć na stronę główną
          </Button>
        </Container>
      </main>
      <Footer />
    </>
  );
}
