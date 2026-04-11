import Link from "next/link";
import { BadgeCheck, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./certificate.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getRealCertificate(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/certificate/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export default async function CertificateViewPage({ params }: PageProps) {
  const { id } = await params;
  const certificate = await getRealCertificate(id);

  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <main className="max-w-[920px] mx-auto px-6 pt-32 pb-16 text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold mb-3">Certificate Lookup</p>
            <h1 className="text-3xl font-bold text-gray-900">Certificate not found</h1>
            <p className="text-gray-500 mt-3 max-w-[520px] mx-auto">
              We could not find a certificate with ID <span className="font-semibold text-gray-700">{id}</span>. Please check the link and try again.
            </p>
            <Link
              href="/verify-certificate"
              className="inline-flex mt-6 rounded-xl border border-gray-200 bg-[#10b981] px-5 py-2.5 text-sm text-white font-semibold hover:bg-[#059669] transition-colors"
            >
              Verify another certificate
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const downloadPdfUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/certificate/${certificate.certificateId}/pdf`;
  const issueDate = new Date(certificate.issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${styles.certificatePage}`}>
      <Navbar />

      <main className="max-w-[1560px] mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_392px] gap-10 items-start">
          <section className={styles.certificateFrameWrap}>
            <div className={styles.certificate}>
              <div className={styles.borderAccent} />

              <div className={styles.certificateId}>Certificate ID: {certificate.certificateId}</div>

              <div className={styles.header}>
                <div className={styles.brand}>SkillBridge</div>
                <div className={styles.subtitle}>INTERNSHIP CERTIFICATE</div>
              </div>

              <div className={styles.title}>Certificate of Completion</div>
              <div className={styles.line} />

              <div className={styles.content}>
                <div className={styles.smallText}>This is to certify that</div>

                <div className={styles.name}>{certificate.studentName}</div>

                <div className={styles.desc}>
                  has successfully completed the internship program in <span className={styles.highlight}>{certificate.internship}</span> offered by SkillBridge.
                </div>
              </div>

              <div className={styles.sealWatermark} aria-hidden="true">
                SKILLBRIDGE
              </div>

              <div className={styles.footer}>
                <div className={styles.signature}>
                  <div className={styles.signatureLine} />
                  <div className={styles.signatureText}>Program Director<br />SkillBridge</div>
                </div>

                <div className={styles.details}>
                  Issue Date: {issueDate}
                </div>
              </div>

              <div className={styles.verify}>
                Verify at: skillbridge.in/verify-certificate?id={certificate.certificateId}
              </div>
            </div>
          </section>

          <aside className="w-full max-w-[392px] mx-auto xl:max-w-none xl:sticky xl:top-28 rounded-[20px] border border-gray-200 bg-white overflow-hidden shadow-[0_14px_32px_rgba(15,23,42,0.08)] xl:mt-1">
            <div className="bg-gradient-to-br from-emerald-50 to-white px-6 py-6 border-b border-emerald-100/70">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700 mb-2 font-semibold">Verification Status</p>
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-emerald-700 font-semibold text-xl leading-tight">Verified Authenticity</p>
                  <p className="text-sm text-emerald-700/75 mt-1 leading-relaxed">
                    Public record matches the issued certificate.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Student</p>
                <p className="mt-1 text-base font-semibold text-gray-900 leading-snug">{certificate.studentName}</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Issued for the internship completion record shown on the left.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">College</p>
                  <p className="mt-1 text-sm text-gray-700 leading-snug">{certificate.college || 'Not provided'}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Issue Date</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 leading-snug">{issueDate}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Certificate ID</p>
                <p className="mt-1 text-sm font-mono font-semibold text-gray-900 break-words leading-snug">{certificate.certificateId}</p>
              </div>

              <a
                href={downloadPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-2xl bg-[#10b981] px-5 py-4 text-sm text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors cursor-pointer shadow-[0_12px_20px_rgba(16,185,129,0.24)]"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>

              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-semibold">Need another check?</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Use the public verifier to confirm the certificate again or compare details instantly.
                </p>
              </div>

              <Link href="/verify-certificate" className="inline-flex text-sm text-green-600 font-semibold hover:underline">
                Verify another certificate
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}