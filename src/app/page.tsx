import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Trust from "@/components/Trust";
import HowItWorksPreview from "@/components/HowItWorksPreview";
import Domains from "@/components/Domains";
import Pricing from "@/components/Pricing";
import CertificateShowcase from "@/components/CertificateShowcase";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function Home() {
  return (
    <div className="min-h-screen font-sans pb-24 md:pb-0">
      <Navbar />
      <main>
        {/* 🟢 MOBILE-FIRST HIGH-CONVERTING FUNNEL */}
        
        {/* 1. Hero — Outcome-focused, price visible */}
        <Hero />
        
        {/* 2. Trust Signals — Build confidence early */}
        <Trust />
        
        {/* 2.5 Quick How it Works Preview */}
        <HowItWorksPreview />

        {/* 3. Programs (MONEY SECTION) — 2-col grid, optimized, urgency tags */}

        <Domains />
        
        {/* 4. Pricing Highlight — Show value of ₹349 clearly */}
        <Pricing />

        {/* 5. Certificate Preview — Resume value proof */}
        <CertificateShowcase />
        
        {/* 6. Testimonials — Real student social proof */}
        <Testimonials />
        
        {/* 7. Final CTA — Emotional close */}
        <CTA />
      </main>
      
      {/* 🔥 STICKY MOBILE CTA — Always visible, high conversion */}
      <StickyMobileCTA />
      
      <Footer />
    </div>
  );
}
