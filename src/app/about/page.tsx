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
  Sparkles,
  Target,
  Users,
  Users2,
} from "lucide-react";

const PRINCIPLES = [
  {
    icon: Target,
    title: "Mission",
    desc: "Give every student a short, practical path into real work so they can build proof before placements begin.",
  },
  {
    icon: Rocket,
    title: "Approach",
    desc: "Replace long lectures and theory-heavy courses with guided tasks, real deliverables, and immediate momentum.",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    desc: "Every completed program ends with a certificate and a unique ID that can be shared on resumes and LinkedIn.",
  },
  {
    icon: Users2,
    title: "Audience",
    desc: "Built for first-, second-, and third-year college students who want to start early and stay competitive.",
  },
];

const FEATURE_CARDS = [
  {
    icon: Layers3,
    title: "Guided tasks",
    desc: "Small, structured tasks that feel like real internship work instead of passive content consumption.",
  },
  {
    icon: Briefcase,
    title: "Portfolio output",
    desc: "Projects you can actually show to recruiters, mentors, and your network.",
  },
  {
    icon: Award,
    title: "Verified certificate",
    desc: "A shareable certificate tied to actual completion, not just attendance.",
  },
  {
    icon: Sparkles,
    title: "Beginner friendly",
    desc: "No interviews, no long waitlists, and no prior experience required to begin.",
  },
];

const JOURNEY = [
  {
    num: "01",
    title: "Choose a program",
    desc: "Pick from beginner-friendly domains such as web development, UI/UX, data analytics, and more.",
  },
  {
    num: "02",
    title: "Start immediately",
    desc: "Join quickly, get access fast, and begin working without the friction of a traditional hiring process.",
  },
  {
    num: "03",
    title: "Complete tasks",
    desc: "Follow a clear task flow, submit work consistently, and build confidence through execution.",
  },
  {
    num: "04",
    title: "Earn verified proof",
    desc: "Finish the program and receive a certificate you can use across resumes, LinkedIn, and applications.",
  },
];

const PROOF_POINTS = [
  { value: "5,000+", label: "students started" },
  { value: "100+", label: "tasks completed weekly" },
  { value: "10+", label: "career domains" },
  { value: "50+", label: "colleges represented" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen font-sans bg-[#fafaf8]">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-20 overflow-hidden">
        <section className="px-4 sm:px-6">
          <div className="max-w-[1180px] mx-auto relative">
            <div className="absolute -top-12 right-0 h-56 w-56 rounded-full bg-green-100/30 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start relative z-10">
              <div className="max-w-[700px]">
                <div className="section-label">About SkillBridge</div>
                <h1 className="text-[3rem] sm:text-[3.6rem] md:text-[4.3rem] font-extrabold tracking-[-0.04em] leading-[0.98] text-gray-900 mb-6">
                  The shortest path from student to proof of work.
                </h1>
                <p className="text-[16px] md:text-[18px] text-gray-500 leading-[1.8] max-w-[620px]">
                  SkillBridge is a virtual internship platform designed by IIT and NIT alumni to help college students start early, work on real tasks, and earn verified certificates without interviews, referrals, or long delays.
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

                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROOF_POINTS.map((point) => (
                    <div key={point.label} className="rounded-2xl bg-white border border-gray-100 px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                      <div className="text-[22px] font-extrabold text-gray-900 tracking-[-0.03em]">{point.value}</div>
                      <div className="text-[12px] text-gray-500 mt-1 leading-tight capitalize">{point.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-[28px] border border-gray-200/70 bg-white p-6 md:p-8 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
                <div className="relative z-10 flex items-start justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-green-600 mb-2">Built for action</p>
                    <h2 className="text-[28px] font-extrabold text-gray-900 leading-tight">Start now. Learn by doing.</h2>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  {[
                    "No interviews",
                    "Guided tasks",
                    "Real projects",
                    "Verified certificate",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 border border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-[14px] font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 mt-6 rounded-3xl border border-gray-100 bg-[#fbfbfa] px-5 py-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">Recognition</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Image src="/msme logo.png" alt="MSME" width={90} height={40} className="h-9 w-auto object-contain" unoptimized />
                    <Image src="/skill india logo.png" alt="Skill India" width={110} height={40} className="h-9 w-auto object-contain" unoptimized />
                    <Image src="/kshitij.png" alt="Kshitij IIT Kharagpur" width={96} height={40} className="h-9 w-auto object-contain" unoptimized />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PRINCIPLES.map((item) => (
                <div key={item.title} className="rounded-[24px] bg-white border border-gray-100 p-7 md:p-8 shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 text-green-600 flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[20px] font-extrabold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto">
            <div className="flex items-end justify-between gap-6 mb-8">
              <div className="max-w-[640px]">
                <div className="section-label">What the platform includes</div>
                <h2 className="text-3xl md:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-900">
                  Everything on the site points to one outcome: a stronger profile.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURE_CARDS.map((card) => (
                <div key={card.title} className="rounded-[24px] bg-white border border-gray-100 p-6 md:p-7 shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                  <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[18px] font-extrabold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            <div>
              <div className="section-label">How it works</div>
              <h2 className="text-3xl md:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-900 mb-4">
                Short, clear, and beginner-friendly.
              </h2>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[500px]">
                The experience is intentionally short so students spend more time doing work and less time trying to understand a complicated platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {JOURNEY.map((step) => (
                <div key={step.num} className="rounded-[24px] bg-white border border-gray-100 p-6 md:p-7 shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[34px] font-extrabold text-gray-200 tracking-[-0.05em]">{step.num}</span>
                    <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <h3 className="text-[18px] font-extrabold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto card p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_45%)] pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="section-label">Traction</div>
                <h2 className="text-3xl md:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-900 mb-4">
                  The frontend already shows real proof, not just claims.
                </h2>
                <p className="text-[15px] text-gray-500 leading-relaxed max-w-[620px]">
                  The homepage, trust section, stats, testimonials, certificate preview, pricing, and how-it-works flow all work together to show a clear product narrative: start fast, do real work, and leave with verifiable evidence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                {PROOF_POINTS.slice(0, 4).map((point) => (
                  <div key={point.label} className="rounded-2xl bg-white border border-gray-100 px-4 py-5 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                    <div className="text-[22px] font-extrabold text-gray-900">{point.value}</div>
                    <div className="text-[12px] text-gray-500 mt-1">{point.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 mt-20 md:mt-24">
          <div className="max-w-[1180px] mx-auto">
            <div className="rounded-[28px] border border-gray-200 bg-white p-8 md:p-10 text-center overflow-hidden relative shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
              <div className="absolute -top-16 right-0 h-56 w-56 rounded-full bg-green-100/20 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-[700px] mx-auto">
                <div className="section-label justify-center">Next step</div>
                <h2 className="text-3xl md:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.05] text-gray-900 mb-4">
                  Start with a program, finish with something real.
                </h2>
                <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                  If you want the shortest honest summary of the site: it helps students begin quickly, work on practical tasks, and prove what they can do.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/programs" className="btn-primary btn-lg group inline-flex">
                    Explore Internships
                    <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/contact" className="btn-secondary btn-lg inline-flex">
                    Talk to the Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
