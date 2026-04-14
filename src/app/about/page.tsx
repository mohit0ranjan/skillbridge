import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Layers3,
  Rocket,
  ShieldCheck,
  Target,
  Users2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const PRINCIPLES = [
  {
    icon: Target,
    title: "Mission",
    desc: "Give every student a practical way to build real work before placements begin.",
  },
  {
    icon: Rocket,
    title: "Approach",
    desc: "We focus on doing, not watching. Students work on guided tasks that feel closer to real work than classroom learning.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    desc: "Every certificate is tied to actual work and includes a unique ID that can be verified publicly.",
  },
  {
    icon: Users2,
    title: "Audience",
    desc: "Built for students who want to start early and have something real to show — not just certificates.",
  },
];

const PROOF_POINTS = [
  { value: "5,000+", label: "students have started building projects" },
  { value: "100+", label: "project tasks completed weekly" },
  { value: "10+", label: "practical career domains" },
  { value: "50+", label: "colleges participating in real work" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-[#fafaf8]">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-24 md:pb-20 overflow-hidden">
        {/* HERO SECTION */}
        <section className="px-4 sm:px-6">
          <div className="max-w-[1180px] mx-auto relative">
            <div className="absolute -top-12 right-0 h-56 w-56 rounded-full bg-green-100/30 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start relative z-10">
              <div className="max-w-[720px]">
                <div className="section-label">About SkillBridge</div>
                <h1 className="text-[3rem] sm:text-[3.6rem] md:text-[4rem] font-extrabold tracking-tight leading-[1] text-gray-900 mb-6">
                  The shortest path from learning to <span className="text-green-600">real work.</span>
                </h1>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 mb-6">
                  <ShieldCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-[13px] font-semibold text-gray-600">Built with guidance from students and alumni across IITs and NITs</span>
                </div>

                <p className="text-[16px] md:text-[18px] font-medium text-gray-600 leading-relaxed max-w-[620px]">
                  SkillBridge is built for students who are tired of collecting certificates without having anything real to show. Instead of lectures, you work on practical projects, collaborate with others, and leave with proof you can actually use.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
                  <Link href="/programs" className="btn-primary btn-lg group inline-flex">
                    Browse Programs
                    <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/how-it-works" className="btn-secondary btn-lg inline-flex">
                    See How It Works
                  </Link>
                </div>
              </div>

              {/* RECOGNITION & STATS (Sidebar) */}
              <div className="flex flex-col gap-6">
                <div className="rounded-[28px] border border-gray-200/70 bg-white p-6 shadow-sm">
                   <div className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-4">Recognition & Trust</div>
                   <div className="flex flex-wrap items-center gap-4">
                     <Image src="/msme logo.png" alt="MSME" width={90} height={40} className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" unoptimized />
                     <Image src="/skill india logo.png" alt="Skill India" width={110} height={40} className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" unoptimized />
                     <Image src="/kshitij.png" alt="Kshitij IIT Kharagpur" width={96} height={40} className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" unoptimized />
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[260px]">
                  {PROOF_POINTS.slice(0, 4).map((point) => (
                    <div key={point.label} className="rounded-[20px] bg-white border border-gray-100 px-5 py-5 shadow-sm flex flex-col justify-center">
                      <div className="text-[24px] font-extrabold text-gray-900 leading-none mb-1.5">{point.value}</div>
                      <div className="text-[13px] font-medium text-gray-500 leading-snug">{point.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THE PROBLEM & WHAT WE CHANGED */}
        <section className="px-4 sm:px-6 mt-20 md:mt-28">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* The Problem */}
            <div className="rounded-[28px] border border-gray-200 bg-white p-8 md:p-10 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-6">
                 <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-[26px] md:text-[30px] font-extrabold text-gray-900 mb-4 tracking-tight">The problem we saw</h2>
              <p className="text-[16px] font-semibold text-gray-500 mb-6">Most students:</p>
              
              <ul className="space-y-4">
                {[
                  "Collect certificates but don’t build anything real",
                  "Don’t know how real projects actually work",
                  "Struggle to show proof during internships",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-2" />
                     <span className="text-[15px] font-medium text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Changed */}
            <div className="rounded-[28px] border border-green-200 bg-green-50/50 p-8 md:p-10 shadow-sm relative overflow-hidden">
               <div className="w-12 h-12 rounded-2xl bg-white border border-green-100 text-green-600 flex items-center justify-center mb-6 shadow-sm">
                 <Lightbulb className="w-6 h-6" />
              </div>
              <h2 className="text-[26px] md:text-[30px] font-extrabold text-gray-900 mb-6 tracking-tight">What we’re doing differently</h2>
              
              <ul className="space-y-4">
                {[
                  "Replaced lectures with real project work",
                  "Focus on output, not completion",
                  "Built a system where students actually create something",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                     <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                     <span className="text-[15px] font-medium text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* 6. REFINED PRINCIPLES */}
        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRINCIPLES.map((item) => (
                <div key={item.title} className="rounded-[24px] bg-white border border-gray-100 p-7 md:p-8 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[19px] font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. TRUST MICRO-SECTION */}
        <section className="px-4 sm:px-6 mt-20 md:mt-28">
           <div className="max-w-[900px] mx-auto rounded-[32px] bg-white border border-gray-200 p-8 md:p-14 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              
              <h2 className="text-[28px] md:text-[36px] font-black text-gray-900 tracking-tight mb-10 relative z-10">How we keep it real</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 relative z-10">
                {[
                  "No recorded lecture dumping",
                  "No fake completion certificates",
                  "No inflated promises",
                ].map((rule, idx) => (
                   <div key={idx} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-400 mb-4">
                        <span className="text-sm font-bold">{idx + 1}</span>
                      </div>
                      <span className="text-[14px] md:text-[15px] font-bold text-gray-700 leading-snug">{rule}</span>
                   </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-green-50 border border-green-100 relative z-10">
                 <ShieldCheck className="w-5 h-5 text-green-600" />
                 <span className="text-[15px] font-bold text-green-800">Everything is tied to actual work done.</span>
              </div>
           </div>
        </section>

      </main>
      
      <StickyMobileCTA />
      <Footer />
    </div>
  );
}
