"use client";

import { motion } from "framer-motion";
import { Zap, Briefcase, Users, GraduationCap, Rocket, Award, CheckCircle2, ArrowRight, FolderKanban, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: Zap,
    title: "Join Internship",
    desc: "Start in seconds. No long applications.",
    num: "01",
  },
  {
    icon: Briefcase,
    title: "Get Real Project",
    desc: "Work on actual problems, not assignments.",
    num: "02",
  },
  {
    icon: Users,
    title: "Collaborate with IIT/NIT",
    desc: "Build alongside top-performing peers.",
    num: "03",
  },
  {
    icon: GraduationCap,
    title: "Work with Mentors",
    desc: "Get guidance from IIT/NIT alumni.",
    num: "04",
  },
  {
    icon: Rocket,
    title: "Submit & Showcase",
    desc: "Deploy your work and add to portfolio.",
    num: "05",
  },
  {
    icon: Award,
    title: "Verified Certificate",
    desc: "Earn proof + top 2% get mentorship",
    num: "06",
  },
];

const StepCard = ({ step, index }: { step: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ delay: (index % 3) * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-row md:flex-col md:text-center items-start md:items-center gap-5 md:gap-6 relative group"
  >
    {/* Icon Node */}
    <div className="relative z-10 shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:border-brand/40 group-hover:bg-brand-surface/20 group-hover:shadow-[0_8px_30px_rgba(22,163,74,0.15)] transition-all duration-500 ease-out">
      <step.icon className="w-6 h-6 md:w-8 md:h-8 text-neutral-400 group-hover:text-brand transition-colors duration-500" strokeWidth={1.5} />
      <div className="absolute -top-1 -right-1 md:-top-1 md:-right-1 w-7 h-7 md:w-8 md:h-8 bg-white group-hover:bg-brand text-foreground group-hover:text-white text-[12px] md:text-[14px] font-bold flex items-center justify-center rounded-full border shadow-sm border-neutral-200 group-hover:border-brand transition-all duration-500 ease-out">
        {parseInt(step.num)}
      </div>
    </div>
    
    {/* Text Content */}
    <div className="flex-1 mt-1 md:mt-2">
      <h3 className="text-[17px] md:text-[20px] font-bold text-foreground mb-1.5 md:mb-2.5 tracking-tight group-hover:text-brand transition-colors duration-300">{step.title}</h3>
      <p className="text-[14px] md:text-[15px] text-muted leading-relaxed font-medium md:max-w-[260px] md:mx-auto">
        {step.desc}
      </p>
    </div>
  </motion.div>
);

export default function HowItWorks({ shortMode = false }: { shortMode?: boolean }) {
  const displaySteps = shortMode ? STEPS.slice(0, 3) : STEPS;

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 overflow-hidden relative bg-white" id="how-it-works">
      {/* Subtle Premium Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.04)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      
      <div className="max-w-[1140px] mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-24 max-w-3xl mx-auto"
        >
          <div className="section-label justify-center">How SkillBridge Works</div>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1] text-balance">
            A simple path from learning to <span className="text-brand">real projects</span> and opportunities
          </h2>
        </motion.div>

        {/* Steps Flow */}
        <div className="relative">
          
          {/* == ROW 1 == */}
          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden md:block absolute top-[40px] left-[16.6%] right-[16.6%] h-[2px] bg-neutral-100 z-0 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="w-full h-full bg-gradient-to-r from-brand/10 via-brand/40 to-brand/80"
              />
            </div>
            {/* Mobile Vertical Line */}
            <div className="md:hidden absolute left-[31px] top-[40px] bottom-[40px] w-[2px] bg-neutral-100 z-0 overflow-hidden">
              <motion.div 
                initial={{ y: "-100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="w-full h-full bg-gradient-to-b from-brand/10 via-brand/40 to-brand/80"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-8 relative z-10">
              {displaySteps.slice(0, 3).map((step, i) => (
                <StepCard key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* == TRUST LAYERS == */}
          {!shortMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
              className="py-12 md:py-20 relative z-20"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-14 rounded-full bg-white border border-neutral-200/60 py-4 px-8 md:py-5 md:px-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-max mx-auto relative overflow-hidden group">
                <style>{`
                  @keyframes shimmer {
                    100% { transform: translateX(100%); }
                  }
                `}</style>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand/20 flex items-center justify-center text-brand">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] md:text-[15px] font-bold text-foreground tracking-wide">Real-world projects, not theory</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-neutral-200 relative z-10" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand/20 flex items-center justify-center text-brand">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-[14px] md:text-[15px] font-bold text-foreground tracking-wide">Work that you can actually show</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* == ROW 2 == */}
          {!shortMode && (
            <div className="relative">
              {/* Desktop Horizontal Line */}
              <div className="hidden md:block absolute top-[40px] left-[16.6%] right-[16.6%] h-[2px] bg-neutral-100 z-0 overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  whileInView={{ x: "0%" }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  className="w-full h-full bg-gradient-to-r from-brand/10 via-brand/40 to-brand/80"
                />
              </div>
              {/* Mobile Vertical Line */}
              <div className="md:hidden absolute left-[31px] top-[40px] bottom-[40px] w-[2px] bg-neutral-100 z-0 overflow-hidden">
                <motion.div 
                  initial={{ y: "-100%" }}
                  whileInView={{ y: "0%" }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  className="w-full h-full bg-gradient-to-b from-brand/10 via-brand/40 to-brand/80"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-8 relative z-10">
                {displaySteps.slice(3, 6).map((step, i) => (
                  <StepCard key={step.num} step={step} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* == OUTCOME BOX == */}
          {!shortMode && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 md:mt-24 rounded-[32px] border border-neutral-200 bg-white p-8 md:p-14 shadow-[0_12px_40px_rgba(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="text-center mb-12 relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-surface border border-brand/20 text-brand-dark text-[12px] font-bold tracking-widest uppercase mb-5"
                >
                  Final Outcome
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  What You Walk Away With
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
                {[
                  { icon: FolderKanban, text: "2–3 real projects" },
                  { icon: ShieldCheck, text: "Verified certificate" },
                  { icon: Briefcase, text: "Strong portfolio" },
                  { icon: Trophy, text: "Internship opportunities", subtitle: "Top Performers" },
                ].map((outcome, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (idx * 0.1), duration: 0.6 }}
                    className="flex flex-col items-center justify-center text-center p-8 rounded-[24px] bg-neutral-50/50 border border-neutral-100 hover:border-brand/30 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-5 text-brand group-hover:scale-110 transition-transform duration-500 ease-out">
                      <outcome.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <span className="text-[16px] md:text-[17px] font-bold text-foreground">{outcome.text}</span>
                    {outcome.subtitle && <span className="text-[12px] font-bold text-brand uppercase tracking-widest mt-2">{outcome.subtitle}</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-16 md:mt-24 text-center flex flex-col items-center gap-5 relative z-10"
        >
          <Link
            href="/apply"
            className="btn-primary group inline-flex px-8 py-4.5 text-[16px] md:text-[17px] shadow-xl shadow-brand/20 hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500" />
            <span className="relative z-10 flex items-center">
              Start Your First Project
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-surface text-brand-dark text-[13px] font-bold rounded-full">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Limited seats
            </div>
            <span className="text-neutral-300">•</span>
            <span className="text-[14px] font-bold text-foreground">Join for ₹349</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
