"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, Sparkles, ShieldCheck, BadgeCheck, IndianRupee, FileText, MessageCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, ApiError, AUTH_TOKEN_KEY } from "@/lib/api";

type ScreeningStatus = "applied" | "under_review" | "selected" | "converted" | "rejected";

type ScreeningLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
  status: ScreeningStatus;
  test_submitted: boolean;
  test_score: number | null;
  email_sent: boolean;
  clicked_confirm: boolean;
  converted: boolean;
  selection_mail_sent: boolean;
  payment_mail_sent: boolean;
  offer_sent: boolean;
  onboarding_sent: boolean;
  certificate_issued: boolean;
  created_at: string;
};

type LeadDraft = {
  paymentLink: string;
  deadline: string;
  role: string;
  duration: string;
  whatsappLink: string;
  internship: string;
  signatureName: string;
  reminderStage: "test" | "payment" | "general";
};

const DEFAULT_DRAFT: LeadDraft = {
  paymentLink: "",
  deadline: "",
  role: "Software Engineering Intern",
  duration: "4 Weeks",
  whatsappLink: "",
  internship: "SkillBridge Internship",
  signatureName: "SkillBridge Talent Team",
  reminderStage: "general",
};

function StatusBadge({ status }: { status: ScreeningStatus }) {
  const palette =
    status === "converted"
      ? "bg-emerald-100 text-emerald-700"
      : status === "selected"
        ? "bg-green-100 text-green-700"
        : status === "under_review"
          ? "bg-amber-100 text-amber-700"
          : status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-700";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${palette}`}>{status}</span>;
}

export default function AdminScreeningActionsPage() {
  const [leads, setLeads] = useState<ScreeningLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, LeadDraft>>({});

  // ── Create Workspace Access state ──
  const [wsModalLead, setWsModalLead] = useState<ScreeningLead | null>(null);
  const [wsPassword, setWsPassword] = useState("");
  const [wsCreating, setWsCreating] = useState(false);
  const [wsResult, setWsResult] = useState<string | null>(null);

  const fetchLeads = async () => {
    console.log("[FETCH LEADS] /admin/screening-leads via api client");
    const payload = await api.getAdminScreeningLeads();
    const rows = Array.isArray(payload) ? payload : [];
    setLeads(rows as ScreeningLead[]);
    setDrafts((current) => {
      const next = { ...current };
      for (const lead of rows) {
        if (!next[lead.id]) {
          next[lead.id] = {
            ...DEFAULT_DRAFT,
            internship: (lead as any).college || DEFAULT_DRAFT.internship,
          };
        }
      }
      return next;
    });
  };

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError("");
        await fetchLeads();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load screening leads.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.email, lead.college, lead.phone, lead.year, lead.branch].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [leads, query]);

  const updateDraft = (leadId: string, patch: Partial<LeadDraft>) => {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        ...(current[leadId] || DEFAULT_DRAFT),
        ...patch,
      },
    }));
  };

  const postAction = async (lead: ScreeningLead, endpoint: string, body: Record<string, string>) => {
    await api.postAdminAction(endpoint, body as Record<string, unknown>);
    setSuccess(`${lead.email}: Action completed`);
    await fetchLeads();
  };

  // ── Create Workspace Access handler ──
  const handleCreateWorkspaceUser = async () => {
    if (!wsModalLead) return;
    const pw = wsPassword.trim();
    if (!pw || pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setWsCreating(true);
      setError("");
      setWsResult(null);
      const result = await api.createWorkspaceUser({
        name: wsModalLead.name,
        email: wsModalLead.email,
        password: pw,
      });
      setWsResult(`✅ Workspace account created for ${result.user.email}`);
      setWsPassword("");
      await fetchLeads();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create workspace user.");
    } finally {
      setWsCreating(false);
    }
  };

  const runAction = async (lead: ScreeningLead, action: "selection" | "payment" | "offer" | "onboarding" | "certificate" | "reminder") => {
    try {
      setBusyId(`${lead.id}:${action}`);
      setSuccess("");
      setError("");

      const draft = drafts[lead.id] || DEFAULT_DRAFT;

      if (action === "selection") {
        await postAction(lead, "/api/admin/send-mail", {
          email: lead.email,
          type: "selection",
          name: lead.name,
        });
        return;
      }

      if (action === "payment") {
        if (!draft.paymentLink.trim()) {
          throw new Error("Payment link is required before sending payment mail.");
        }
        await postAction(lead, "/api/admin/send-mail", {
          email: lead.email,
          type: "payment",
          name: lead.name,
          paymentLink: draft.paymentLink,
          deadline: draft.deadline,
        });
        return;
      }

      if (action === "offer") {
        await postAction(lead, "/api/admin/generate-offer-letter", {
          email: lead.email,
          name: lead.name,
          role: draft.role,
          duration: draft.duration,
          signatureName: draft.signatureName,
        });
        return;
      }

      if (action === "onboarding") {
        if (!draft.whatsappLink.trim()) {
          throw new Error("WhatsApp link is required before sending onboarding mail.");
        }
        await postAction(lead, "/api/admin/send-mail", {
          email: lead.email,
          type: "onboarding",
          name: lead.name,
          whatsappLink: draft.whatsappLink,
        });
        return;
      }

      if (action === "certificate") {
        if (!draft.internship.trim()) {
          throw new Error("Certificate program is required before generating certificate.");
        }
        await postAction(lead, "/api/admin/generate-certificate", {
          email: lead.email,
          name: lead.name,
          internship: draft.internship,
        });
        return;
      }

      await postAction(lead, "/api/admin/send-reminder", {
        email: lead.email,
        name: lead.name,
        stage: draft.reminderStage,
      });
    } catch (actionError) {
      console.error(`[API ERROR] [SCREENING ACTION] action=${action} email=${lead.email}`, actionError);
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
    <AppShell
      variant="admin"
      title="Screening Actions"
      subtitle="Control each stage of the funnel from one place."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/screening-leads" className="btn-secondary btn-sm gap-2">
            Leads <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/upload-emails" className="btn-primary btn-sm gap-2">
            Upload Emails <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Selection</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">Manual</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Payment</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">Razorpay</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Offers</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">PDF</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Onboarding</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">WhatsApp</p></div>
        </div>

        <div className="dash-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin controlled funnel
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900">Per-user CRM actions</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Each button triggers the corresponding route: selection, payment, offer letter, onboarding, certificate, or reminder.
              </p>
            </div>

            <label className="relative w-full lg:w-[360px]">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-base pl-10"
                placeholder="Search lead to act on"
              />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          ) : success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>
          ) : null}

          <div className="mt-5 space-y-4">
            {filteredLeads.map((lead) => {
              const draft = drafts[lead.id] || DEFAULT_DRAFT;
              const isBusy = Boolean(busyId && busyId.startsWith(`${lead.id}:`));

              return (
                <article key={lead.id} className="dash-inner bg-white p-5 space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-gray-900">{lead.name}</p>
                        <StatusBadge status={lead.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{lead.email} · {lead.phone}</p>
                      <p className="mt-1 text-sm text-gray-500">{lead.college} · {lead.year} · {lead.branch}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 sm:grid-cols-3 lg:min-w-[300px]">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">Score: {lead.test_score ?? "-"}</div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">Selected: {lead.selection_mail_sent ? "Yes" : "No"}</div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">Paid: {lead.payment_mail_sent ? "Yes" : "No"}</div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Payment Link</span>
                      <input value={draft.paymentLink} onChange={(event) => updateDraft(lead.id, { paymentLink: event.target.value })} className="input-base" placeholder="Razorpay payment URL" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Deadline</span>
                      <input value={draft.deadline} onChange={(event) => updateDraft(lead.id, { deadline: event.target.value })} className="input-base" placeholder="e.g. 24 Apr 2026" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Reminder Stage</span>
                      <select value={draft.reminderStage} onChange={(event) => updateDraft(lead.id, { reminderStage: event.target.value as LeadDraft["reminderStage"] })} className="input-base">
                        <option value="general">General</option>
                        <option value="test">Test</option>
                        <option value="payment">Payment</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Role</span>
                      <input value={draft.role} onChange={(event) => updateDraft(lead.id, { role: event.target.value })} className="input-base" placeholder="Software Engineering Intern" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Duration</span>
                      <input value={draft.duration} onChange={(event) => updateDraft(lead.id, { duration: event.target.value })} className="input-base" placeholder="4 Weeks" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">WhatsApp Link</span>
                      <input value={draft.whatsappLink} onChange={(event) => updateDraft(lead.id, { whatsappLink: event.target.value })} className="input-base" placeholder="Invite link" />
                    </label>
                    <label className="block lg:col-span-2">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Certificate Program</span>
                      <input value={draft.internship} onChange={(event) => updateDraft(lead.id, { internship: event.target.value })} className="input-base" placeholder="SkillBridge Internship" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Signature Name</span>
                      <input value={draft.signatureName} onChange={(event) => updateDraft(lead.id, { signatureName: event.target.value })} className="input-base" placeholder="SkillBridge Talent Team" />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void runAction(lead, "selection")} className="btn-primary btn-sm gap-2" disabled={isBusy}>
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Send Selection Mail
                    </button>
                    <button onClick={() => void runAction(lead, "payment")} className="btn-secondary btn-sm gap-2" disabled={isBusy}>
                      <IndianRupee className="h-4 w-4" /> Send Payment Mail
                    </button>
                    <button onClick={() => void runAction(lead, "offer")} className="btn-secondary btn-sm gap-2" disabled={isBusy}>
                      <FileText className="h-4 w-4" /> Send Offer Letter
                    </button>
                    <button onClick={() => void runAction(lead, "onboarding")} className="btn-secondary btn-sm gap-2" disabled={isBusy}>
                      <Mail className="h-4 w-4" /> Send Onboarding Mail
                    </button>
                    <button onClick={() => void runAction(lead, "certificate")} className="btn-secondary btn-sm gap-2" disabled={isBusy}>
                      <BadgeCheck className="h-4 w-4" /> Generate Certificate
                    </button>
                    <button onClick={() => void runAction(lead, "reminder")} className="btn-secondary btn-sm gap-2" disabled={isBusy}>
                      <MessageCircle className="h-4 w-4" /> Send Reminder
                    </button>
                    {lead.status === "selected" && (
                      <button
                        onClick={() => { setWsModalLead(lead); setWsPassword(""); setWsResult(null); setError(""); }}
                        className="btn-primary btn-sm gap-2 bg-indigo-600 hover:bg-indigo-700"
                        disabled={isBusy}
                      >
                        <ShieldCheck className="h-4 w-4" /> Create Workspace Access
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {!loading && filteredLeads.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
                No leads found.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>

    {/* ── Create Workspace Access Modal ── */}
    {wsModalLead && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setWsModalLead(null)}>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-5" onClick={(e) => e.stopPropagation()}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 mb-1">Create Workspace Access</p>
            <h3 className="text-xl font-bold text-gray-900">{wsModalLead.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{wsModalLead.email}</p>
          </div>

          {wsResult ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {wsResult}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">Password for workspace login</label>
                <input
                  type="text"
                  value={wsPassword}
                  onChange={(e) => setWsPassword(e.target.value)}
                  className="input-base font-mono"
                  placeholder="Min 8 chars, e.g. Intern@2026"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">This password will be hashed. Share it with the intern securely.</p>
              </div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
            </>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={() => setWsModalLead(null)} className="btn-secondary btn-sm">
              {wsResult ? "Done" : "Cancel"}
            </button>
            {!wsResult && (
              <button
                onClick={handleCreateWorkspaceUser}
                disabled={wsCreating || wsPassword.trim().length < 8}
                className="btn-primary btn-sm gap-2"
              >
                {wsCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {wsCreating ? "Creating..." : "Create Account"}
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
