"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Search,
  SlidersHorizontal,
  Cpu,
  Code2,
  LineChart,
  Database,
} from "lucide-react";
import { internships } from "@/lib/skillo-data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FILTERS = ["All", "Beginner", "2 Weeks", "4 Weeks"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu: Cpu,
  Code2: Code2,
  LineChart: LineChart,
  Database: Database,
};

export default function ProgramsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = internships.filter((i) => {
    if (
      search &&
      !i.title.toLowerCase().includes(search.toLowerCase()) &&
      !i.domain.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filter === "Beginner") return i.level === "Beginner Friendly";
    if (filter === "2 Weeks") return i.duration === "2 Weeks";
    if (filter === "4 Weeks") return i.duration === "4 Weeks";
    return true;
  });

  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="mb-10 max-w-2xl">
          <div className="section-label">Programs</div>
          <h1 className="text-[32px] md:text-[40px] font-bold text-gray-900 tracking-tight leading-[1.1] mb-4">
            Available Internships
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Select a program to begin. Each provides structured tasks mirroring
            real workflows, concluding with a verified certification.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white flex-1 max-w-[340px] focus-within:border-green-500 transition-colors shadow-sm">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-2" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border cursor-pointer ${
                  filter === f
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((internship) => {
            const IconComponent = iconMap[internship.iconName] || Code2;

            return (
              <Link
                key={internship.id}
                href={`/programs/${internship.id}`}
                className="group block rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-600">
                    {internship.domain}
                  </div>
                </div>

                <h3 className="text-[16px] font-semibold text-gray-900 tracking-tight mb-2">
                  {internship.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                  {internship.description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                    <Clock3 className="w-3.5 h-3.5 text-gray-400" />
                    {internship.duration}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500">
                    <div className="w-3.5 h-3.5 rounded border border-gray-400 bg-gray-50 flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-sm" />
                    </div>
                    {internship.tasks.length} Modules
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-[16px] font-semibold text-gray-900">
                    ₹{internship.price / 100}
                  </p>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-600 group-hover:underline transition-all">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-white">
            <p className="text-[14px] text-gray-500 font-medium">
              No programs match the selected criteria.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
