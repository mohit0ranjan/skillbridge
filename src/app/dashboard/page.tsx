"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Loader2, RefreshCw, Sparkles, Target, ShieldCheck, Download } from "lucide-react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { api, DashboardData } from "@/lib/api";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TinyPill({ children, highlight = false }: { children: React.ReactNode, highlight?: boolean }) {
  if (highlight) {
    return <span className="rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">{children}</span>;
  }
  return <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{children}</span>;
}

export default function DashboardPage() {
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [busyWeek, setBusyWeek] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setData(await api.getDashboard());
    } catch {
      setError("We could not load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPaymentFailed(params.get("payment") === "failed");
    }

    fetchDashboard();
  }, []);

  const enrollment = data?.enrollments?.[0] || null;
  const weeks = useMemo(() => enrollment?.weeks || [], [enrollment]);
  const submission = enrollment?.finalSubmission || null;
  const certificate = enrollment?.certificate || null;
  const progress = submission ? 100 : enrollment?.progress || 0;
  const completedWeeks = enrollment?.completedWeeks || 0;
  const pendingWeeks = Math.max((enrollment?.totalWeeks || weeks.length || 0) - completedWeeks, 0);

  useEffect(() => {
    if (!openWeek && weeks.length > 0) {
      setOpenWeek(weeks[0].week);
    }
  }, [openWeek, weeks]);

  const currentWeek = useMemo(() => weeks.find((week) => week.week === openWeek) || weeks[0], [openWeek, weeks]);

  const handleMarkWeekComplete = async (weekNumber: number) => {
    if (!enrollment) return;

    try {
      setBusyWeek(weekNumber);
      await api.markWeekComplete({ internshipId: enrollment.internshipId, weekNumber });
      await fetchDashboard();
    } catch {
      setError("Week progress could not be updated.");
    } finally {
      setBusyWeek(null);
    }
  };

  const headerActions = enrollment ? (
    <div className="flex items-center gap-3">
      <Link href="/workspace" className="btn-secondary btn-sm hidden sm:inline-flex">
        Workspace
      </Link>
    </div>
  ) : (
    <Link href="/apply" className="btn-primary btn-sm inline-flex gap-2">
      Browse programs
    </Link>
  );

  return (
    <AppShell
      variant="student"
      title={enrollment ? `Overview` : "Welcome back"}
      actions={headerActions}
    >
      {loading ? (
        <div className="flex h-64 items-center justify-center dash-card">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="dash-card bg-red-50 border-red-200 text-center text-red-700 py-10">
          <p>{error}</p>
          <button onClick={fetchDashboard} className="btn-primary btn-sm mt-4 inline-flex gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : !enrollment ? (
        <div className="dash-card py-12 text-center max-w-2xl mx-auto mt-10">
          {paymentFailed && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Payment was not completed. No active program has been started.
            </div>
          )}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 mb-6">
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
            Start your learning journey
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You don&apos;t have any active enrollments. Browse our programs and join one to access your workspace.
          </p>
          <Link href="/apply" className="btn-primary">
            Explore Programs
          </Link>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Overview Strip */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="dash-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">Active Program</p>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">{enrollment.internship}</h2>
                <p className="text-sm text-gray-500">
                  {enrollment.domain} · {enrollment.duration}
                </p>
              </div>

              <div className="flex-1 max-w-md w-full">
                <div className="mb-2 flex items-center justify-between text-sm font-medium">
                  <span className="text-gray-700">Course Progress</span>
                  <span className="text-green-700">{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="dash-metric">
              <p className="text-xs font-semibold text-gray-500 uppercase">Completed</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{completedWeeks} <span className="text-sm font-normal text-gray-500">weeks</span></p>
            </div>
            <div className="dash-metric">
              <p className="text-xs font-semibold text-gray-500 uppercase">Remaining</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{pendingWeeks} <span className="text-sm font-normal text-gray-500">weeks</span></p>
            </div>
            <div className="dash-metric">
              <p className="text-xs font-semibold text-gray-500 uppercase">Project</p>
              <p className="mt-2 text-sm font-bold text-gray-900">{submission ? submission.status : "Pending"}</p>
            </div>
            <div className="dash-metric">
              <p className="text-xs font-semibold text-gray-500 uppercase">Certificate</p>
              <p className="mt-2 text-sm font-bold text-gray-900">{certificate ? "Ready" : "Locked"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Col: Learning Plan */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" /> Learning Plan
              </h3>
              
              <div className="space-y-3">
                {weeks.map((week) => {
                  const isOpen = currentWeek?.week === week.week;
                  const isDone = completedWeeks >= week.week;

                  return (
                    <div key={week.week} className={`rounded-xl border transition-colors ${isOpen ? "border-green-200 bg-white shadow-sm" : "border-gray-200 bg-gray-50/50"}`}>
                      <div className="flex items-start justify-between gap-4 px-5 py-4">
                        <button type="button" onClick={() => setOpenWeek(isOpen ? null : week.week)} className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <p className={`text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-700"}`}>{week.title}</p>
                            {isDone ? <TinyPill highlight>Done</TinyPill> : null}
                            {isOpen && !isDone ? <TinyPill>Current</TinyPill> : null}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{week.description}</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkWeekComplete(week.week)}
                          disabled={busyWeek === week.week || isDone}
                          className={`shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors ${isDone ? "bg-green-100 text-green-600 cursor-default" : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"}`}
                          title={isDone ? "Completed" : "Mark complete"}
                        >
                          {busyWeek === week.week ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-white rounded-b-xl">
                          <div className="space-y-3">
                            {week.tasks.map((task, idx: number) => (
                              <div key={task.id || idx} className="dash-inner">
                                <p className="text-sm font-semibold text-gray-900 mb-1">{task.title}</p>
                                <p className="text-sm text-gray-600">{task.description}</p>
                              </div>
                            ))}
                          </div>

                          {week.resources?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-50">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</p>
                              <div className="flex flex-wrap gap-2">
                                {week.resources.map((resource: string) => (
                                  <span key={resource} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {resource}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Milestones */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" /> Milestones
              </h3>

              <div className="dash-card">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">1. Final Project</p>
                {submission ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status-badge status-badge-success">{submission.status}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{submission.projectTitle}</p>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{submission.description}</p>
                    <Link href="/submit-project" className="btn-secondary w-full text-center text-sm py-2">
                      View Submission
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">Complete all weekly tasks before submitting your final project for review.</p>
                    <Link href="/submit-project" className="btn-primary w-full text-center text-sm py-2">
                      Submit Project
                    </Link>
                  </div>
                )}
              </div>

              <div className="dash-card">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">2. Certificate</p>
                {certificate ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">ID: {certificate.certificateId}</p>
                    <p className="text-xs text-gray-500 mb-4">Issued on {new Date(certificate.issuedDate).toLocaleDateString()}</p>
                    <Link href={`/certificate/${certificate.certificateId}`} className="btn-primary w-full text-center text-sm py-2 gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-4">Unlocked after your final project is reviewed and approved.</p>
                    <button disabled className="btn-secondary w-full text-center text-sm py-2 opacity-50 cursor-not-allowed">
                      Locked
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
