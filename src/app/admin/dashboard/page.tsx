"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Download, Loader2, Mail, MessageSquare, RefreshCw, Search, Send, Sparkles, Users, FileText, LifeBuoy, Upload } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

type TabValue = "overview" | "submissions" | "users" | "certificates" | "tickets" | "emails";

const hashToTab: Record<string, TabValue> = {
  "#overview": "overview",
  "#submissions": "submissions",
  "#users": "users",
  "#certificates": "certificates",
  "#tickets": "tickets",
  "#emails": "emails",
};

type ScreeningLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
  status: string;
  test_submitted: boolean;
  test_score: number | null;
  selection_mail_sent: boolean;
  payment_mail_sent: boolean;
  offer_sent: boolean;
  onboarding_sent: boolean;
  certificate_issued: boolean;
  converted: boolean;
  created_at: string;
};

type EmailStage = "selection" | "payment" | "offer" | "onboarding";

const EMAIL_STAGES: { key: EmailStage; label: string; dbField: keyof ScreeningLead; color: string }[] = [
  { key: "selection", label: "Selection", dbField: "selection_mail_sent", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { key: "payment", label: "Payment", dbField: "payment_mail_sent", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { key: "offer", label: "Offer", dbField: "offer_sent", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { key: "onboarding", label: "Onboarding", dbField: "onboarding_sent", color: "text-green-700 bg-green-50 border-green-200" },
];

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="dash-metric">
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 text-right">{hint}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let colorClass = "status-badge-default";
  
  if (status === "APPROVED" || status === "RESOLVED") colorClass = "status-badge-success";
  else if (status === "REJECTED" || status === "CLOSED") colorClass = "bg-gray-100 text-gray-700";
  else if (status === "PENDING" || status === "OPEN" || status === "SUBMITTED") colorClass = "status-badge-pending";
  else if (status === "IN_PROGRESS") colorClass = "status-badge-warning";
  else if (status === "UNDER_REVIEW") colorClass = "bg-amber-100 text-amber-700";
  
  return <span className={`status-badge ${colorClass}`}>{status}</span>;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [overview, setOverview] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [userLookup, setUserLookup] = useState("");
  const [userDetail, setUserDetail] = useState<any>(null);
  const [certificateId, setCertificateId] = useState("");
  const [certificateResult, setCertificateResult] = useState<any>(null);
  const [ticketFilter, setTicketFilter] = useState("OPEN");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [screeningLeads, setScreeningLeads] = useState<ScreeningLead[]>([]);
  const [busy, setBusy] = useState(false);
  const [emailSending, setEmailSending] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState<"all" | "pending" | "sent">("all");
  const [emailSearch, setEmailSearch] = useState("");

  const activateTab = (tab: TabValue) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      const fromHash = hashToTab[window.location.hash];
      if (fromHash) {
        setActiveTab(fromHash);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const loadScreeningLeads = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sb_token") : "";
      if (!token) return;
      console.log("[FETCH LEADS] /api/admin/screening-leads");
      const response = await fetch("/api/admin/screening-leads", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json() as { success?: boolean; data?: ScreeningLead[] };
      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }
      if (payload.success && Array.isArray(payload.data)) {
        setScreeningLeads(payload.data);
      }
    } catch (leadError) {
      console.error("[API ERROR] [FETCH LEADS]", leadError);
      /* screening data is non-critical */
    }
  }, []);

  const screeningMetrics = useMemo(() => {
    if (screeningLeads.length === 0) return null;
    return {
      totalApplied: screeningLeads.length,
      testCompleted: screeningLeads.filter((l) => l.test_submitted).length,
      underReview: screeningLeads.filter((l) => l.status === "under_review").length,
      selected: screeningLeads.filter((l) => l.status === "selected").length,
      converted: screeningLeads.filter((l) => l.converted || l.status === "converted").length,
    };
  }, [screeningLeads]);

  const emailMetrics = useMemo(() => {
    return {
      selectionSent: screeningLeads.filter((l) => l.selection_mail_sent).length,
      paymentSent: screeningLeads.filter((l) => l.payment_mail_sent).length,
      offerSent: screeningLeads.filter((l) => l.offer_sent).length,
      onboardingSent: screeningLeads.filter((l) => l.onboarding_sent).length,
      certificateIssued: screeningLeads.filter((l) => l.certificate_issued).length,
    };
  }, [screeningLeads]);

  const filteredEmailLeads = useMemo(() => {
    const q = emailSearch.trim().toLowerCase();
    return screeningLeads
      .filter((l) => l.test_submitted) // only show leads who completed the test
      .filter((l) => {
        if (emailFilter === "pending") return !l.selection_mail_sent || !l.payment_mail_sent || !l.offer_sent || !l.onboarding_sent;
        if (emailFilter === "sent") return l.selection_mail_sent && l.payment_mail_sent && l.offer_sent && l.onboarding_sent;
        return true;
      })
      .filter((l) => !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
  }, [screeningLeads, emailFilter, emailSearch]);

  const sendEmail = useCallback(async (lead: ScreeningLead, type: EmailStage) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sb_token") : "";
    if (!token) return;
    const sendKey = `${lead.email}-${type}`;
    try {
      setEmailSending(sendKey);
      setError("");
      const body: Record<string, string> = { email: lead.email, name: lead.name, type };
      if (type === "payment") body.paymentLink = "https://rzp.io/rzp/skillbridge";
      if (type === "payment") body.deadline = "Within 24 Hours";
      if (type === "onboarding") body.whatsappLink = "https://chat.whatsapp.com/skillbridge";
      const response = await fetch("/api/admin/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || "Send failed");
      await loadScreeningLeads();
    } catch (err: any) {
      setError(err?.message || "Failed to send email.");
    } finally {
      setEmailSending(null);
    }
  }, [loadScreeningLeads]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        api.getAdminDashboard(),
        api.getAdminSubmissions(),
        api.getAdminTickets(ticketFilter),
        api.getInternships(),
        api.getAdminCertificates(),
      ]);

      await loadScreeningLeads();

      const [overviewResult, submissionsResult, ticketsResult, internshipsResult, certificatesResult] = results;

      if (overviewResult.status === "fulfilled") setOverview(overviewResult.value);
      if (submissionsResult.status === "fulfilled") setSubmissions(submissionsResult.value || []);
      if (ticketsResult.status === "fulfilled") setTickets(ticketsResult.value || []);
      if (internshipsResult.status === "fulfilled") setInternships(Array.isArray(internshipsResult.value) ? internshipsResult.value : []);
      if (certificatesResult.status === "fulfilled") setCertificates(Array.isArray(certificatesResult.value) ? certificatesResult.value : []);

      const failed = results.filter((item) => item.status === "rejected") as PromiseRejectedResult[];
      if (failed.length > 0) {
        console.error("[API ERROR] [ADMIN DASHBOARD loadAll]", failed.map((f) => f.reason));
        setError("Some dashboard sections failed to load. Retry to refresh all data.");
      }
    } catch (loadError: any) {
      console.error("[API ERROR] [ADMIN DASHBOARD loadAll]", loadError);
      setError(loadError?.message || "Unable to load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [ticketFilter, loadScreeningLeads]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!loading) {
      api.getAdminTickets(ticketFilter).then((data) => setTickets(data || [])).catch(() => null);
    }
  }, [loading, ticketFilter]);

  const activeInternships = useMemo(() => internships.slice(0, 6), [internships]);

  const lookupUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userLookup.trim()) return;

    try {
      setBusy(true);
      setError("");
      setUserDetail(await api.getAdminUser(userLookup.trim()));
    } catch {
      setError("Could not find that user ID.");
      setUserDetail(null);
    } finally {
      setBusy(false);
    }
  };

  const updateRole = async (userId: string, role: "USER" | "ADMIN") => {
    try {
      setBusy(true);
      await api.updateUserRole(userId, role);
      if (userDetail?.id === userId) {
        setUserDetail({ ...userDetail, role });
      }
      await loadAll();
    } catch (err: any) {
      setError(err?.message || "Role update failed.");
    } finally {
      setBusy(false);
    }
  };

  const reviewFinalSubmission = async (submissionId: string, status: "APPROVED" | "REJECTED", feedback?: string) => {
    try {
      setBusy(true);
      await api.reviewFinalSubmission(submissionId, { status, feedback });
      setSubmissions(submissions.map(item => 
        item.id === submissionId ? { ...item, status, feedback: feedback || item.feedback } : item
      ));
      await loadAll();
    } catch (err: any) {
      setError(err?.message || "Review action failed.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCertificate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!certificateId.trim()) return;

    try {
      setBusy(true);
      setCertificateResult(await api.verifyCertificate(certificateId.trim()));
    } catch {
      setCertificateResult({ valid: false });
    } finally {
      setBusy(false);
    }
  };

  const updateTicket = async (ticketId: string, status: string) => {
    try {
      setBusy(true);
      await api.updateAdminTicketStatus(ticketId, status);
      await api.getAdminTickets(ticketFilter).then((data) => setTickets(data || []));
    } catch (err: any) {
      setError(err?.message || "Ticket update failed.");
    } finally {
      setBusy(false);
    }
  };

  const replyTicket = async (ticketId: string) => {
    const reply = replyDrafts[ticketId]?.trim();
    if (!reply) return;

    try {
      setBusy(true);
      setReplyingTicketId(ticketId);
      setReplySuccess("");
      const response = await api.replyToAdminTicket(ticketId, reply, "RESOLVED");
      setReplyDrafts((current) => ({ ...current, [ticketId]: "" }));
      await api.getAdminTickets(ticketFilter).then((data) => setTickets(data || []));
      if (response?.emailSent) {
        setReplySuccess("Reply saved and email sent.");
        setError("");
      } else {
        setReplySuccess("");
        setError("Reply was saved, but email delivery failed. Check backend email logs.");
      }
    } catch (err: any) {
      setError(err?.message || "Reply failed.");
    } finally {
      setBusy(false);
      setReplyingTicketId(null);
    }
  };

  return (
    <AppShell
      variant="admin"
      title="Command Center"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/users" className="btn-secondary btn-sm gap-2 hidden sm:inline-flex">
            Users <Users className="h-4 w-4" />
          </Link>
          <Link href="/admin/upload-emails" className="btn-secondary btn-sm gap-2 hidden sm:inline-flex">
            Upload Emails <Upload className="h-4 w-4" />
          </Link>
          <button onClick={loadAll} className="btn-secondary btn-sm gap-2 hidden md:inline-flex" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      }
    >
      {loading && !overview ? (
        <div className="flex items-center justify-center h-64 dash-card">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : error && !overview ? (
        <div className="dash-card bg-red-50 border-red-200 text-center text-red-700 py-10">
          <p>{error}</p>
          <button onClick={loadAll} className="btn-primary btn-sm mt-4 gap-2 inline-flex">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Students" value={overview?.users?.students ?? 0} hint={`${overview?.users?.admins ?? 0} admins`} />
            <MetricCard label="Programs" value={overview?.programs?.total ?? 0} hint={`${overview?.programs?.enrollments ?? 0} enrollments`} />
            <MetricCard label="Pending" value={overview?.submissions?.pending ?? 0} hint="submissions" />
            <MetricCard label="Revenue" value={`₹${overview?.revenue?.total ?? 0}`} hint={`${overview?.certificates?.paid ?? 0} certificates`} />
          </div>

          {/* ─── Screening Funnel Quick View ─── */}
          {screeningMetrics && (
            <div className="dash-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" /> Screening Funnel
                  </p>
                  <h2 className="mt-3 text-lg font-bold tracking-tight text-gray-900">Screening Pipeline</h2>
                </div>
                <Link href="/admin/screening-leads" className="btn-primary btn-sm gap-2">
                  View All Leads <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="dash-inner bg-white text-center py-4">
                  <p className="text-2xl font-black text-gray-900">{screeningMetrics.totalApplied}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Applied</p>
                </div>
                <div className="dash-inner bg-white text-center py-4">
                  <p className="text-2xl font-black text-gray-900">{screeningMetrics.testCompleted}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Test Done</p>
                </div>
                <div className="dash-inner bg-white text-center py-4">
                  <p className="text-2xl font-black text-amber-700">{screeningMetrics.underReview}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Under Review</p>
                </div>
                <div className="dash-inner bg-white text-center py-4">
                  <p className="text-2xl font-black text-green-700">{screeningMetrics.selected}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Selected</p>
                </div>
                <div className="dash-inner bg-white text-center py-4">
                  <p className="text-2xl font-black text-emerald-700">{screeningMetrics.converted}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Converted</p>
                </div>
              </div>
            </div>
          )}

          <div className="dash-card p-6 lg:p-8 space-y-6">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-2">
              <button 
                onClick={() => activateTab("overview")} 
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <Sparkles className="h-4 w-4" /> Overview
              </button>
              <button 
                onClick={() => activateTab("submissions")} 
                className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'submissions' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <span className="flex items-center gap-3"><FileText className="h-4 w-4" /> Submissions</span>
                {overview?.submissions?.pending > 0 && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{overview.submissions.pending}</span>}
              </button>
              <button 
                onClick={() => activateTab("users")} 
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <Users className="h-4 w-4" /> User Management
              </button>
              <button 
                onClick={() => activateTab("certificates")} 
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'certificates' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <BadgeCheck className="h-4 w-4" /> Certificates
              </button>
              <button 
                onClick={() => activateTab("tickets")} 
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'tickets' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <LifeBuoy className="h-4 w-4" /> Support Tickets
              </button>
              <button 
                onClick={() => activateTab("emails")} 
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'emails' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-white'}`}
              >
                <Mail className="h-4 w-4" /> Email Pipeline
              </button>
            </div>

            <div>
              
              {/* === OVERVIEW TAB === */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">Program Catalog</h2>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {activeInternships.map((internship: any) => (
                        <div key={internship.id} className="dash-inner bg-white">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2">{internship.domain}</p>
                          <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{internship.title}</h3>
                          <p className="text-xs text-gray-500 mb-3">
                            {internship.duration} · {internship.level}
                          </p>
                          <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                            <span className="text-gray-500 text-xs uppercase font-semibold tracking-wider">Price</span>
                            <span className="font-bold text-gray-900">₹{internship.price / 100}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === SUBMISSIONS TAB === */}
              {activeTab === "submissions" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">Review Queue</h2>
                    <span className="text-sm text-gray-500 font-medium">{submissions.length} Total</span>
                  </div>

                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                        No submissions currently in the queue.
                      </div>
                    ) : (
                      submissions.map((submission) => (
                        <div key={submission.id} className="dash-inner bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <p className="font-semibold text-gray-900 text-sm">{submission.user.name}</p>
                              <StatusBadge status={submission.status} />
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              <span className="font-medium text-gray-700">{submission.projectTitle}</span> · {submission.internship?.title || "Final Project"}
                            </p>
                            <a href={submission.projectLink} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:text-green-700 hover:underline break-all block">
                              {submission.projectLink}
                            </a>
                            {submission.status === "SUBMITTED" && (
                             <p className="text-xs text-orange-600 mt-2 font-medium">Awaiting your review</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => reviewFinalSubmission(submission.id, "APPROVED")} 
                              className="btn-primary py-2 px-4 text-xs h-9 gap-1.5" 
                              disabled={busy || submission.status === "APPROVED"}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button 
                              onClick={() => reviewFinalSubmission(submission.id, "REJECTED", "Needs changes")} 
                              className="btn-secondary py-2 px-4 text-xs h-9" 
                              disabled={busy || submission.status === "REJECTED"}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* === USERS TAB === */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-4">User Details & Roles</h2>
                  
                  <form onSubmit={lookupUser} className="flex gap-3">
                    <input 
                      value={userLookup} 
                      onChange={(e) => setUserLookup(e.target.value)} 
                      className="input-base max-w-md" 
                      placeholder="Enter User ID or Email" 
                    />
                    <button type="submit" className="btn-primary btn-sm gap-2" disabled={busy || !userLookup.trim()}>
                      <Search className="h-4 w-4" /> Search
                    </button>
                  </form>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  {userDetail && (
                    <div className="dash-inner bg-white p-5 space-y-5 animate-in slide-in-from-bottom-2">
                      <div className="pb-4 border-b border-gray-100 flex items-start justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{userDetail.name}</p>
                          <p className="text-sm text-gray-500">{userDetail.email}</p>
                        </div>
                        <StatusBadge status={userDetail.role} />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">Account Role:</span>
                        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                          <button 
                            onClick={() => updateRole(userDetail.id, "USER")} 
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${userDetail.role === "USER" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            Student
                          </button>
                          <button 
                            onClick={() => updateRole(userDetail.id, "ADMIN")} 
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${userDetail.role === "ADMIN" ? "bg-white shadow-sm text-green-700" : "text-gray-500 hover:text-gray-700"}`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Completed Certs</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">{userDetail.certificates?.length || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Final Subs</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">{userDetail.finalSubmissions?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* === CERTIFICATES TAB === */}
              {activeTab === "certificates" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900">Certificates</h2>
                      <p className="mt-1 text-sm text-gray-500">Issued certificates, public verification, and direct download links.</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{certificates.length} total</span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-3">
                      {certificates.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                          No certificates found.
                        </div>
                      ) : (
                        certificates.map((certificate) => (
                          <div key={certificate.id} className="dash-inner bg-white p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-2">{certificate.internship}</p>
                                <h3 className="text-sm font-bold text-gray-900">{certificate.studentName}</h3>
                                <p className="mt-1 text-xs text-gray-500">{certificate.email}</p>
                                <p className="mt-3 text-sm text-gray-600">{certificate.certificateId}</p>
                                <p className="mt-1 text-xs text-gray-500">Issued {new Date(certificate.issuedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                              </div>

                              <div className="flex flex-wrap gap-2 shrink-0">
                                <Link href={certificate.viewUrl} className="btn-secondary btn-sm gap-2">
                                  <BadgeCheck className="h-4 w-4" /> View
                                </Link>
                                <a href={certificate.downloadUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm gap-2">
                                  <Download className="h-4 w-4" /> Download
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="dash-inner bg-white p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Quick verify</p>
                        <p className="text-sm text-gray-500">Confirm any certificate ID manually without leaving the admin panel.</p>
                      </div>

                      <form onSubmit={verifyCertificate} className="space-y-3">
                        <input 
                          value={certificateId} 
                          onChange={(e) => setCertificateId(e.target.value)} 
                          className="input-base font-mono text-sm" 
                          placeholder="e.g. CERT-12345678" 
                        />
                        <button type="submit" className="btn-primary btn-sm w-full justify-center gap-2" disabled={busy || !certificateId.trim()}>
                          <BadgeCheck className="h-4 w-4" /> Verify
                        </button>
                      </form>

                      {certificateResult && (
                        <div className={`p-4 rounded-2xl border ${certificateResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          <div className="flex items-center gap-3 mb-3">
                            {certificateResult.valid ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : null}
                            <p className={`font-bold ${certificateResult.valid ? "text-green-800" : "text-red-800"}`}>
                              {certificateResult.valid ? "Valid Document" : "Invalid or Not Found"}
                            </p>
                          </div>

                          {certificateResult.valid && (
                            <div className="space-y-2 text-sm text-green-800">
                              <p><span className="font-medium opacity-70">Student:</span> {certificateResult.studentName}</p>
                              <p><span className="font-medium opacity-70">Program:</span> {certificateResult.internship}</p>
                              {certificateResult.college && <p><span className="font-medium opacity-70">College:</span> {certificateResult.college}</p>}
                              {certificateResult.issueDate && <p><span className="font-medium opacity-70">Issued:</span> {new Date(certificateResult.issueDate).toLocaleDateString()}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* === TICKETS TAB === */}
              {activeTab === "tickets" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-gray-900">Support Queue</h2>
                      <p className="mt-1 text-sm text-gray-500">Review messages, send replies, and move requests to resolved.</p>
                    </div>
                    <select 
                      value={ticketFilter} 
                      onChange={(e) => setTicketFilter(e.target.value)} 
                      className="text-sm border-gray-200 rounded-lg bg-gray-50 font-medium py-1.5 focus:ring-green-500"
                    >
                      <option value="">All Tickets</option>
                      <option value="OPEN">Open Only</option>
                      <option value="IN_PROGRESS">In Progress</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {tickets.length === 0 ? (
                      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                        No support tickets match this filter.
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <div key={ticket.id} className="dash-inner bg-white p-5 space-y-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                                <StatusBadge status={ticket.status} />
                              </div>
                              <p className="text-xs text-gray-500">From: {ticket.user?.name || ticket.userId}</p>
                            </div>
                            <select 
                              value={ticket.status} 
                              onChange={(e) => updateTicket(ticket.id, e.target.value)} 
                              className="text-xs font-semibold uppercase tracking-wider rounded-md border-gray-200 bg-gray-50 py-1.5 w-[160px]"
                            >
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Message</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">{ticket.message}</p>
                            </div>

                            <form
                              className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3"
                              onSubmit={(event) => {
                                event.preventDefault();
                                replyTicket(ticket.id);
                              }}
                            >
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Reply</p>
                                <textarea
                                  value={replyDrafts[ticket.id] || ""}
                                  onChange={(e) => setReplyDrafts((current) => ({ ...current, [ticket.id]: e.target.value }))}
                                  className="input-base min-h-[120px] resize-y"
                                  placeholder="Write a support response here..."
                                />
                              </div>

                              {ticket.replyMessage && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Latest reply</p>
                                  <p className="text-sm text-emerald-800 whitespace-pre-wrap leading-6">{ticket.replyMessage}</p>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row gap-2">
                                <button 
                                  type="submit"
                                  className="btn-primary btn-sm gap-2 flex-1 justify-center"
                                  disabled={busy || replyingTicketId === ticket.id || !replyDrafts[ticket.id]?.trim()}
                                >
                                  <MessageSquare className="h-4 w-4" /> {replyingTicketId === ticket.id ? "Sending..." : "Send reply"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTicket(ticket.id, "RESOLVED")}
                                  className="btn-secondary btn-sm gap-2"
                                  disabled={busy || ticket.status === "RESOLVED"}
                                >
                                  <CheckCircle2 className="h-4 w-4" /> Resolve
                                </button>
                              </div>
                              {replySuccess && replyingTicketId === null && ticket.replyMessage && (
                                <p className="text-xs font-medium text-emerald-700">{replySuccess}</p>
                              )}
                            </form>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "emails" && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Email Pipeline Operations</h2>
                      <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                        Dispatch core funnel emails manually. Emails are only available to candidates who have completed their screening test.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-gray-50/80 rounded-xl border border-gray-200/60 p-1 flex items-center">
                        <button onClick={() => setEmailFilter("all")} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${emailFilter === 'all' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-600 hover:text-gray-900'}`}>All</button>
                        <button onClick={() => setEmailFilter("pending")} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${emailFilter === 'pending' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-600 hover:text-gray-900'}`}>Pending Action</button>
                        <button onClick={() => setEmailFilter("sent")} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${emailFilter === 'sent' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-600 hover:text-gray-900'}`}>Completed</button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 relative max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search candidates by name or email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="input-base pl-10"
                    />
                  </div>

                  {filteredEmailLeads.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                      <Mail className="mx-auto h-8 w-8 text-gray-400" />
                      <h3 className="mt-4 text-sm font-semibold text-gray-900">No candidates match your criteria.</h3>
                      <p className="mt-1 text-sm text-gray-500">Note: Only candidates who have completed the test appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border justify-center border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                            {EMAIL_STAGES.map((s) => (
                              <th key={s.key} scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEmailLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.email}</div>
                              </td>
                              {EMAIL_STAGES.map((stage) => {
                                const isSent = lead[stage.dbField];
                                const sendKey = `${lead.email}-${stage.key}`;
                                const isSending = emailSending === sendKey;
                                
                                return (
                                  <td key={stage.key} className="px-6 py-4 whitespace-nowrap">
                                    {isSent ? (
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${stage.color}`}>
                                        <CheckCircle2 className="h-4 w-4" /> Sent
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => sendEmail(lead, stage.key)}
                                        disabled={emailSending !== null}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 shadow-sm transition-all disabled:opacity-50"
                                      >
                                        {isSending ? <Loader2 className="h-3 w-3 animate-spin text-gray-500" /> : <Send className="h-3 w-3 text-gray-400" />}
                                        Send
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}