"use client";

import { motion } from "framer-motion";
import { ArrowRight, CircleCheckBig, Sparkles, Upload, FileCheck } from "lucide-react";

const STEPS = [
  { icon: Sparkles, title: "1. Choose Internship", desc: "Pick a track that matches your interest and start right away." },
  { icon: ArrowRight, title: "2. Start Instantly", desc: "Get access immediately after joining. No waiting period." },
  { icon: Upload, title: "3. Complete Tasks", desc: "Submit simple tasks and track your progress as you go." },
  { icon: FileCheck, title: "4. Get Certificate", desc: "Receive a verified certificate once your work is approved." },
];

export default function JoinFlow() {
  return (
    <section className="py-20 px-6" id="how-it-works">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="section-label justify-center">What Happens After You Join</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Four steps. No confusion.
          </h2>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            The process is simple enough that a first-year student can understand it in a minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-[24px] bg-white border border-gray-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.04)] p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
