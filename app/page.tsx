import { About } from "@/components/sections/About";
import { ContactForm } from "@/components/sections/ContactForm";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { Pricing } from "@/components/sections/Pricing";
import { Reviews } from "@/components/sections/Reviews";
import { Teacher } from "@/components/sections/Teacher";

export default function Home() {
  return (
    <>
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
