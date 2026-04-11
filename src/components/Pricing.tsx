"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LockKeyhole,
  Rocket,
  BadgeCheck,
  ArrowRight,
  Shield,
} from "lucide-react";

const POINTS = [
  {
    icon: LockKeyhole,
    title: "Secure payment",
    desc: "Pay safely through UPI, cards, or net banking.",
  },
  {
    icon: Rocket,
    title: "Instant access",
    desc: "Start your internship immediately after payment.",
  },
  {
    icon: BadgeCheck,
    title: "Certificate included",
    desc: "Verified certificate with unique ID at no extra cost.",
  },
];

export default function Pricing() {
  return (
    <section
      className="py-20 px-6 relative overflow-hidden"
      id="pricing"
    >
      <div className="max-w-[940px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-8 md:p-10 text-center relative"
        >
          <div className="section-label justify-center">Pricing</div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-gray-900 tracking-tight leading-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
            One-time fee. No hidden charges. No recurring subscription.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-[13px] font-medium text-green-700">
            Certificate included with every program
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[520px] mx-auto">
            <div className="rounded-xl border border-green-200 bg-green-50/60 px-4 py-4 text-left">
              <p className="text-[12px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                Starter Internship
              </p>
              <p className="text-[30px] tracking-[-0.03em] font-semibold text-gray-900">
                ₹99{" "}
                <span className="text-[14px] font-normal text-gray-400 line-through">
                  ₹499
                </span>
              </p>
              <p className="text-[12px] text-gray-500">
                Digital Marketing · 2 weeks
              </p>
            </div>
            <div className="rounded-xl border-2 border-green-500 bg-green-50/40 px-4 py-4 text-left relative">
              <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <p className="text-[12px] uppercase tracking-[0.12em] text-gray-500 font-semibold mt-1">
                Advanced Beginner
              </p>
              <p className="text-[30px] tracking-[-0.03em] font-semibold text-gray-900">
                ₹199{" "}
                <span className="text-[14px] font-normal text-gray-400 line-through">
                  ₹799
                </span>
              </p>
              <p className="text-[12px] text-gray-500">
                Web Dev / Data Analytics · 2 weeks
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/apply"
              className="btn-primary btn-lg group"
            >
              Start Your Internship
              <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            100% refund if certificate not delivered
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {POINTS.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-2xl border border-gray-200/70 bg-gray-50/50 p-5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.04)] transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                  <point.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {point.title}
                </h3>
                <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">
                  {point.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="mt-7 text-[13px] text-gray-500">
            Pay via UPI, debit card, or net banking. No recurring charges.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
