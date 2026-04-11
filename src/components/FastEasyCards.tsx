"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BadgeIndianRupee, Clock3, FileCheck2, ArrowDown } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Choose Your Internship",
    text: "Pick a domain that matches your interest — marketing, web dev, or data analytics.",
    icon: BadgeIndianRupee,
    accent: "from-emerald-400 to-teal-500",
  },
  {
    num: "02",
    title: "Start Instantly",
    text: "No application or interview needed. Pay and start your week-wise learning plan right away.",
    icon: Clock3,
    accent: "from-blue-400 to-indigo-500",
  },
  {
    num: "03",
    title: "Get Certified",
    text: "Complete guided assignments and receive a verified certificate with a unique ID.",
    icon: FileCheck2,
    accent: "from-violet-400 to-purple-500",
  },
];

export default function FastEasyCards() {
  return (
    <section className="py-20 px-6 relative overflow-hidden" id="how-it-works">
      <div className="max-w-[1140px] mx-auto">
        <div className="text-center mb-16">
          <div className="section-label justify-center">How It Works</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-gray-900">
            Three steps to your certificate
          </h2>
        </div>

        {/* Timeline layout */}
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden md:block absolute top-[60px] left-1/2 -translate-x-1/2 w-[2px] bottom-[60px]">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="h-full bg-gradient-to-b from-[#10b981] via-[#34d399] to-[#8b5cf6] origin-top rounded-full"
            />
          </div>

          <div className="space-y-6 md:space-y-0">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className={`relative md:grid md:grid-cols-2 md:gap-16 items-center ${i > 0 ? "md:mt-4" : ""}`}
              >
                {/* Content — alternating sides */}
                <div className={`${i % 2 === 0 ? "md:text-right" : "md:order-2"} mb-6 md:mb-0`}>
                  <div className={`inline-flex items-center gap-2 mb-3 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                    <span className={`text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r ${step.accent} bg-clip-text text-transparent`}>
                      Step {step.num}
                    </span>
                  </div>
                  <h3 className="text-[24px] md:text-[28px] font-semibold text-gray-900 tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed max-w-[380px] inline-block">
                    {step.text}
                  </p>
                </div>

                {/* Center node */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.2, type: "spring", stiffness: 260 }}
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-50 border-2 border-white shadow-[0_8px_28px_rgba(0,0,0,0.1)] items-center justify-center"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                </motion.div>

                {/* Visual element — alternating sides */}
                <div className={`${i % 2 === 0 ? "md:order-2" : ""}`}>
                  <div className="rounded-[22px] bg-gradient-to-br from-gray-50 to-white border border-gray-100/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.accent} flex items-center justify-center md:hidden`}>
                        <step.icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${33 * (i + 1)}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${step.accent}`}
                          />
                        </div>
                      </div>
                      <span className="text-[12px] font-semibold text-gray-400">{33 * (i + 1)}%</span>
                    </div>
                    <p className="text-[12px] text-gray-400">
                      {i === 0 && "Browse internships → Pick your domain → Confirm selection"}
                        {i === 1 && "Pay ₹99 → Get access → Begin Week 1"}
                        {i === 2 && "Complete weeks → Submit final project → Download certificate"}
                    </p>
                  </div>
                </div>

                {/* Mobile arrow */}
                {i < 2 && (
                  <div className="md:hidden flex justify-center py-2">
                    <ArrowDown className="w-5 h-5 text-[#10b981]/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-[14px] transition-all shadow-[0_6px_18px_rgba(16,185,129,0.2)] hover:shadow-[0_10px_24px_rgba(16,185,129,0.3)] group"
            >
              Start Your Internship — ₹99
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </motion.div>
          <p className="text-[12px] text-gray-400 mt-3">No application needed • Start instantly after payment</p>
        </motion.div>
      </div>
    </section>
  );
}
