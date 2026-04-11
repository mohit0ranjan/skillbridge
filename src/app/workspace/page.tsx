"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, BookOpen, ShieldCheck, Clock, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

export default function WorkspacePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setData(await api.getDashboard());
    } catch {
      setError("We could not load your learning workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enrollment = data?.enrollments?.[0] || null;
  const weeks = enrollment?.weeks || [];
  const currentWeek = useMemo(() => weeks.find((week: any) => week.week === selectedWeek) || weeks[0], [weeks, selectedWeek]);
  const completedWeeks = enrollment?.completedWeeks || 0;
  const submission = enrollment?.finalSubmission || null;
  const certificate = enrollment?.certificate || null;

  useEffect(() => {
    if (!selectedWeek && weeks.length > 0) {
      setSelectedWeek(weeks[0].week);
    }
  }, [selectedWeek, weeks]);

  const handleMarkComplete = async (weekNumber: number) => {
    if (!enrollment) return;
    try {
      await api.markWeekComplete({ internshipId: enrollment.internshipId, weekNumber });
      await fetchData();
    } catch {
      setError("Unable to update the week status.");
    }
  };

  return (
    <AppShell
      variant="student"
      title={enrollment ? `${enrollment.internship} workspace` : "Learning workspace"}
      subtitle={enrollment ? "A deeper view of your weekly modules, resources, and completion state" : "Join a program to access the week-by-week workspace"}
      actions={enrollment ? (
        <div className="flex items-center gap-3">
          <Link href="/submit-project" className="btn-secondary btn-sm hidden sm:inline-flex">Submit project</Link>
          <Link href="/certificate" className="btn-primary btn-sm inline-flex gap-2"><ShieldCheck className="h-4 w-4" /> Certificate</Link>
        </div>
      ) : null}
    >
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center rounded-3xl border border-gray-200 bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{error}</div>
      ) : !enrollment ? (
        <div className="grid gap-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-label">Workspace</p>
            <h2 className="max-w-2xl text-4xl font-black tracking-tight text-gray-900">Your week-based workspace lives here.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">After enrolling, every week gets its own card with tasks, resources, and a quick completion action.</p>
            <Link href="/apply" className="btn-primary btn-lg mt-6 inline-flex gap-2">Browse programs <ArrowRight className="h-5 w-5" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Tasks</p><p className="mt-3 text-3xl font-extrabold text-gray-900">Week cards</p></div>
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Certificate</p><p className="mt-3 text-3xl font-extrabold text-gray-900">Review based</p></div>
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Support</p><p className="mt-3 text-3xl font-extrabold text-gray-900">Ticketed</p></div>
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-400">Flow</p><p className="mt-3 text-3xl font-extrabold text-gray-900">Submit once</p></div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className="section-label mb-3">Weekly learning</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{enrollment.internship}</h2>
                <p className="mt-2 text-sm text-gray-500">{enrollment.domain} · {enrollment.duration}</p>
              </div>
              <div className="rounded-3xl border border-green-100 bg-green-50 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700">Weeks completed</p>
                <p className="mt-2 text-4xl font-black text-green-700">{completedWeeks}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {weeks.map((week: any) => {
                const open = currentWeek?.week === week.week;
                const done = completedWeeks >= week.week;
                return (
                  <div key={week.week} className={`rounded-3xl border ${open ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`}>
                    <div onClick={() => setSelectedWeek(open ? null : week.week)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50/80 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{week.title}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${done ? "border-green-100 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>{done ? "Done" : "Open"}</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-500">{week.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(event) => { event.stopPropagation(); handleMarkComplete(week.week); }} className={`${done ? "border border-green-100 bg-green-50 text-green-700" : "bg-gray-900 text-white"} inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold`}>
                          <CheckCircle2 className="h-4 w-4" /> {done ? "Marked" : "Complete"}
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          {week.tasks.map((task: any) => (
                            <div key={task.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                              <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                              <p className="mt-1 text-sm leading-6 text-gray-500">{task.description}</p>
                            </div>
                          ))}
                        </div>
                        {week.resources?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {week.resources.map((resource: string) => (
                              <span key={resource} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">{resource}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Current week</p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">{currentWeek?.title || "Select a week"}</h3>
                  <p className="mt-2 text-sm text-gray-500">{currentWeek?.description || "Open any week to inspect tasks and resources."}</p>
                </div>
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Resources</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(currentWeek?.resources || []).map((resource: string) => (
                    <span key={resource} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200">{resource}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Checkpoint flow</p>
              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">1. Complete weekly tasks</p>
                  <p className="mt-1 text-sm text-gray-500">Track progress with the week checklist.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">2. Submit final project</p>
                  <p className="mt-1 text-sm text-gray-500">Use the submission page for your final work.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">3. Approval unlocks certificate</p>
                  <p className="mt-1 text-sm text-gray-500">Your certificate appears after admin review.</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/submit-project" className="btn-primary flex-1 justify-center">Submit</Link>
                <Link href="/certificate" className="btn-secondary flex-1 justify-center">Certificate</Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
              <p className="section-label mb-3">Status</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Submission</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{submission ? submission.status : "Pending"}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Certificate</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{certificate ? certificate.certificateId : "Waiting"}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
