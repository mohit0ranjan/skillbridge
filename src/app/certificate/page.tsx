"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Loader2, ShieldCheck, Sparkles, Lock, RefreshCw } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

export default function CertificatePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setData(await api.getDashboard());
    } catch {
      setError("We could not load your certificate status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enrollment = data?.enrollments?.[0] || null;
  const submission = enrollment?.finalSubmission || null;
  const certificate = enrollment?.certificate || null;
  const canGenerate = submission?.status === "APPROVED" && !certificate;

  const certificateCard = useMemo(() => {
    if (!certificate) return null;
    return {
      id: certificate.certificateId,
      date: new Date(certificate.issuedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      program: enrollment?.internship,
      verified: certificate.isPaid,
    };
  }, [certificate, enrollment?.internship]);

  const handleGenerate = async () => {
    if (!enrollment) return;
    try {
      setGenerating(true);
      await api.generateCertificate(enrollment.internshipId);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Certificate generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell
      variant="student"
      title="Certificate center"
      subtitle="Track approval status, generate your certificate after review, and verify it publicly"
      actions={<Link href="/workspace" className="btn-secondary btn-sm">Back to workspace</Link>}
    >
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center rounded-3xl border border-gray-200 bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary btn-sm mt-4 inline-flex gap-2"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      ) : !enrollment ? (
        <div className="grid gap-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-label">Certificate center</p>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">Complete a program to unlock a verified certificate.</h2>
            <p className="mt-4 text-base leading-7 text-gray-500">Certificates are issued only after final project approval. Start by enrolling in a program and completing the weekly learning flow.</p>
            <Link href="/apply" className="btn-primary btn-lg mt-6 inline-flex gap-2">Browse internships <ArrowRight className="h-5 w-5" /></Link>
          </div>
          <div className="rounded-[32px] border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
            <ShieldCheck className="h-12 w-12 text-green-600" />
            <p className="mt-5 text-lg font-bold text-gray-900">Verification ready</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">Every certificate gets a public ID so anyone can verify it instantly.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className="section-label mb-3">Eligibility</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{enrollment.internship}</h2>
                <p className="mt-2 text-sm text-gray-500">Final project submission status determines when your certificate becomes available.</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Progress</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{enrollment.progress}%</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Submission</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{submission ? submission.status : "Not submitted"}</p>
                <p className="mt-1 text-sm text-gray-500">{submission ? submission.projectTitle : "Submit your final project first"}</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Certificate</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{certificate ? "Available" : canGenerate ? "Ready to generate" : "Locked"}</p>
                <p className="mt-1 text-sm text-gray-500">Approval is required before issuance.</p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Verification</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">Public</p>
                <p className="mt-1 text-sm text-gray-500">Anyone can verify your certificate ID.</p>
              </div>
            </div>

            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="mt-6 rounded-[28px] border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Issue flow</p>
                  <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Review-based certificate issuance</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Your final project is reviewed by the admin team. Once approved, the certificate becomes available here automatically.</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-300" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {canGenerate ? (
                  <button onClick={handleGenerate} disabled={generating} className="btn-primary btn-lg inline-flex gap-2">
                    {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    {generating ? "Generating..." : "Generate certificate"}
                  </button>
                ) : (
                  <button disabled className="btn-secondary btn-lg inline-flex gap-2 opacity-70">
                    <Lock className="h-5 w-5" /> Waiting for approval
                  </button>
                )}
                <Link href="/submit-project" className="btn-secondary btn-lg inline-flex gap-2 bg-white text-gray-900">
                  {submission ? "Review submission" : "Submit project"}
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Certificate preview</p>
              {!certificateCard ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-4 text-sm font-semibold text-gray-900">No certificate yet</p>
                  <p className="mt-1 text-sm text-gray-500">Submit and approve the final project to unlock the certificate preview.</p>
                </div>
              ) : (
                <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                  <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Certificate of completion</p>
                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">{data?.user?.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{certificateCard.program}</p>
                    </div>
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Certificate ID</p>
                    <p className="mt-2 break-all font-mono text-sm text-gray-900">{certificateCard.id}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Issued</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{certificateCard.date}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Verified</p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">{certificateCard.verified ? "Yes" : "Pending"}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => window.print()} className="btn-primary flex-1 justify-center">
                      <Download className="mr-2 h-4 w-4" /> Print
                    </button>
                    <Link href={`/verify-certificate?id=${certificateCard.id}`} className="btn-secondary flex-1 justify-center">
                      Verify
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Next steps</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">1. Submit final project</p>
                  <p className="mt-1 text-sm text-gray-500">Use the submission page for your project URL and details.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">2. Wait for admin approval</p>
                  <p className="mt-1 text-sm text-gray-500">Your certificate is generated only after review.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">3. Verify publicly</p>
                  <p className="mt-1 text-sm text-gray-500">Share the certificate ID anywhere.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
