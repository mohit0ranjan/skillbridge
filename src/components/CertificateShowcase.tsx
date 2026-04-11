"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BadgeCheck, Shield, ScanLine, X, ArrowRight, Award, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CertificateShowcase() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="py-20 md:py-28 px-6 relative overflow-hidden" id="certificate">
        {/* Soft background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-green-50/20 to-white pointer-events-none" />

        <div className="max-w-[1100px] mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 max-w-[640px] mx-auto"
          >
            <div className="section-label justify-center">Certificate</div>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-gray-900 tracking-[-0.02em] leading-[1.08]">
              Earn a certificate you can
              <br />
              <span className="text-green-600">actually show</span>
            </h2>
            <p className="mt-5 text-[15px] text-gray-500 leading-relaxed max-w-[480px] mx-auto">
              After submitting your final project, receive a certificate with a unique verification ID that recruiters and colleges can validate online.
            </p>
          </motion.div>

          {/* Certificate Preview Card — Premium Document Style */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[720px] mx-auto"
          >
            <div className="relative rounded-3xl bg-white border border-gray-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] overflow-hidden group hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.12)] transition-all duration-500">
              {/* Green top band */}
              <div className="h-2 bg-gradient-to-r from-green-500 via-green-400 to-emerald-500" />

              <div className="p-8 md:p-10">
                {/* Certificate Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="10" fill="url(#cert-grad)" />
                      <path d="M9 24Q20 10 31 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <rect x="10.5" y="23" width="2.8" height="8" rx="1" fill="#fff" />
                      <rect x="26.7" y="23" width="2.8" height="8" rx="1" fill="#fff" />
                      <line x1="9" y1="27" x2="31" y2="27" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
                      <defs>
                        <linearGradient id="cert-grad" x1="0" y1="0" x2="40" y2="40">
                          <stop stopColor="#22c55e" /><stop offset="1" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div>
                      <p className="text-[18px] font-bold text-gray-900">
                        Skill<span className="text-green-600">Bridge</span>
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Certificate of Internship</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1.5 text-[12px] font-bold text-green-700">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </div>
                </div>

                {/* Decorative line */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

                {/* Awarded to */}
                <div className="text-center mb-8">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-2">
                    This is to certify that
                  </p>
                  <p className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Georgia, Times, serif' }}>
                    Meera Patel
                  </p>
                  <p className="mt-2 text-[14px] text-gray-500 max-w-[400px] mx-auto">
                    has successfully completed the virtual internship program and demonstrated proficiency in the assigned domain.
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {[
                    { label: "Program", value: "Digital Marketing" },
                    { label: "Duration", value: "2 Weeks" },
                    { label: "Issued On", value: "8 April 2026" },
                    { label: "Certificate ID", value: "SB-2026-4519" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3.5 text-center">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold mb-1">{item.label}</p>
                      <p className="text-[13px] font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Decorative line */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

                {/* Bottom — verification + action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[12px] text-gray-400">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Verify at <span className="font-semibold text-gray-600">skillbridge.in/verify-certificate</span></span>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(22,163,74,0.25)] hover:shadow-[0_8px_20px_rgba(22,163,74,0.30)] transition-all cursor-pointer"
                  >
                    View Full Sample
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trust points below certificate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[13px] font-medium text-gray-500"
          >
            <span className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-green-500" />
              Issued by SkillBridge
            </span>
            <span className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-green-500" />
              Online verifiable
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Unique ID per student
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── Full Certificate Modal ─── */}
      {showModal && (
        <div
          className="cert-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="cert-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Full Premium Certificate */}
            <div className="rounded-2xl border-2 border-green-100 bg-white overflow-hidden">
              {/* Green band */}
              <div className="h-3 bg-gradient-to-r from-green-500 via-green-400 to-emerald-500" />

              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="10" fill="url(#modal-grad)" />
                      <path d="M9 24Q20 10 31 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      <rect x="10.5" y="23" width="2.8" height="8" rx="1" fill="#fff" />
                      <rect x="26.7" y="23" width="2.8" height="8" rx="1" fill="#fff" />
                      <line x1="9" y1="27" x2="31" y2="27" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
                      <defs>
                        <linearGradient id="modal-grad" x1="0" y1="0" x2="40" y2="40">
                          <stop stopColor="#22c55e" /><stop offset="1" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-[22px] font-bold text-gray-900">
                      Skill<span className="text-green-600">Bridge</span>
                    </span>
                  </div>
                  <h2 className="text-[30px] md:text-[34px] font-bold text-gray-900 tracking-tight">
                    Certificate of Internship
                  </h2>
                  <p className="text-[14px] text-gray-400 mt-2 max-w-[400px] mx-auto">
                    This certifies that the following individual has successfully completed the virtual internship program
                  </p>
                </div>

                {/* Decorative separator */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-green-200" />
                  <Award className="w-5 h-5 text-green-400" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-green-200" />
                </div>

                {/* Awarded to */}
                <div className="text-center mb-10">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mb-2">
                    Awarded To
                  </p>
                  <p className="text-[36px] md:text-[42px] font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Georgia, Times, serif' }}>
                    Meera Patel
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 max-w-[460px] mx-auto mb-10">
                  {[
                    { label: "Program", value: "Digital Marketing" },
                    { label: "Duration", value: "2 Weeks" },
                    { label: "Issued On", value: "8 April 2026" },
                    { label: "Certificate ID", value: "SB-2026-4519" },
                  ].map((item) => (
                    <div key={item.label} className="text-center rounded-xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold mb-1">{item.label}</p>
                      <p className="text-[15px] font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Decorative separator */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-green-200" />
                  <Award className="w-5 h-5 text-green-400" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-green-200" />
                </div>

                {/* Verification */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-100 px-5 py-2.5 text-[13px] font-bold text-green-700">
                    <BadgeCheck className="w-4 h-4" />
                    Verified Certificate
                  </div>
                  <p className="mt-3 text-[12px] text-gray-400">
                    Verify at skillbridge.in/verify · ID: SB-2026-4519
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
