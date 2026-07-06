import type { Metadata } from "next";

import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { LEGAL } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Polityka prywatności | Matma do potęgi",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-cream py-16">
        <Container className="max-w-2xl">
          <LegalDocument doc={LEGAL.privacy} />
          <Button href="/" variant="secondary" className="mt-8">
            Wróć na stronę główną
          </Button>
        </Container>
      </main>
      <Footer />
    </>
  );
}
