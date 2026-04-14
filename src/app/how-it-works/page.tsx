"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import HowItWorks from "@/components/HowItWorks";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans selection:bg-green-100 selection:text-green-900">
      <Navbar />

      <main className="pt-24 md:pt-28">
        <HowItWorks />
      </main>

      <StickyMobileCTA />
      <Footer />
    </div>
  );
}