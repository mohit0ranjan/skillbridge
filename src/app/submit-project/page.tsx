"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Loader2, RefreshCw, ShieldCheck, Upload } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

export default function SubmitProjectPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setData(await api.getDashboard());
    } catch {
      setError("We could not load your submission page.");
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

  useEffect(() => {
    if (enrollment && !projectTitle) {
      setProjectTitle(`${enrollment.internship} final project`);
    }
  }, [enrollment, projectTitle]);

  const handleSubmit = async () => {
    if (!enrollment) return;
    if (!projectTitle.trim() || !projectLink.trim() || !description.trim()) {
      setError("Please complete the required fields before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const result = await api.submitProject({
        internshipId: enrollment.internshipId,
        projectTitle: projectTitle.trim(),
        projectLink: projectLink.trim(),
        description: description.trim(),
        fileUrl: fileName || undefined,
      });
      setSuccess(result);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || "Project submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      variant="student"
      title="Submit final project"
      subtitle="One submission unlocks the review process and eventually the certificate"
      actions={<Link href="/workspace" className="btn-secondary btn-sm">Back to workspace</Link>}
    >
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center rounded-3xl border border-gray-200 bg-white shadow-sm"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary btn-sm mt-4 inline-flex gap-2"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      ) : !enrollment ? (
        <div className="grid place-items-center rounded-[32px] border border-gray-200 bg-white p-10 text-center shadow-sm">
          <FileText className="h-10 w-10 text-gray-400" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">No active program</h2>
          <p className="mt-2 text-sm text-gray-500">Enroll in a program first, then come back to submit your final project.</p>
          <Link href="/apply" className="btn-primary btn-lg mt-6 inline-flex gap-2">Browse programs <ArrowRight className="h-5 w-5" /></Link>
        </div>
      ) : success ? (
        <div className="grid gap-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex rounded-2xl border border-green-100 bg-green-50 p-4 text-green-700"><CheckCircle2 className="h-8 w-8" /></div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900">Submission received</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">Your final project is now in the approval queue. Once the admin approves it, your certificate will appear in the certificate center.</p>
            <p className="mt-2 text-sm text-gray-600">Approval timeline: usually within 24 hours.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary btn-lg inline-flex gap-2">Go to dashboard</Link>
              <Link href="/certificate" className="btn-secondary btn-lg inline-flex gap-2"><ShieldCheck className="h-5 w-5" /> Certificate center</Link>
            </div>
          </div>
          <div className="space-y-3 rounded-[32px] border border-gray-200 bg-gray-50 p-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Project</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{success.submission?.projectTitle}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Review status</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Pending approval</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Certificate</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">Generated after approval</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className="section-label mb-3">Final project</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Submit a clean project for approval</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Use a clear title, a live link, and a concise description. After submission, the admin team reviews it before certificate generation.</p>
              </div>
              <div className="rounded-3xl border border-green-100 bg-green-50 p-4 text-green-700"><FileText className="h-7 w-7" /></div>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Project title</span>
                <input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="input-base" placeholder="Portfolio redesign" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Project link</span>
                <input value={projectLink} onChange={(event) => setProjectLink(event.target.value)} className="input-base" placeholder="https://github.com/..." />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Description</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="input-base min-h-[150px] resize-y" placeholder="Summarize what you built, what decisions you made, and what outcome the project produced." />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-900">Supporting file</span>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gray-700" />
                </div>
              </label>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button onClick={handleSubmit} disabled={submitting} className="btn-primary btn-lg w-full inline-flex justify-center gap-2">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {submitting ? "Submitting..." : "Submit final project"}
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Submission summary</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Program</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{enrollment.internship}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Current status</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{submission ? submission.status : "Not submitted"}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Certificate</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{certificate ? certificate.certificateId : "Issued after approval"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">What happens next</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">1. We store your submission</p>
                  <p className="mt-1 text-sm text-gray-500">The project enters the review queue immediately.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">2. Admin approves or rejects</p>
                  <p className="mt-1 text-sm text-gray-500">Feedback can be added to guide revisions. Typical review time is within 24 hours.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">3. Certificate is generated</p>
                  <p className="mt-1 text-sm text-gray-500">You’ll see it in the certificate center after approval.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
