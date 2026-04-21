"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, LogOut, Save, Send } from "lucide-react";
import {
  api,
  ApiError,
  WORKSPACE_TOKEN_KEY,
  WORKSPACE_USER_KEY,
  type WorkspaceProject,
  type WorkspaceProgress,
  type WorkspaceSubmission,
  type InternProfile,
} from "@/lib/api";

type Tab = "projects" | "progress" | "submission";

const EMPTY_PROGRESS: WorkspaceProgress = {
  week1: false,
  week2: false,
  week3: false,
  week4: false,
};

export default function WorkspaceDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [profile, setProfile] = useState<InternProfile>({});
  const [progress, setProgress] = useState<WorkspaceProgress>(EMPTY_PROGRESS);
  const [submission, setSubmission] = useState<WorkspaceSubmission | null>(null);
  const [githubUrl, setGithubUrl] = useState("");

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === profile.selectedProjectId) || null,
    [projects, profile.selectedProjectId],
  );

  const completedWeeks = useMemo(() => {
    return [progress.week1, progress.week2, progress.week3, progress.week4].filter(Boolean).length;
  }, [progress]);

  const loadWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [projectRows, progressRows, currentSubmission] = await Promise.all([
        api.getWorkspaceProjects(),
        api.getWorkspaceProgress(),
        api.getWorkspaceSubmission(),
      ]);
      setProjects(projectRows || []);
      setProfile(progressRows.internProfile || {});
      setProgress(progressRows.workspaceProgress || EMPTY_PROGRESS);
      setSubmission(currentSubmission || null);
      if (currentSubmission?.githubLink) {
        setGithubUrl(currentSubmission.githubLink);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to load workspace.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(WORKSPACE_TOKEN_KEY) : null;
    if (!token) {
      router.replace("/workspace/login");
      return;
    }
    void loadWorkspace();
  }, [loadWorkspace, router]);

  const handleSelectProject = async (projectId: string) => {
    try {
      setSaving(true);
      setError("");
      await api.selectWorkspaceProject(projectId);
      await loadWorkspace();
      setActiveTab("progress");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to select project.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleWeek = async (week: number) => {
    try {
      setSaving(true);
      setError("");
      const key = `week${week}` as const;
      const nextStatus = !progress[key];
      await api.updateWorkspaceProgress(week, nextStatus);
      setProgress((prev) => ({ ...prev, [key]: nextStatus }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update progress.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!githubUrl.trim()) return;

    try {
      setSaving(true);
      setError("");
      await api.submitWorkspaceProject({ githubUrl: githubUrl.trim() });
      await loadWorkspace();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to submit project.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(WORKSPACE_TOKEN_KEY);
    localStorage.removeItem(WORKSPACE_USER_KEY);
    router.replace("/workspace/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.16em] text-[#64748B] font-semibold">Workspace</p>
              <h1 className="mt-2 text-[28px] font-black tracking-tight text-[#0F172A]">Intern Dashboard</h1>
              <p className="mt-2 text-sm text-[#64748B]">Select one project, track your weekly progress, and submit once for review.</p>
            </div>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFC]">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <button onClick={() => setActiveTab("projects")} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${activeTab === "projects" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-[#E2E8F0] bg-white text-[#334155]"}`}>
            1. Project
          </button>
          <button onClick={() => setActiveTab("progress")} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${activeTab === "progress" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-[#E2E8F0] bg-white text-[#334155]"}`}>
            2. Progress ({completedWeeks}/4)
          </button>
          <button onClick={() => setActiveTab("submission")} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${activeTab === "submission" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-[#E2E8F0] bg-white text-[#334155]"}`}>
            3. Submission
          </button>
        </div>

        {activeTab === "projects" && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-[#0F172A]">Select your project</h2>
            <p className="mt-1 text-sm text-[#64748B]">Project selection is locked after the first choice.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {projects.map((project) => {
                const isSelected = selectedProject?.id === project.id;
                const isLocked = Boolean(profile.selectedProjectId) && !isSelected;
                return (
                  <article key={project.id} className={`rounded-xl border p-4 ${isSelected ? "border-emerald-600 bg-emerald-50/40" : "border-[#E2E8F0] bg-white"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#0F172A]">{project.title}</h3>
                      <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#475569]">{project.difficulty}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#64748B]">{project.description}</p>
                    <button
                      disabled={isLocked || isSelected || saving}
                      onClick={() => handleSelectProject(project.id)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                    >
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "progress" && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-[#0F172A]">Weekly progress</h2>
            <p className="mt-1 text-sm text-[#64748B]">Current project: {selectedProject?.title || "No project selected"}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((week) => {
                const key = `week${week}` as const;
                const done = progress[key];
                return (
                  <button
                    key={week}
                    onClick={() => handleToggleWeek(week)}
                    disabled={saving}
                    className={`rounded-xl border p-4 text-left ${done ? "border-emerald-600 bg-emerald-50" : "border-[#E2E8F0] bg-white"}`}
                  >
                    <p className="text-xs uppercase tracking-wide text-[#64748B]">Week {week}</p>
                    <p className="mt-2 text-sm font-semibold text-[#0F172A]">{done ? "Completed" : "Mark complete"}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "submission" && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_12px_rgb(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-[#0F172A]">Final submission</h2>
            <p className="mt-1 text-sm text-[#64748B]">Status: {submission?.status || "Not submitted"}</p>
            <form onSubmit={handleSubmitProject} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#64748B]">Github repository URL</span>
                <input
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-emerald-600 focus:outline-none"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={saving || !selectedProject}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> Submit project
              </button>
            </form>
            {submission && (
              <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#334155]">
                <p><span className="font-semibold">Latest link:</span> {submission.githubLink}</p>
                <p className="mt-1"><span className="font-semibold">Feedback:</span> {submission.feedback || "Pending review"}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
