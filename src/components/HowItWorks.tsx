"use client";

import { motion } from "framer-motion";
import { Send, ListChecks, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Send,
    title: "Choose Program",
    desc: "Pick a domain that matches your interest and current skill level.",
    num: "01",
  },
  {
    icon: ListChecks,
    title: "Complete Tasks",
    desc: "Do small, focused work that builds confidence and real skills.",
    num: "02",
  },
  {
    icon: Award,
    title: "Get Certificate",
    desc: "Finish the program and receive a verified certificate to share.",
    num: "03",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-6" id="how-it-works">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-[640px] mx-auto"
        >
          <div className="section-label justify-center">How It Works</div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-gray-900 tracking-[-0.02em] leading-[1.08]">
            A simple path from signup
            <br />
            <span className="text-green-600">to certificate</span>
          </h2>
          <p className="mt-5 text-[15px] text-gray-500 leading-relaxed max-w-[480px] mx-auto">
            The flow is intentionally short. Spend your time doing the work, not figuring out the product.
          </p>
        </motion.div>

        {/* Steps — horizontal timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[56px] left-[15%] right-[15%] h-px bg-gradient-to-r from-green-200 via-green-300 to-green-200" />

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative text-center group"
              >
                {/* Step icon box */}
                <div className="relative mx-auto mb-6 w-[112px] h-[112px] rounded-3xl bg-white border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center group-hover:border-green-200 group-hover:shadow-[0_12px_36px_-8px_rgba(22,163,74,0.12)] transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-2 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <step.icon className="w-5 h-5" strokeWidth={1.6} />
                  </div>
                  <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">
                    Step {i + 1}
                  </span>
                  {/* Dot on timeline */}
                  <div className="hidden lg:block absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border-[3px] border-white shadow-sm" />
                </div>

                <h3 className="text-[17px] font-bold text-gray-900 mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            href="/apply"
            className="btn-primary btn-lg group"
          >
            Start Your Internship
            <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
