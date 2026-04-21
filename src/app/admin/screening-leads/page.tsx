"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

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

const FILTERS: Array<{ value: "all" | ScreeningStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under review" },
  { value: "selected", label: "Selected" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

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

  const label = status === "under_review" ? "screened / under_review" : status;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${palette}`}>{label}</span>;
}

export default function AdminScreeningLeadsPage() {
  const [filter, setFilter] = useState<"all" | ScreeningStatus>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<ScreeningLead[]>([]);

  const loadLeads = async () => {
    console.log("[FETCH LEADS] /admin/screening-leads");
    const payload = await api.getAdminScreeningLeads();
    setLeads(Array.isArray(payload) ? (payload as ScreeningLead[]) : []);
  };

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError("");
        await loadLeads();
      } catch (loadError) {
        console.error("[API ERROR] [FETCH LEADS]", loadError);
        setError(loadError instanceof Error ? loadError.message : "Unable to load screening leads.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const statusMatch = filter === "all" || lead.status === filter;
      const queryMatch = !normalizedQuery
        || lead.name.toLowerCase().includes(normalizedQuery)
        || lead.email.toLowerCase().includes(normalizedQuery)
        || lead.college.toLowerCase().includes(normalizedQuery)
        || lead.phone.toLowerCase().includes(normalizedQuery);
      return statusMatch && queryMatch;
    });
  }, [filter, leads, query]);

  const summary = useMemo(() => {
    const underReview = leads.filter((lead) => lead.status === "under_review").length;
    const selected = leads.filter((lead) => lead.status === "selected").length;
    const converted = leads.filter((lead) => lead.converted || lead.status === "converted").length;

    return {
      totalApplied: leads.length,
      underReview,
      selected,
      converted,
      testCompleted: leads.filter((lead) => lead.test_submitted).length,
      emailSent: leads.filter((lead) => lead.email_sent).length,
    };
  }, [leads]);

  const refresh = async () => {
    try {
      setReloading(true);
      setError("");
      await loadLeads();
    } catch (refreshError) {
      console.error("[API ERROR] [FETCH LEADS refresh]", refreshError);
      setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh screening leads.");
    } finally {
      setReloading(false);
    }
  };

  return (
    <AppShell
      variant="admin"
      title="Screening Leads"
      subtitle="Track every applicant from apply to conversion."
      actions={
        <div className="flex flex-wrap gap-2">
          <button onClick={refresh} className="btn-secondary btn-sm gap-2" disabled={loading || reloading}>
            <RefreshCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/admin/screening-actions" className="btn-primary btn-sm gap-2">
            Actions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Total Applied</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.totalApplied}</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Test Completed</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.testCompleted}</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Under Review</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.underReview}</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Selected</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.selected}</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Converted</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.converted}</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Emails Sent</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">{summary.emailSent}</p></div>
        </div>

        <div className="dash-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Funnel snapshot
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900">Screening funnel</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Status values are kept on the real funnel states: applied, under review, selected, and converted.
              </p>
            </div>

            <label className="relative w-full lg:w-[340px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="input-base pl-10"
                placeholder="Search name, email, phone, college"
              />
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          ) : filteredLeads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
              No screening leads found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Phone</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">College</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Test Score</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Converted</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">{lead.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{lead.email}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{lead.phone}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{lead.college}</p>
                          <p className="text-xs text-gray-500">{lead.year} · {lead.branch}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700"><StatusBadge status={lead.status} /></td>
                      <td className="px-3 py-3 text-sm text-gray-700">{lead.test_score ?? "-"}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{lead.converted ? "Yes" : "No"}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
