import { About } from "@/components/sections/About";
import { ContactForm } from "@/components/sections/ContactForm";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { HashScrollOnLoad } from "@/components/HashScrollOnLoad";
import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Teacher } from "@/components/sections/Teacher";
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
        <Teacher />
        <Pricing />
        <Reviews />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
