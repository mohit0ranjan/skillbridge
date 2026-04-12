"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Briefcase, Award, Star, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[94vh] items-center overflow-hidden pb-0 pt-32 md:pt-40 md:pb-0 flex">
      {/* Decorative gradient orb — top right */}
      <div className="pointer-events-none absolute top-[-15%] right-[-8%] h-[120%] w-[60%] rounded-full bg-brand/5 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[520px] pb-16 md:pb-24 lg:pb-28"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-[12.5px] font-semibold text-brand backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              No interviews · Start instantly · Real experience
            </motion.div>

            <h1 className="mb-7 text-[2.6rem] font-bold leading-[1.06] tracking-tight text-black sm:text-[3.2rem] md:text-[3.6rem] lg:text-[4rem]">
              Get Industry
              <br />
              Certificates by{" "}
              <span className="relative inline-block text-brand">
                Doing Real Work.
                <svg className="absolute -bottom-1.5 left-0 h-3 w-full text-brand" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8C40 3 80 2 100 5C120 8 160 10 198 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mb-10 max-w-[430px] text-[16px] leading-[1.75] text-muted md:text-[17px]">
              Complete real tasks, build projects you can show recruiters, and earn a verified certificate in just 2 weeks. Start today for just ₹99.
            </p>

            <div className="mb-12 flex flex-col items-stretch gap-3.5 sm:flex-row sm:items-center">
              <Link href="/apply" className="btn-primary btn-lg group">
                Start Internship – ₹99
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/#how-it-works" className="btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[
                  "photo-1534528741775-53994a69daeb",
                  "photo-1506794778202-cad84cf45f1d",
                  "photo-1494790108377-be9c29b29330",
                  "photo-1507003211169-0a1dd7228f2d",
                ].map((id) => (
                  <div key={id} className="relative h-10 w-10 overflow-hidden rounded-full border-[2.5px] border-white shadow-sm">
                    <Image
                      src={`https://images.unsplash.com/${id}?w=80&q=80&fit=crop`}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-white bg-brand-surface text-[11px] font-bold text-brand shadow-sm">
                  80+
                </div>
              </div>
              <p className="text-[13px] font-medium leading-tight text-muted">
                Trusted by <span className="font-bold text-foreground">5,000+</span> students
                <br />
                <span className="mt-0.5 flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-[11px] text-muted">4.9/5</span>
                </span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6, ease: "easeOut" }}
            className="relative flex items-end justify-center self-end lg:justify-end"
          >
            <div className="pointer-events-none absolute bottom-[5%] left-1/2 aspect-square w-[88%] -translate-x-1/2 rounded-full bg-brand-light/10" />

            <div className="absolute top-[10%] left-[15%] h-2.5 w-2.5 rounded-full bg-brand/40" />
            <div className="absolute top-[28%] right-[5%] h-2 w-2 rounded-full bg-brand/30" />
            <div className="absolute bottom-[40%] left-[5%] h-2 w-2 rounded-full bg-brand/40" />

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute top-[22%] -left-4 z-30 md:-left-10 lg:-left-14"
            >
              <div className="card flex w-max items-center gap-3 px-4 py-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-brand-surface">
                  <Image
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold leading-tight text-foreground">Meera Patel</p>
                  <p className="text-[11.5px] font-semibold text-brand">UI/UX Intern</p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute top-[8%] right-[8%] z-30"
            >
              <div className="card flex h-14 w-14 items-center justify-center">
                <Award className="h-7 w-7 text-brand" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute bottom-[18%] -left-2 z-30 md:-left-6 lg:-left-10"
            >
              <div className="card flex w-max items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-surface">
                  <TrendingUp className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-tight text-foreground">500+ Projects</p>
                  <p className="text-[11px] font-medium text-muted">Completed this month</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="absolute bottom-[32%] right-[2%] z-30 md:-right-2"
            >
              <div className="card flex h-12 w-12 items-center justify-center">
                <Briefcase className="h-5 w-5 text-brand" />
              </div>
            </motion.div>

            <div className="relative z-20 aspect-[470/560] w-full max-w-[380px] md:max-w-[430px] lg:max-w-[470px]">
              <Image
                src="/hero-student.png"
                alt="Student building real projects on SkillBridge"
                fill
                priority
                sizes="(max-width: 1024px) 380px, 470px"
                className="object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
