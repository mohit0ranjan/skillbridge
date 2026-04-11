"use client";

import { motion } from "framer-motion";
import { GraduationCap, Trophy, Users, BookOpen, Briefcase } from "lucide-react";
import Image from "next/image";

export default function Trust() {
  const animations = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  };

  return (
    <section className="pt-16 pb-20 px-4 sm:px-6 relative z-10 w-full overflow-hidden">
      <motion.div 
        {...animations}
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-[1200px] mx-auto w-full"
      >
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <p className="text-[12px] font-bold tracking-[0.16em] uppercase text-brand mb-5 bg-brand-surface px-4 py-1.5 rounded-full border border-brand-border flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            Trusted & Recognized By
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            A skill virtual internship platform
          </h2>
          <p className="text-[16px] md:text-[18px] text-muted font-medium max-w-[600px]">
            Designed by IIT and NIT alumni to bridge the gap between classroom learning and real-world execution.
          </p>
        </div>

        {/* Main Trust Logos/Badges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-14">
          <div className="group relative lg:col-span-5 card p-8 md:p-10 overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand via-brand-light to-transparent" />

            <div className="relative z-10 flex items-start gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl bg-brand-surface text-brand flex items-center justify-center ring-1 ring-brand-border group-hover:scale-[1.02] transition-transform duration-500">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand mb-3">Founders</p>
                <h3 className="text-[28px] md:text-[32px] font-bold text-foreground leading-[1.05] mb-3">
                  Designed by IIT and NIT alumni.
                </h3>
                <p className="text-[15px] md:text-[16px] text-muted leading-relaxed max-w-[28rem]">
                  Built by people who understand campus pressure, internships, and the gap between learning and execution.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative lg:col-span-4 card p-8 md:p-10 overflow-hidden">
            <div className="relative z-10 mb-7">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand mb-4">Recognized</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm px-4 py-3">
                  <Image src="/msme logo.png" alt="MSME Logo" width={84} height={46} className="h-11 w-auto object-contain" unoptimized />
                </div>
                <div className="h-10 w-px bg-neutral-200" />
                <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm px-4 py-3">
                  <Image src="/skill india logo.png" alt="Skill India Logo" width={96} height={46} className="h-11 w-auto object-contain" unoptimized />
                </div>
              </div>
            </div>

            <h3 className="relative z-10 text-[24px] font-bold text-foreground mb-2">MSME & Skill India</h3>
            <p className="relative z-10 text-[15px] text-muted leading-relaxed">
              Familiar logos, but presented with restraint so the section feels premium instead of promotional.
            </p>
          </div>

          <div className="group relative lg:col-span-3 card p-8 md:p-10 overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-brand mb-3">Campus Circle</p>
                <h3 className="text-[24px] font-bold text-foreground leading-tight">Kshitij</h3>
                <p className="text-[15px] text-muted mt-1">IIT Kharagpur</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-brand-surface ring-1 ring-brand-border flex items-center justify-center text-brand">
                <Briefcase className="w-7 h-7" />
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-neutral-200 bg-white shadow-sm px-4 py-4 flex items-center justify-center">
              <Image src="/kshitij.png" alt="Kshitij IIT Kharagpur" width={110} height={48} className="h-11 w-auto object-contain" unoptimized />
            </div>
          </div>

        </div>

        {/* Extra Trust Elements Footer */}
        <div className="flex flex-wrap flex-col md:flex-row items-center justify-center gap-x-10 gap-y-5 pt-8 border-t border-neutral-200">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
              <Users className="w-4 h-4 text-brand" />
            </div>
            <span className="text-[14.5px] font-bold text-foreground">1000+ Students Enrolled</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-neutral-300 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-brand" />
            </div>
            <span className="text-[14.5px] font-bold text-foreground">Industry Recognized Certifications</span>
          </div>

          <div className="w-1 h-1 rounded-full bg-neutral-300 hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-brand" />
            </div>
            <span className="text-[14.5px] font-bold text-foreground">Real-world Project Experience</span>
          </div>

        </div>

      </motion.div>
    </section>
  );
}