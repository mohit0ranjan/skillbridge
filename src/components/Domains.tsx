"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  Layers3,
  BadgeIndianRupee,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";

const DOMAINS = [
  {
    title: "Power BI Data Analyst Internship",
    duration: "4 Weeks",
    price: "₹349",
    originalPrice: "₹499",
    level: "Beginner Friendly",
    skills: ["Power BI", "DAX", "Dashboarding"],
    tasks: ["Build KPI dashboard", "Publish executive report"],
    tag: "Popular",
    seats: "8 seats left",
    rating: 4.8,
    reviews: 128,
  },
  {
    title: "Tableau Visionary Internship",
    duration: "4 Weeks",
    price: "₹349",
    originalPrice: "₹499",
    level: "Beginner Friendly",
    skills: ["Tableau", "Storyboards", "Business Insights"],
    tasks: ["Create interactive dashboard", "Present business story"],
    tag: "Trending",
    seats: "3 seats left",
    rating: 4.9,
    reviews: 412,
  },
  {
    title: "Data Science with Python Internship",
    duration: "4 Weeks",
    price: "₹349",
    originalPrice: "₹499",
    level: "Beginner Friendly",
    skills: ["Python", "Pandas", "ML"],
    tasks: ["Build churn model", "Deploy prediction API"],
    tag: "Popular",
    seats: "5 seats left",
    rating: 4.7,
    reviews: 89,
  },
  {
    title: "Data Science with R Master Internship",
    duration: "4 Weeks",
    price: "₹349",
    originalPrice: "₹499",
    level: "Intermediate",
    skills: ["R", "ggplot2", "Forecasting"],
    tasks: ["Build forecasting model", "Create analytics report"],
    tag: "New Program",
    seats: "6 seats left",
    rating: 4.8,
    reviews: 156,
  },
  {
    title: "Business Analytics with R Internship",
    duration: "4 Weeks",
    price: "₹349",
    originalPrice: "₹499",
    level: "Beginner Friendly",
    skills: ["R", "KPI Analysis", "Business Reporting"],
    tasks: ["Analyze business KPIs", "Build executive dashboard"],
    tag: "Trending",
    seats: "7 seats left",
    rating: 4.8,
    reviews: 173,
  },
];

export default function Domains() {
  return (
    <section className="py-20 px-6 bg-white" id="programs">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">
          <div>
            <div className="section-label">Internship Programs</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Choose Your Internship
            </h2>
            <p className="mt-3 text-[15px] text-gray-500 leading-relaxed max-w-xl">
              Beginner-friendly internships with simple tasks, short duration,
              and clear outcomes.
            </p>
          </div>
          <Link
            href="/programs"
            className="text-[13px] font-medium text-green-600 hover:underline shrink-0"
          >
            View all internships →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {DOMAINS.map((domain, i) => (
            <motion.div
              key={domain.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-5 md:p-6 group relative hover:-translate-y-1 flex flex-col h-full"
            >
              {/* Top accent bar + Urgency Tag */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[24px] bg-gradient-to-r from-emerald-500 to-green-500" />

              {/* Header — Icon + Tag + Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center">
                  <Layers3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                
                {/* Urgency/Status Tag */}
                <div className="flex items-center gap-1.5">
                  {domain.tag === "Popular" && (
                    <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-600 text-white flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Popular
                    </div>
                  )}
                  {domain.tag === "Trending" && (
                    <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white flex items-center gap-1">
                      📈 Trending
                    </div>
                  )}
                  {domain.tag === "New Program" && (
                    <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white">
                      ✨ New
                    </div>
                  )}
                </div>
              </div>

              {/* Title — Compact */}
              <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 mb-3 leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
                {domain.title}
              </h3>

              {/* Rating + Reviews (Trust Signal) */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-semibold text-gray-700">{domain.rating}</span>
                <span className="text-[12px] text-gray-400">({domain.reviews})</span>
              </div>

              {/* Duration + Price on same line (compact) */}
              <div className="flex items-center justify-between mb-3 text-[13px]">
                <div className="flex items-center gap-1 text-gray-500">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {domain.duration}
                </div>
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  {domain.price}
                  <span className="text-[11px] text-gray-400 line-through font-normal">
                    {domain.originalPrice}
                  </span>
                </div>
              </div>

              {/* Urgency Indicator — "Limited Seats" */}
              <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[11px] font-bold text-red-700">{domain.seats}</span>
              </div>

              {/* Skills — Compact Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {domain.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium bg-green-50 text-green-700"
                  >
                    {skill}
                  </span>
                ))}
                {domain.skills.length > 2 && (
                  <span className="rounded-md px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-600">
                    +{domain.skills.length - 2} more
                  </span>
                )}
              </div>

              {/* Quick preview of tasks */}
              <div className="flex-1 mb-4 text-[12px] text-gray-600 space-y-1">
                {domain.tasks.slice(0, 2).map((task) => (
                  <div key={task} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{task}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button — Full width, sticky to bottom */}
              <Link
                href="/apply"
                className="btn-primary w-full justify-center"
              >
                Start Now — {domain.price}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
