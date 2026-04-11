"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Workflow, Radar, AppWindow, ArrowUpRight, Sparkles } from "lucide-react";

const TRACKS = [
  {
    title: "Web Development",
    tasks: ["Build a landing page", "Deploy your website"],
    icon: Workflow,
    skills: ["HTML", "CSS", "Responsive UI"],
    color: "text-blue-600",
    iconBg: "bg-blue-100",
    chipColor: "bg-blue-50 text-blue-600",
  },
  {
    title: "Digital Marketing",
    tasks: ["Create a campaign", "Design social posts"],
    icon: Radar,
    skills: ["SEO", "Canva", "Content"],
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
    chipColor: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Data Analytics",
    tasks: ["Analyze dataset", "Build dashboard"],
    icon: AppWindow,
    skills: ["Excel", "Charts", "Reporting"],
    color: "text-violet-600",
    iconBg: "bg-violet-100",
    chipColor: "bg-violet-50 text-violet-600",
  },
];

export default function AutomationCards() {
  return (
    <section className="py-20 px-6 bg-[#f5f8f7] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[12%] w-[380px] h-[380px] rounded-full bg-[#10b981]/8 blur-[110px]" />
      </div>

      <div className="max-w-[1140px] mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="section-label justify-center">Project Output</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 leading-tight mb-4">
            What You&apos;ll Build
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Everything you build can be added to your resume and portfolio.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Large dark accent card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5 rounded-[28px] bg-[#0f1c33] p-7 md:p-8 text-white relative overflow-hidden hover:shadow-[0_20px_50px_rgba(15,28,51,0.35)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#10b981]/15 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#6366f1]/10 blur-[70px] rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-[#34d399]" />
                <span className="text-[12px] font-semibold text-[#34d399] uppercase tracking-wider">Resume Ready</span>
              </div>
              <h3 className="text-[28px] md:text-[32px] font-semibold leading-[1.1] tracking-tight mb-4">
                Real projects.<br />Real skills.<br />Real proof.
              </h3>
              <p className="text-[14px] text-gray-400 leading-relaxed mb-8 max-w-[300px]">
                Complete guided tasks and turn your work into proof you can show to recruiters.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 backdrop-blur-sm px-4 py-3 border border-white/5">
                  <p className="text-[28px] font-bold tracking-tight">25+</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">task templates</p>
                </div>
                <div className="rounded-2xl bg-white/8 backdrop-blur-sm px-4 py-3 border border-white/5">
                  <p className="text-[28px] font-bold tracking-tight">100+</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">weekly outputs</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Track cards stacked */}
          <div className="md:col-span-7 grid gap-4">
            {TRACKS.map((track, i) => (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-[22px] bg-white border border-gray-100/80 p-5 flex items-center gap-5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${track.iconBg} flex items-center justify-center shrink-0`}>
                  <track.icon className={`w-5 h-5 ${track.color}`} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold text-gray-900 mb-1">{track.title}</h3>
                  <p className="text-[13px] text-gray-500">{track.tasks.join(" • ")}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {track.skills.map((skill) => (
                    <span key={skill} className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${track.chipColor}`}>
                      {skill}
                    </span>
                  ))}
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#10b981] transition-colors shrink-0" />
              </motion.div>
            ))}

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="rounded-[22px] bg-gradient-to-r from-[#ecfdf5] to-[#f0fdf4] border border-[#d1fae5] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Ready to start building?</p>
                <p className="text-[13px] text-gray-500">Pick a domain and begin your first task today.</p>
              </div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link href="/apply" className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-[13px] font-semibold rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] whitespace-nowrap">
                  Explore Internships →
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
