"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  Layers3,
  BadgeIndianRupee,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const DOMAINS = [
  {
    title: "Digital Marketing Internship",
    duration: "2 Weeks",
    price: "₹99",
    level: "Beginner Friendly",
    skills: ["SEO", "Canva", "Content"],
    tasks: ["Create a campaign", "Design social posts"],
  },
  {
    title: "Web Development Internship",
    duration: "2 Weeks",
    price: "₹199",
    level: "Beginner Friendly",
    skills: ["HTML", "CSS", "Responsive UI"],
    tasks: ["Build a landing page", "Deploy your website"],
  },
  {
    title: "Data Analytics Internship",
    duration: "2 Weeks",
    price: "₹199",
    level: "Beginner Friendly",
    skills: ["Excel", "Charts", "Reporting"],
    tasks: ["Analyze dataset", "Build dashboard"],
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DOMAINS.map((domain, i) => (
            <motion.div
              key={domain.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="card p-6 group relative hover:-translate-y-1"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[24px] bg-gradient-to-r from-emerald-500 to-green-500" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center">
                  <Layers3 className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                  {domain.level}
                </div>
              </div>

              <h3 className="text-[18px] font-semibold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                {domain.title}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
                  Duration: {domain.duration}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <Layers3 className="w-4 h-4 text-gray-400 shrink-0" />
                  Level: {domain.level}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <BadgeIndianRupee className="w-4 h-4 text-gray-400 shrink-0" />
                  Price: {domain.price}
                </div>
              </div>

              {/* Tasks card */}
              <div className="mb-5 rounded-xl bg-gray-50 border border-gray-200/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400 font-semibold mb-3">
                  Tasks Included
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {domain.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full px-3 py-1 text-[12px] font-medium bg-green-50 text-green-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {domain.tasks.map((task) => (
                    <div
                      key={task}
                      className="flex items-center gap-2 text-[12px] text-gray-500"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/apply"
                className="btn-primary w-full max-w-full"
              >
                Start Internship — {domain.price}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
