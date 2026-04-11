"use client";

import { motion } from "framer-motion";
import { Clock3, FileX, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const PROBLEMS = [
  {
    icon: Clock3,
    id: "01",
    title: "Placements feel far away",
    desc: "Students wait months to do something meaningful. SkillBridge lets you begin now.",
    rail: "from-amber-400 to-orange-500",
    chip: "bg-amber-50 text-amber-700 border-amber-100",
    iconColor: "text-amber-600",
    glow: "bg-amber-100/70",
  },
  {
    icon: FileX,
    id: "02",
    title: "No proof of real work",
    desc: "A certificate matters more when it is backed by tasks, submissions, and outcomes.",
    rail: "from-rose-400 to-red-500",
    chip: "bg-rose-50 text-rose-700 border-rose-100",
    iconColor: "text-rose-600",
    glow: "bg-rose-100/70",
  },
  {
    icon: ShieldCheck,
    id: "03",
    title: "You need a safe first step",
    desc: "Virtual internships are a low-pressure way to learn, build confidence, and stay consistent.",
    rail: "from-emerald-400 to-green-500",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-100",
    iconColor: "text-emerald-600",
    glow: "bg-emerald-100/70",
  },
];

export default function Problem() {
  return (
    <section className="py-20 md:py-28 px-6" id="problem">
      <div className="max-w-[1100px] mx-auto">
        {/* Top header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-[680px] mx-auto"
        >
          <div className="section-label justify-center">The Problem</div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-gray-900 tracking-[-0.02em] leading-[1.1] mt-1">
            Most students wait for opportunities.
            <br />
            <span className="text-green-600">SkillBridge helps you start early.</span>
          </h2>
          <p className="mt-5 text-[16px] text-gray-500 leading-relaxed max-w-[540px] mx-auto">
            If you are in 1st, 2nd, or 3rd year, this is the stage to build
            proof of work with real tasks and clear deadlines.
          </p>
        </motion.div>

        {/* Problem cards — editorial panel style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEMS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white p-7 md:p-8 shadow-[0_25px_60px_-42px_rgba(0,0,0,0.5)] hover:-translate-y-1.5 hover:shadow-[0_35px_80px_-40px_rgba(0,0,0,0.45)] transition-all duration-300"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${item.rail}`} />
              <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${item.glow} blur-2xl`} />

              <div className="absolute right-5 top-5 text-[44px] leading-none font-extrabold tracking-[-0.06em] text-slate-200/70">
                {item.id}
              </div>

              <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase mb-5 ${item.chip}`}>
                Problem
              </div>

              <div className={`w-12 h-12 rounded-2xl bg-white border border-slate-200 ${item.iconColor} flex items-center justify-center mb-5 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.85)]`}>
                <item.icon className="w-5 h-5" strokeWidth={1.9} />
              </div>

              <h3 className="text-[34px] md:text-[38px] leading-none font-extrabold tracking-[-0.05em] text-slate-800/20 mb-2">
                {item.id}
              </h3>

              <h3 className="text-[30px] leading-none font-extrabold tracking-[-0.04em] text-slate-900 mb-3 max-w-[14ch]">
                {item.title}
              </h3>

              <p className="text-[18px] text-slate-600 leading-[1.55]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-green-600 hover:text-green-700 transition-colors group"
          >
            See how SkillBridge solves this
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
