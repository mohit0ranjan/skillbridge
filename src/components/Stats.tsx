"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, TrendingUp, Layers, Globe } from "lucide-react";

function CountUp({ target, suffix = "" }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();
    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    target: 5000,
    suffix: "+",
    label: "Students Started",
    sublabel: "Across India",
    icon: Users,
    accent: "from-emerald-500 to-green-600",
    glow: "from-emerald-100 to-emerald-50",
  },
  {
    target: 100,
    suffix: "+",
    label: "Tasks Completed",
    sublabel: "Every week",
    icon: TrendingUp,
    accent: "from-teal-500 to-emerald-600",
    glow: "from-teal-100 to-emerald-50",
  },
  {
    target: 10,
    suffix: "+",
    label: "Career Domains",
    sublabel: "Tech & Business",
    icon: Layers,
    accent: "from-lime-500 to-green-600",
    glow: "from-lime-100 to-green-50",
  },
  {
    target: 50,
    suffix: "+",
    label: "Colleges",
    sublabel: "Represented",
    icon: Globe,
    accent: "from-green-500 to-teal-600",
    glow: "from-green-100 to-teal-50",
  },
];

export default function Stats() {
  return (
    <section className="relative py-20 md:py-24 px-6 overflow-hidden">
      {/* Soft atmospheric layers to avoid a flat section background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-56 w-56 rounded-full bg-lime-200/25 blur-3xl" />
        <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
      </div>

      <div className="max-w-[1140px] mx-auto rounded-[36px] border border-white/60 bg-gradient-to-b from-[#f5f8f4] to-[#eef4ee] p-6 sm:p-8 md:p-10 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-14"
        >
          <div className="section-label justify-center">Traction</div>
          <h2 className="text-3xl sm:text-4xl md:text-[3.05rem] font-extrabold text-slate-900 tracking-[-0.03em] leading-[1.06]">
            Growing every week
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 px-6 py-7 md:px-7 md:py-8 text-center shadow-[0_20px_45px_-35px_rgba(0,0,0,0.55)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-32px_rgba(0,0,0,0.45)] transition-all duration-300"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${stat.accent}`} />
              <div className={`absolute -top-12 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.glow} opacity-80`} />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.glow} border border-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5" strokeWidth={2} />
                </div>

                <p className="text-[42px] md:text-[50px] font-extrabold tracking-[-0.045em] text-slate-900 leading-none mb-2">
                  <CountUp target={stat.target} suffix={stat.suffix} />
                </p>
                <p className="text-[14px] font-bold text-slate-700">
                  {stat.label}
                </p>
                <p className="text-[12px] text-slate-500 mt-1">
                  {stat.sublabel}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
