"use client";

import { motion } from "framer-motion";
import { Quote, School2 } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Riya Sharma",
    initials: "RS",
    college: "BMS College of Engineering",
    program: "Digital Marketing Internship",
    quote:
      "I added the certificate to my resume and got shortlisted in my next round. The tasks felt like actual work, not homework.",
  },
  {
    name: "Arjun Patel",
    initials: "AP",
    college: "Christ University",
    program: "Web Development Internship",
    quote:
      "The tasks were simple, but it felt like real work. That made it easy to stay consistent. Finished in 10 days.",
  },
  {
    name: "Sneha Iyer",
    initials: "SI",
    college: "SRM Institute of Science and Technology",
    program: "Data Analytics Internship",
    quote:
      "It was the first time I had something real to show on LinkedIn. My profile went from empty to credible.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-6" id="testimonials">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="section-label justify-center">Student Stories</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Real students, real outcomes
          </h2>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            Hear from students who completed their internships and improved
            their profiles.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-5 h-5 text-green-500 mb-4" />
              <p className="text-[14px] text-gray-600 leading-relaxed mb-2">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-[11px] text-green-600 font-medium mb-5">
                {item.program}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {item.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-[12px] text-gray-500 flex items-center gap-1">
                    <School2 className="w-3.5 h-3.5" /> {item.college}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
