"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StickyMobileCTA() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/60 px-4 py-3 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[16px] font-bold text-gray-900">
            ₹99{" "}
            <span className="text-[12px] font-normal text-gray-400 line-through">₹499</span>
          </p>
          <p className="text-[11px] text-gray-500">Start instantly • Certificate included</p>
        </div>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#10b981] text-white text-[13px] font-semibold rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
          >
            Start Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
