"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StickyMobileCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.90, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-green-600 to-green-500 px-4 py-3.5 md:hidden z-50 shadow-2xl text-white"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap className="w-4 h-4" />
            <p className="text-[12px] font-bold uppercase tracking-wide">Limited Offer</p>
          </div>
          <p className="text-[14px] font-bold">
            ₹99 — Start Your Internship
          </p>
          <p className="text-[11px] opacity-90">2-week program • Certificate included</p>
        </div>
        <motion.div whileTap={{ scale: 0.95 }} className="shrink-0">
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-green-600 text-[13px] font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
          >
            Begin Now
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
