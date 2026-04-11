"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Zap,
  Award,
  MessageSquare,
  Smartphone,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const PRIMARY_FEATURES = [
  {
    icon: CheckCircle2,
    title: "Real Internship Tasks",
    desc: "Complete guided tasks designed like real job work — not theory or quizzes. Each week brings new challenges aligned to your chosen domain.",
    highlight: "Task-based learning",
  },
  {
    icon: Zap,
    title: "Build Real Projects",
    desc: "Create work you can actually show on your resume or portfolio to recruiters. Every submission builds your professional presence.",
    highlight: "Portfolio-ready output",
  },
  {
    icon: Award,
    title: "Verified Certificate",
    desc: "Receive a certificate with a unique verification ID that anyone — recruiters, colleges, or companies — can verify online.",
    highlight: "Online verifiable",
  },
];

const SECONDARY_FEATURES = [
  { icon: MessageSquare, title: "Friendly guidance", desc: "Clear instructions in simple language" },
  { icon: Smartphone, title: "Works on mobile", desc: "Complete tasks without a laptop" },
  { icon: BadgeCheck, title: "Trustworthy proof", desc: "Share your task record confidently" },
];

export default function Features() {
  return (
    <section className="py-20 md:py-28 px-6 relative overflow-hidden" id="features">
      <div className="max-w-[1100px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-[680px] mx-auto"
        >
          <div className="section-label justify-center">Features</div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-foreground tracking-tight leading-[1.08]">
            What You Actually Get
          </h2>
          <p className="mt-5 text-[16px] text-muted leading-relaxed max-w-[520px] mx-auto">
            Beginner-friendly virtual internships designed for students who want
            practical experience they can show.
          </p>
        </motion.div>

        {/* Primary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRIMARY_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 group relative overflow-hidden hover:-translate-y-1.5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-light to-brand rounded-t-2xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-surface text-brand border border-brand-border flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <feat.icon className="w-6 h-6" strokeWidth={1.75} />
                </div>

                <span className="inline-flex items-center mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-foreground bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-full">
                  {feat.highlight}
                </span>

                <h3 className="text-[22px] leading-tight font-bold tracking-tight text-foreground mb-4">
                  {feat.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted">
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary benefit cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SECONDARY_FEATURES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white px-5 py-5 shadow-sm hover:-translate-y-0.5 hover:border-brand-border transition-all duration-300"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-brand-light to-brand" />
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-surface text-brand border border-brand-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <item.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <p className="text-[11px] font-black tracking-[0.2em] text-neutral-400 pt-0.5">0{i + 1}</p>
              </div>

              <div className="mt-3 pl-[52px]">
                <h3 className="text-[15px] font-bold text-foreground">{item.title}</h3>
                <p className="text-[13px] text-muted leading-snug mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link href="/programs" className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand hover:text-brand-dark transition-colors group">
            Explore all programs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
