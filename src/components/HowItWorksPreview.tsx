"use client";

import { motion } from "framer-motion";
import { LogIn, Briefcase, Users, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: LogIn, title: "Join", desc: "Start instantly, no long process." },
  { icon: Briefcase, title: "Get Project", desc: "Work on actual problems." },
  { icon: Users, title: "Collaborate", desc: "Build with peers & mentors." },
  { icon: BadgeCheck, title: "Earn Proof", desc: "Get a verified certificate." },
];

export default function HowItWorksPreview() {
  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 bg-[#fafaf8] relative overflow-hidden" id="how-it-works-preview">
      {/* Subtle Premium Background */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
           initial={{ opacity: 0, y: 15 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-10%" }}
           transition={{ duration: 0.6 }}
           className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-brand-surface border border-brand/20 text-brand-dark text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm">
            Quick Overview
          </div>
          <h2 className="text-[26px] md:text-[32px] font-black text-foreground tracking-tight">How it works</h2>
          <p className="text-[15px] md:text-[16px] font-medium text-muted mt-2">A simple path from joining to real project experience</p>
        </motion.div>

        {/* Steps Strip */}
        <div className="relative">
          {/* Desktop Animated Connecting Line */}
          <div className="hidden md:block absolute top-[32px] left-[12%] right-[12%] h-[2px] bg-neutral-200/50 z-0 overflow-hidden">
             <motion.div 
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                className="w-full h-full bg-gradient-to-r from-brand/20 via-brand/60 to-brand/90"
              />
          </div>
          
          {/* Mobile Animated Connecting Line */}
          <div className="md:hidden absolute left-[31px] top-[40px] bottom-[40px] w-[2px] bg-neutral-200/50 z-0 overflow-hidden">
             <motion.div 
                initial={{ y: "-100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
                className="w-full h-full bg-gradient-to-b from-brand/20 via-brand/60 to-brand/90"
              />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-4 text-left md:text-center group"
              >
                <div className="w-16 h-16 md:w-16 md:h-16 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 ease-out z-10 relative group-hover:border-brand/40 group-hover:shadow-[0_4px_20px_rgba(22,163,74,0.15)]">
                  <step.icon className="w-6 h-6 text-neutral-400 group-hover:text-brand transition-colors duration-500" strokeWidth={1.5} />
                  
                  {/* Subtle pulsing dot indicator */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  </div>
                </div>
                
                <div className="mt-1 md:mt-2">
                  <h3 className="text-[16px] md:text-[17px] font-bold text-foreground leading-tight group-hover:text-brand transition-colors duration-300">{step.title}</h3>
                  <p className="text-[13px] md:text-[14px] text-muted font-medium mt-1 md:mt-1.5 leading-relaxed max-w-[200px]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Inline Trust & CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 md:mt-16 text-center flex flex-col items-center justify-center gap-3 relative z-10"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand opacity-60" />
            <span className="text-[13px] font-bold text-muted tracking-wide uppercase">
              Real projects. No theory-heavy learning.
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand opacity-60" />
          </div>
          
          <Link href="/how-it-works" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-neutral-200 shadow-sm text-[14px] font-bold text-brand hover:text-white hover:bg-brand hover:border-brand transition-all duration-300 group mt-2">
            See full process
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
