"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Discord", "WhatsApp", "GitHub"];

export default function DeepLinkStyle() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("skillbridge.in/u/aarav-sharma").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden" id="profile">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[18%] w-[320px] h-[320px] rounded-full bg-[#10b981]/8 blur-[110px]" />
      </div>

      <div className="max-w-[1020px] mx-auto relative z-10 rounded-[34px] border border-white/80 bg-[linear-gradient(145deg,#fbfffd_0%,#f7fbff_100%)] p-8 md:p-10 shadow-[0_16px_36px_rgba(0,0,0,0.07)]">
        <div className="text-center max-w-xl mx-auto mb-9">
          <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-gray-400 mb-3">ONE PROFILE</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-3">
            Keep your internship links in one place
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            Share portfolio, tasks, and certificate links from a single student profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {PLATFORMS.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-full border border-gray-200/70 bg-white/80 px-3.5 py-1.5 text-[12px] text-gray-600 hover:border-[#10b981]/40 hover:text-[#0f8d61] transition-colors cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 items-stretch max-w-[780px] mx-auto">
          <div className="rounded-[20px] border border-gray-200/70 bg-white/80 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-gray-900">SkillBridge Student Profile</p>
              <span className="text-[11px] text-gray-400">Public link</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center mb-4">
              <div className="rounded-[12px] bg-white border border-gray-200 px-3 py-2 text-[12px] text-gray-500">
                skillbridge.in/u/aarav-sharma
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`rounded-[12px] text-[12px] px-4 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                  copied
                    ? "bg-[#10b981] text-white"
                    : "bg-[#111] text-white hover:bg-[#333]"
                }`}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" /> Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                )}
              </motion.button>
            </div>

            <div className="space-y-2">
              {[
                "Portfolio updated recently",
                "2 certificates verified",
                "3 projects linked",
              ].map((item) => (
                <div key={item} className="rounded-[10px] bg-[#f7faf8] border border-gray-200/70 px-3 py-2 text-[12px] text-gray-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-gray-200/70 bg-[#f7fbf9] p-4 md:p-5">
            <p className="text-[12px] uppercase tracking-[0.12em] text-gray-400 font-semibold mb-3">Share Reach</p>
            <p className="text-[34px] leading-none tracking-[-0.03em] font-semibold text-[#0f1c33] mb-1">5,000+</p>
            <p className="text-[12px] text-gray-500 mb-4">student profiles created</p>

            <div className="h-2 rounded-full bg-[#dcefe6] overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "72%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
                className="h-full rounded-full bg-[#10b981]"
              />
            </div>
            <p className="text-[12px] text-[#0f8d61]">Profile visibility strong</p>
          </div>
        </div>
      </div>
    </section>
  );
}
