"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, BadgeIndianRupee, ChevronDown, Star, Shield, Zap, FileText, Cpu, Code2, LineChart, Database } from "lucide-react";
import { getInternshipById, faqs, reviews } from "@/lib/skillo-data";
import { use } from "react";

const iconMap: Record<string, any> = {
  Cpu: Cpu,
  Code2: Code2,
  LineChart: LineChart,
  Database: Database,
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function InternshipDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const internship = getInternshipById(id);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!internship) {
    notFound();
  }

  const weeks = [...new Set(internship.weeklyTasks.map((t) => t.week))];
  const IconComponent = iconMap[internship.iconName] || Code2;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/programs" className="w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-700">
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-[14px] font-semibold text-gray-900 leading-none">{internship.title}</h1>
                <p className="text-[12px] text-gray-500 mt-1">{internship.domain}</p>
              </div>
            </div>
          </div>
          <Link
            href={`/apply?internship=${internship.id}`}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-[13px] font-medium rounded-[6px] transition-colors"
          >
            Enroll in Program
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left content */}
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="rounded-[12px] p-8 md:p-10 bg-white border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className="w-16 h-16 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-[28px] md:text-[32px] font-semibold text-gray-900 tracking-tight leading-tight mb-3">
                    {internship.title} Program
                  </h2>
                  <p className="text-[15px] text-gray-600 leading-relaxed max-w-2xl">
                    {internship.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-gray-50 text-[13px] font-medium border border-gray-200 text-gray-700">
                  <Clock3 className="w-4 h-4 text-gray-500" /> Duration: {internship.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-gray-50 text-[13px] font-medium border border-gray-200 text-gray-700">
                  <FileText className="w-4 h-4 text-gray-500" /> {internship.level}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-gray-50 text-[13px] font-medium border border-gray-200 text-gray-700">
                  <BadgeIndianRupee className="w-4 h-4 text-gray-500" /> Fee: ₹{internship.price / 100}
                </span>
              </div>
            </div>

            {/* Curriculum */}
            <div className="rounded-[12px] bg-white border border-gray-200 p-8">
              <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight mb-6 pb-4 border-b border-gray-100">
                Program Curriculum
              </h3>
              {weeks.map((week) => (
                <div key={week} className="mb-8 last:mb-0">
                  <h4 className="text-[12px] uppercase tracking-wider text-gray-500 font-semibold mb-4 px-2">Module {week}</h4>
                  <div className="space-y-3">
                    {internship.weeklyTasks
                      .filter((t) => t.week === week)
                      .map((task, ti) => (
                        <div
                          key={ti}
                          className="flex items-start gap-4 p-5 rounded-[8px] border border-gray-200 bg-gray-50"
                        >
                          <div className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-700 flex items-center justify-center shrink-0 text-[13px] font-semibold">
                            {ti + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-gray-900">{task.title}</p>
                            <p className="text-[13px] text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide border border-gray-300 px-2 py-0.5 rounded-[4px] bg-white">
                                {task.type}
                              </span>
                              <span className="text-[12px] text-gray-500 flex items-center gap-1">
                                <Clock3 className="w-3.5 h-3.5" /> {task.estimatedTime} est.
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <div className="rounded-[12px] bg-white border border-gray-200 px-8 py-6">
              <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight mb-4 pb-4 border-b border-gray-100">
                Frequently Asked Questions
              </h3>
              <div className="divide-y divide-gray-100">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-2">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-3 text-left focus:outline-none"
                    >
                      <span className="text-[14px] font-medium text-gray-900">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && (
                      <div className="pb-4">
                        <p className="text-[14px] text-gray-600 leading-relaxed pr-8">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Endorsements */}
            <div className="rounded-[12px] bg-white border border-gray-200 p-8">
              <h3 className="text-[18px] font-semibold text-gray-900 tracking-tight mb-6 pb-4 border-b border-gray-100">
                Student Experiences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, 2).map((r, i) => (
                  <div key={i} className="p-5 rounded-[8px] bg-gray-50 border border-gray-200">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-gray-900 text-gray-900" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <p className="text-[13px] text-gray-700 leading-relaxed min-h-[60px]">&ldquo;{r.text}&rdquo;</p>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{r.name}</p>
                        <p className="text-[11px] text-gray-500">{r.college}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sticky sidebar */}
          <div className="lg:sticky lg:top-[88px] h-fit space-y-5">
             <div className="rounded-[12px] bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-[12px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Program Investment</p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-[36px] font-semibold text-gray-900 tracking-tight">₹{internship.price / 100}</p>
              </div>
              <p className="text-[13px] text-gray-600 mb-6">One-time payment. Inclusive of taxes.</p>

              <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
                {internship.includes.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-[13px] text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/apply?internship=${internship.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-[6px] transition-colors text-[14px]"
              >
                Enroll Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-[12px] bg-white border border-gray-200 p-5 space-y-4">
              {[
                { icon: Shield, title: "Money-Back Guarantee", desc: "Full refund within 7 days." },
                { icon: Zap, title: "Immediate Access", desc: "Begin training instantly." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <item.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
