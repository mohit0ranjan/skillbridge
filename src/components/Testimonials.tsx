"use client";

import { motion } from "framer-motion";
import { Quote, School2, GraduationCap, ShieldCheck } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Nishant Raj Jha",
    initials: "NJ",
    college: "PTU Jalandhar",
    year: "B.Tech 2nd Year",
    quote:
      "Before joining SkillBridge, I only had certificates with no real work to show. Here, I built actual projects that I can put on my resume and explain confidently.",
  },
  {
    name: "Aryan Dev",
    initials: "AD",
    college: "Bhoomi Engineering College",
    year: "B.Tech 1st Year",
    quote:
      "I didn’t expect to work on real projects this early in my college. The collaboration and mentorship helped me understand how real development actually works.",
  },
  {
    name: "Navneet Kumar",
    initials: "NK",
    college: "Amity University",
    year: "B.Tech 3rd Year",
    quote:
      "SkillBridge helped me move from theory to practical work. Now I have deployed projects and better confidence while applying for internships.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 bg-[#fafaf8] overflow-hidden" id="testimonials">
      <div className="max-w-[1180px] mx-auto relative">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-10 w-72 h-72 bg-brand/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-brand/5 blur-3xl rounded-full pointer-events-none" />

        {/* Section Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-10%" }}
           transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
           className="text-center max-w-2xl mx-auto mb-16 md:mb-20 relative z-10"
        >
          <div className="section-label justify-center">💬 What Students Say</div>
          <h2 className="mt-5 text-3xl md:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
            Real students. Real work. Real outcomes.
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: index * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col justify-between rounded-[24px] border border-neutral-200/80 bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1.5 hover:border-brand/30 transition-all duration-300"
            >
              <div>
                <Quote className="w-8 h-8 text-brand/30 mb-6 group-hover:text-brand transition-colors duration-300" />
                <p className="text-[16px] text-foreground font-medium leading-relaxed mb-8">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>
              
              <div className="pt-6 border-t border-neutral-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand/20 flex items-center justify-center text-brand-dark text-[15px] font-bold shrink-0">
                  {item.initials}
                </div>
                <div>
                  <p className="text-[16px] font-bold text-foreground">
                    {item.name}
                  </p>
                  <p className="text-[12px] md:text-[13px] text-muted flex items-center gap-1.5 mt-0.5">
                    <School2 className="w-3.5 h-3.5" /> {item.college}
                  </p>
                  <p className="text-[11px] md:text-[12px] font-semibold text-brand-dark flex items-center gap-1 mt-1">
                    <GraduationCap className="w-3.5 h-3.5" /> {item.year}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 md:mt-20 flex justify-center relative z-10"
        >
           <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-brand-surface border border-brand-border/60">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <span className="text-[14px] md:text-[15px] font-bold text-brand-dark">
                Focused on real work, not just certificates.
              </span>
           </div>
        </motion.div>

      </div>
    </section>
  );
}
