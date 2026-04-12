"use client";

import { motion } from "framer-motion";
import { useState, type MouseEvent } from "react";
import { BadgeCheck, Shield, ScanLine, X, ExternalLink } from "lucide-react";
import Image from "next/image";
import styles from "@/app/certificate/[id]/certificate.module.css";

const SAMPLE = {
  studentName: "John Doe",
  internship: "Sample Internship Program",
  duration: "4 Weeks",
  issueDate: "12 April 2026",
  certificateId: "SB-XXXX-0000",
};

export default function CertificateShowcase() {
  const [showModal, setShowModal] = useState(false);

  const blockContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  return (
    <>
      <section className="py-20 md:py-28 px-6 relative overflow-hidden" id="certificate" onContextMenu={blockContextMenu}>
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

          {/* Certificate Preview Card — Exact Certificate Layout */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[1080px] mx-auto"
          >
            <div className="rounded-[32px] border border-gray-200 bg-gray-50/90 p-4 sm:p-6 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.22)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-800">
                  <Shield className="h-4 w-4" />
                  Sample preview only
                </div>
                <p className="text-[12px] font-medium text-gray-500">Not downloadable. Not an issued certificate.</p>
              </div>

              <div className={styles.samplePreviewViewport} onContextMenu={blockContextMenu}>
                <div className={styles.samplePreviewStage}>
                  <div className={styles.certificate}>
                    <div className={styles.borderAccent} />
                    <div className={styles.certificateId}>Certificate ID: {SAMPLE.certificateId}</div>

                    <div className={styles.header}>
                      <div className={styles.brand}>SkillBridge</div>
                      <div className={styles.subtitle}>SAMPLE CERTIFICATE</div>
                    </div>

                    <div className={styles.title}>Certificate of Completion</div>
                    <div className={styles.line} />

                    <div className={styles.content}>
                      <div className={styles.smallText}>This is a preview for display only</div>
                      <div className={styles.name}>{SAMPLE.studentName}</div>
                      <div className={styles.desc}>
                        has successfully completed the internship program in <span className={styles.highlight}>{SAMPLE.internship}</span> offered by SkillBridge.
                      </div>
                    </div>

                    <div className={styles.sampleWatermark} aria-hidden="true">
                      <span>SAMPLE CERTIFICATE</span>
                      <span>Preview Only</span>
                    </div>

                    <div className={styles.footer}>
                      <div className={styles.metaBlock}>
                        <p className={styles.durationText}>Duration: {SAMPLE.duration}</p>
                        <p className={styles.issueText}>Issue Date: {SAMPLE.issueDate}</p>
                        <div className={styles.authorityLogos}>
                          <Image src="/msme logo.png" alt="MSME" width={96} height={40} className={styles.authorityLogo} unoptimized />
                          <Image src="/skill india logo.png" alt="Skill India" width={100} height={40} className={styles.authorityLogo} unoptimized />
                        </div>
                      </div>

                      <div className={styles.signature}>
                        <Image src="/sign.png" alt="Program Director Signature" width={132} height={42} className={styles.signatureImage} unoptimized />
                        <div className={styles.signatureLine} />
                        <div className={styles.signatureText}>Program Director<br />SkillBridge Certification Authority</div>
                      </div>
                    </div>

                    <div className={styles.verify}>Verify at: skillbridge.co.in/verify-certificate?id={SAMPLE.certificateId}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  Trusted layout sample with placeholder details only
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2 text-[12px] font-semibold text-white transition-all hover:bg-green-700 cursor-pointer"
                >
                  View Full Sample
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Trust points below certificate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 grid gap-3 text-[13px] font-medium text-gray-500 sm:grid-cols-3 max-w-[780px] mx-auto"
          >
            <span className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-center shadow-sm">
              <BadgeCheck className="w-4 h-4 text-green-500" />
              Issued by SkillBridge
            </span>
            <span className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-center shadow-sm">
              <ScanLine className="w-4 h-4 text-green-500" />
              Online verifiable
            </span>
            <span className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-center shadow-sm">
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
          onContextMenu={blockContextMenu}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="cert-modal-content"
            onClick={(e) => e.stopPropagation()}
            onContextMenu={blockContextMenu}
          >
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Full Certificate (matches actual page) */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-auto p-4 md:p-6">
              <div className={styles.certificate}>
                <div className={styles.borderAccent} />
                <div className={styles.certificateId}>Certificate ID: {SAMPLE.certificateId}</div>

                <div className={styles.header}>
                  <div className={styles.brand}>SkillBridge</div>
                  <div className={styles.subtitle}>INTERNSHIP CERTIFICATE</div>
                </div>

                <div className={styles.title}>Certificate of Completion</div>
                <div className={styles.line} />

                <div className={styles.content}>
                  <div className={styles.smallText}>This is a preview for display only</div>
                  <div className={styles.name}>{SAMPLE.studentName}</div>
                  <div className={styles.desc}>
                    has successfully completed the internship program in <span className={styles.highlight}>{SAMPLE.internship}</span> offered by SkillBridge.
                  </div>
                </div>

                <div className={styles.sampleWatermark} aria-hidden="true">
                  <span>SAMPLE CERTIFICATE</span>
                  <span>Preview Only</span>
                </div>

                <div className={styles.footer}>
                  <div className={styles.metaBlock}>
                    <p className={styles.durationText}>Duration: {SAMPLE.duration}</p>
                    <p className={styles.issueText}>Issue Date: {SAMPLE.issueDate}</p>
                    <div className={styles.authorityLogos}>
                      <Image src="/msme logo.png" alt="MSME" width={96} height={40} className={styles.authorityLogo} unoptimized />
                      <Image src="/skill india logo.png" alt="Skill India" width={100} height={40} className={styles.authorityLogo} unoptimized />
                    </div>
                  </div>

                  <div className={styles.signature}>
                    <Image src="/sign.png" alt="Program Director Signature" width={132} height={42} className={styles.signatureImage} unoptimized />
                    <div className={styles.signatureLine} />
                    <div className={styles.signatureText}>Program Director<br />SkillBridge Certification Authority</div>
                  </div>
                </div>

                <div className={styles.verify}>Verify at: skillbridge.co.in/verify-certificate?id={SAMPLE.certificateId}</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
