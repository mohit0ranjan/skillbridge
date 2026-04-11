"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Briefcase, Award, Star, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-0 md:pt-40 md:pb-0 overflow-hidden min-h-[94vh] flex items-center">
      {/* Decorative gradient orb — top right */}
      <div className="absolute top-[-15%] right-[-8%] w-[60%] h-[120%] bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1200px] w-full px-6 md:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          
          {/* LEFT — Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[520px] pb-16 md:pb-24 lg:pb-28"
          >
            {/* Tagline pill */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-[12.5px] font-semibold text-brand backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              No interviews · Start instantly · Real experience
            </motion.div>

            {/* Headline */}
            <h1 className="mb-7 text-[2.6rem] sm:text-[3.2rem] md:text-[3.6rem] lg:text-[4rem] font-bold leading-[1.06] tracking-tight text-black">
              Start Your Real
              <br />
              Internship{" "}
              <span className="relative inline-block text-brand">
                This Week.
                <svg className="absolute -bottom-1.5 left-0 w-full h-3 text-brand" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8C40 3 80 2 100 5C120 8 160 10 198 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="mb-10 max-w-[430px] text-[16px] md:text-[17px] leading-[1.75] text-muted">
              Complete guided tasks, build real projects, and earn a verified
              certificate — the perfect starting point for your career.
            </p>

            {/* CTAs */}
            <div className="mb-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link href="/apply" className="btn-primary btn-lg group">
                Start Internship – ₹99
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/#how-it-works" className="btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1506794778202-cad84cf45f1d",
                  "photo-1494790108377-be9c29b29330",
                  "photo-1507003211169-0a1dd7228f2d",
                ].map((id) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?w=80&q=80&fit=crop`}
                    className="w-10 h-10 rounded-full border-[2.5px] border-white object-cover shadow-sm"
                    alt=""
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-[2.5px] border-white bg-brand-surface flex items-center justify-center text-[11px] font-bold text-brand shadow-sm">
                  80+
                </div>
              </div>
              <p className="text-[13px] text-muted font-medium leading-tight">
                Trusted by <span className="font-bold text-foreground">5,000+</span> students
                <br />
                <span className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-[11px] text-muted">4.9/5</span>
                </span>
              </p>
            </div>
          </motion.div>

          {/* RIGHT — Rich Visual Composition */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: "easeOut" }}
            className="relative flex items-end justify-center lg:justify-end self-end"
          >
            {/* Soft circular backdrop behind person */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[88%] aspect-square rounded-full bg-brand-light/10 pointer-events-none" />

            {/* Tiny decorative dots */}
            <div className="absolute top-[10%] left-[15%] w-2.5 h-2.5 rounded-full bg-brand/40" />
            <div className="absolute top-[28%] right-[5%] w-2 h-2 rounded-full bg-brand/30" />
            <div className="absolute bottom-[40%] left-[5%] w-2 h-2 rounded-full bg-brand/40" />

            {/* ── Floating Card: Profile badge ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute top-[22%] -left-4 md:-left-10 lg:-left-14 z-30"
            >
              <div className="card px-4 py-3 flex items-center gap-3 w-max">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-brand-surface shrink-0">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-foreground leading-tight">Meera Patel</p>
                  <p className="text-[11.5px] text-brand font-semibold">UI/UX Intern</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Floating Card: Small Icon badge — top right ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute top-[8%] right-[8%] z-30"
            >
              <div className="card w-14 h-14 flex items-center justify-center">
                <Award className="w-7 h-7 text-brand" />
              </div>
            </motion.div>

            {/* ── Floating Card: Trending badge — bottom left ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute bottom-[18%] -left-2 md:-left-6 lg:-left-10 z-30"
            >
              <div className="card px-4 py-3 flex items-center gap-3 w-max">
                <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground leading-tight">500+ Projects</p>
                  <p className="text-[11px] text-muted font-medium">Completed this month</p>
                </div>
              </div>
            </motion.div>

            {/* ── Floating Card: Small Briefcase icon — bottom right ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="absolute bottom-[32%] right-[2%] md:-right-2 z-30"
            >
              <div className="card w-12 h-12 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-brand" />
              </div>
            </motion.div>

            {/* ── The Human Image ── */}
            <div className="relative z-20 w-full max-w-[380px] md:max-w-[430px] lg:max-w-[470px]">
              <img
                src="/hero-student.png"
                alt="Student building real projects on SkillBridge"
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
