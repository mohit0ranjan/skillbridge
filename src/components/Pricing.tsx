"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck, Lock } from "lucide-react";

const INCLUDED_FEATURES = [
  "Mentorship from IIT/NIT alumni",
  "Work with IIT/NIT students",
  "Verified certificate",
  "Top 2% get internship support",
];

export default function Pricing() {
  return (
    <section className="py-20 md:py-24 px-4 sm:px-6 relative" id="pricing">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-4 h-64 w-64 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-light/5 blur-3xl" />
      </div>

      <div className="max-w-[1024px] mx-auto relative z-10">
        <div className="text-center md:text-left mb-10">
          <div className="section-label">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[16px] text-muted max-w-xl">
            Everything you need to build real projects and gain experience, for one simple price.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-[28px] border border-neutral-200 lg:flex overflow-hidden bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
        >
          {/* Left Column - Pricing & CTA */}
          <div className="p-8 sm:p-10 lg:w-1/2 lg:border-r border-neutral-200 bg-white">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Student Access
            </h3>
            <p className="text-[15px] text-muted mb-8">
              One-time payment for the full experience. Start building today.
            </p>
            
            <div className="mb-8 flex items-baseline text-foreground">
              <span className="text-6xl font-black tracking-[-0.04em]">₹349</span>
              <span className="ml-2 text-lg font-medium text-muted">
                all-inclusive
              </span>
            </div>

            <Link
              href="/apply"
              className="btn-primary w-full group py-4 text-[16px]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-muted">
              <Lock className="h-3.5 w-3.5 text-brand" />
              Secure payment processing. Instant access.
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="p-8 sm:p-10 lg:w-1/2 bg-neutral-50/80">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-dark mb-6">
              What&apos;s included
            </h4>
            
            <ul className="space-y-4">
              {INCLUDED_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-brand-dark" strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-medium text-foreground leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-brand-border bg-brand-surface/60 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-brand-dark">Built by students, for students</p>
                  <p className="text-[12px] text-muted mt-1 leading-snug">Focused on real skills, not just certificates. 100% refund if your certificate is not delivered.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
