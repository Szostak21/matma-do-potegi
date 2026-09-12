import { About } from "@/components/sections/About";
import { ContactForm } from "@/components/sections/ContactForm";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { HashScrollOnLoad } from "@/components/HashScrollOnLoad";
import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Teachers } from "@/components/sections/Teachers";
import { websiteJsonLd } from "@/lib/seo";

export default function Home() {
  const jsonLd = websiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HashScrollOnLoad />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Teachers />
        <Pricing />
        <Reviews />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
