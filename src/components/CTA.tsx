"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-[1100px] mx-auto rounded-2xl px-8 py-14 md:px-12 md:py-14 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f3d35 0%, #14532d 50%, #0f3d35 100%)",
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/15 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-[240px] h-[240px] bg-green-400/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-white mb-3 tracking-tight leading-tight">
              Start Your First Internship Today
            </h2>
            <p className="text-gray-300 text-[15px] mb-3 max-w-sm md:max-w-md leading-relaxed mx-auto md:mx-0">
              No experience needed. Choose a domain, complete tasks, get
              certified.
            </p>
            <p className="text-[12px] text-green-300/80 mb-5 mx-auto md:mx-0">
              Limited summer enrollment · Starting at ₹99
            </p>
            <div className="inline-flex flex-wrap items-center gap-2 text-[12px] text-green-100/70">
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                No interviews
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                Instant start
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                Verified certificate
              </span>
            </div>
          </div>

          <div className="text-center md:text-right">
            <Link
              href="/apply"
              className="btn-primary group"
            >
              Start Internship — ₹99
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
