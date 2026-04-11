"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, CircleDollarSign, ChartNoAxesColumn, ArrowUpRight } from "lucide-react";

export default function StoryBlocks() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-[1100px] mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-8 items-center"
        >
          <div>
            <div className="inline-flex items-center rounded-full bg-[#111] text-white text-[11px] px-3 py-1.5 mb-4">
              Product Preview
            </div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 leading-tight mb-4">
              Track Your Internship Progress Clearly
            </h3>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed mb-6">
              See tasks, progress, and certificate readiness in one clean view. You always know what is done and what is next.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <div className="rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[13px] text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                Task completion timeline
              </div>
              <div className="rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[13px] text-gray-600 flex items-center gap-2">
                <ChartNoAxesColumn className="w-4 h-4 text-[#10b981]" />
                Progress and review status
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
            <div className="rounded-[18px] border border-gray-100 bg-[#fafafa] p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-gray-900">Overview</p>
                <span className="text-[11px] text-gray-400">This week</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "68%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                  className="h-full bg-[#10b981] rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-[14px] bg-white border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Tasks done</p>
                  <p className="text-[20px] font-semibold text-gray-900">6/9</p>
                </div>
                <div className="rounded-[14px] bg-white border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Certificate</p>
                  <p className="text-[14px] font-semibold text-[#0f8d61]">On Track</p>
                </div>
              </div>
              <Link href="/apply" className="w-full rounded-[12px] bg-[#111] hover:bg-[#222] text-white text-[12px] font-medium py-2.5 inline-flex items-center justify-center gap-1.5 transition-colors">
                Start Your Internship
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[0.9fr_1fr] gap-8 items-center"
        >
          <div className="order-2 lg:order-1 rounded-[26px] border border-gray-100 bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.05)]">
            <div className="rounded-[18px] border border-gray-100 bg-[#fafafa] p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-gray-900">Student Profile</p>
                <span className="text-[11px] text-gray-400">Updated today</span>
              </div>
              <div className="rounded-[14px] bg-white border border-gray-100 p-4 mb-3">
                <p className="text-[11px] text-gray-400 mb-1">Current Internship</p>
                <p className="text-[14px] font-semibold text-gray-900">Web Development</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[14px] bg-white border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Weekly score</p>
                  <p className="text-[18px] font-semibold text-gray-900">84</p>
                </div>
                <div className="rounded-[14px] bg-white border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Placement readiness</p>
                  <p className="text-[14px] font-semibold text-[#0f8d61]">Improving</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center rounded-full bg-[#111] text-white text-[11px] px-3 py-1.5 mb-4">
              Student Growth
            </div>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 leading-tight mb-4">
              Build Resume Confidence, Not Just Completion
            </h3>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed mb-6">
              The goal is not to just finish tasks. It is to build work quality, consistency, and confidence you can show in interviews.
            </p>
            <div className="rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[13px] text-gray-600 inline-flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-[#10b981]" />
              Affordable internships that still feel professional
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
