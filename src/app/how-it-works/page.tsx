"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Layers, CheckSquare, ShieldCheck, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Sign Up",
    desc: "Create your account in seconds. No lengthy applications or waitlists.",
    icon: UserPlus,
    visual: (
      <div className="card w-full p-6 shadow-sm border border-gray-100 bg-white scale-95 md:scale-100 origin-left">
        <div className="flex gap-4 items-center mb-6 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">You</div>
          <div>
            <div className="text-sm font-bold text-gray-900">Welcome back</div>
            <div className="text-xs text-gray-500">Sign in to your workspace</div>
          </div>
        </div>
        <div className="h-10 w-full rounded-lg bg-gray-50 border border-gray-100 mb-3" />
        <div className="h-10 w-full rounded-lg bg-green-500 text-white flex items-center justify-center text-[13px] font-semibold">Join Now</div>
      </div>
    )
  },
  {
    num: "02",
    title: "Choose Your Internship",
    desc: "Find a domain that fits your career goals. Frontend, Backend, UI/UX, or Data Science.",
    icon: Layers,
    visual: (
      <div className="grid grid-cols-2 gap-3 w-full scale-95 md:scale-100 origin-right">
        {["Frontend", "Backend", "UI/UX", "Data Analytics"].map((d, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hover:border-green-300 hover:shadow-md transition-all cursor-default">
            <div className="w-8 h-8 rounded-lg bg-green-50 mb-3" />
            <div className="text-[13px] font-bold text-gray-900 mb-1">{d}</div>
            <div className="text-[10px] text-gray-400">4 Weeks • Remote</div>
          </div>
        ))}
      </div>
    )
  },
  {
    num: "03",
    title: "Complete Tasks & Projects",
    desc: "Work on real-world assignments with structured guidance and submit them for review.",
    icon: CheckSquare,
    visual: (
      <div className="w-full bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xl border border-slate-800 scale-95 md:scale-100 origin-left">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white text-[13px] font-bold">Week 1 Tasks</div>
          <div className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md">In Progress</div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((t) => (
            <div key={t} className={`p-3 rounded-lg flex items-center gap-3 border ${t === 1 ? "bg-slate-800 border-green-500/30" : "bg-slate-800/50 border-slate-700/50"}`}>
              <div className={`w-5 h-5 rounded-md flex justify-center items-center ${t === 1 ? "bg-green-500/20 text-green-500" : "border border-slate-600"}`}>
                {t === 1 && <CheckSquare className="w-3 h-3" />}
              </div>
              <div className="flex-1 h-2 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    num: "04",
    title: "Get Certified",
    desc: "Receive an industry-recognized, verified certificate upon successful completion.",
    icon: ShieldCheck,
    visual: (
      <div className="w-full aspect-[4/3] rounded-2xl border-4 border-gray-100 shadow-lg bg-white relative overflow-hidden flex flex-col items-center justify-center p-6 scale-95 md:scale-100 origin-right">
        <div className="absolute top-0 w-full h-2 bg-green-600" />
        <ShieldCheck className="w-12 h-12 text-green-500 mb-4 opacity-20" />
        <div className="text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Certificate of Completion</div>
          <div className="text-lg md:text-xl font-serif text-gray-900 font-bold mb-1">Jane Doe</div>
          <div className="w-24 h-px bg-green-200 mx-auto mb-2" />
          <div className="text-[10px] text-gray-500">Frontend Developer Internship</div>
        </div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border border-green-200 bg-green-50 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200" />
        </div>
      </div>
    )
  },
  {
    num: "05",
    title: "Boost Your Career",
    desc: "Add the verifiable experience to your resume and LinkedIn to stand out to recruiters.",
    icon: Rocket,
    visual: (
      <div className="w-full flex flex-col gap-4 scale-95 md:scale-100 origin-left">
        <div className="p-4 rounded-xl bg-[#0a66c2]/5 border border-[#0a66c2]/20 flex gap-4">
          <div className="w-12 h-12 rounded bg-[#0a66c2] flex items-center justify-center text-white font-bold text-xl">in</div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-gray-900">Experience</div>
            <div className="text-xs text-gray-600 font-semibold">Frontend Developer Intern</div>
            <div className="text-[10px] text-gray-500">SkillBridge • Remote</div>
          </div>
        </div>
        <div className="p-4 rounded-xl card border shadow-sm border-gray-200 flex gap-4">
          <div className="w-10 h-12 bg-gray-100 rounded flex flex-col items-center justify-center border border-gray-200">
             <div className="w-4 h-0.5 bg-gray-300 mb-1" />
             <div className="w-6 h-0.5 bg-gray-300 mb-1" />
             <div className="w-5 h-0.5 bg-gray-300" />
          </div>
          <div className="flex-1 pt-1">
            <div className="text-[13px] font-bold text-gray-900">Resume Updated</div>
            <div className="text-xs text-green-600 font-medium">ATS Score: 92%</div>
          </div>
        </div>
      </div>
    )
  }
];

export default function HowItWorksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans selection:bg-green-100 selection:text-green-900">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-24">
        {/* Hero */}
        <section className="text-center px-4 sm:px-6 mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[800px] mx-auto"
          >
            <div className="section-label justify-center">How It Works</div>
            <h1 className="text-[2.5rem] md:text-[4rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              A simple, structured path to <span className="text-green-700 bg-green-50 px-2 rounded-lg">real-world experience</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-[600px] mx-auto">
              Follow these straightforward steps to skip the traditional friction and move directly into practical work, feedback, and proof.
            </p>
          </motion.div>
        </section>

        {/* Timeline flow */}
        <section className="px-4 sm:px-6 relative overflow-hidden" ref={containerRef}>
          <div className="max-w-[980px] mx-auto relative">
            
            {/* The vertical tracking line */}
            <div className="absolute left-[28px] md:left-1/2 top-[40px] bottom-[100px] w-0.5 bg-gray-200 md:-translate-x-1/2" />
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute left-[28px] md:left-1/2 top-[40px] w-0.5 bg-gradient-to-b from-green-500 via-green-400 to-green-600 md:-translate-x-1/2 origin-top"
            />

            {STEPS.map((step, i) => {
              const isEven = i % 2 !== 0;
              return (
                <div key={step.num} className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-20 md:mb-28 group">
                  
                  {/* Left Column (Content) */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full md:w-[45%] pl-[72px] md:pl-0 ${isEven ? "md:order-2 md:pl-[5%]" : "md:pr-[5%] text-left"}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl font-extrabold text-gray-200 group-hover:text-green-200 transition-colors">{step.num}</span>
                      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 text-green-600 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
                        <step.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-[16px] text-gray-500 leading-relaxed max-w-[340px]">{step.desc}</p>
                  </motion.div>

                  {/* The connected dot */}
                  <div className="absolute left-[28px] md:left-1/2 top-[24px] md:top-1/2 w-4 h-4 rounded-full bg-white border-4 border-gray-200 md:-translate-x-1/2 md:-translate-y-1/2 z-10 transition-colors duration-500 group-hover:border-green-500" />
                  
                  {/* Right Column (Visual) */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full md:w-[45%] hidden md:flex items-center justify-center ${isEven ? "md:order-1 md:pr-[5%]" : "md:pl-[5%]"}`}
                  >
                    <div className="w-full relative">
                      {/* Decorative backdrop blobs */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-green-50/40 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />
                      {step.visual}
                    </div>
                  </motion.div>

                </div>
              );
            })}

          </div>
        </section>

        {/* Action CTA */}
        <section className="px-4 sm:px-6 pt-20 border-t border-gray-100 max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border border-gray-200 bg-white p-10 md:p-16 overflow-hidden relative shadow-[0_16px_48px_rgba(15,23,42,0.05)]"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <h2 className="text-[32px] md:text-[40px] font-bold text-gray-900 mb-4 tracking-tight relative z-10">
              Ready to start your career?
            </h2>
            <p className="text-[16px] text-gray-500 mb-8 max-w-[500px] mx-auto relative z-10">
              Join students from top colleges and start building verifiable experience today.
            </p>
            <Link href="/apply" className="btn-primary btn-lg inline-flex group relative z-10">
              Apply Now — ₹99
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}