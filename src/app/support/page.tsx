"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, LifeBuoy, MessageSquare, RefreshCw } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      setTickets(await api.getTickets());
    } catch {
      setError("We could not load your support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Please add a subject and a message.");
      return;
    }

    try {
      setSending(true);
      setError("");
      await api.createTicket(subject.trim(), message.trim());
      setSubject("");
      setMessage("");
      await fetchTickets();
    } catch (err: any) {
      setError(err?.message || "Ticket creation failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell
      variant="student"
      title="Support center"
      subtitle="Create a ticket, track your request, and keep the internship flow moving"
      actions={null}
    >
      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <section className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <p className="section-label mb-3">Help desk</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Raise a support ticket</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Use this form for login issues, certificate questions, program access, or anything blocking your internship progress.</p>
            </div>
            <div className="rounded-3xl border border-green-100 bg-green-50 p-4 text-green-700"><LifeBuoy className="h-7 w-7" /></div>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-900">Subject</span>
              <input value={subject} onChange={(event) => setSubject(event.target.value)} className="input-base" placeholder="Certificate not visible" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-900">Message</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="input-base min-h-[180px] resize-y" placeholder="Describe the issue and include any details that might help the team respond faster." />
            </label>

            <button onClick={handleSubmit} disabled={sending} className="btn-primary btn-lg inline-flex w-full justify-center gap-2">
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
              {sending ? "Sending..." : "Submit ticket"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <p className="section-label mb-3">What to expect</p>
            <div className="space-y-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Fast triage</p>
                <p className="mt-1 text-sm text-gray-500">Your request is stored instantly and can be tracked below.</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Clear follow-up</p>
                <p className="mt-1 text-sm text-gray-500">Add all relevant context in one message to reduce back-and-forth.</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Status visible</p>
                <p className="mt-1 text-sm text-gray-500">Open, in progress, and resolved states appear in your ticket list.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <p className="section-label mb-3">My tickets</p>
                <h3 className="text-xl font-extrabold tracking-tight text-gray-900">Recent requests</h3>
              </div>
              <button onClick={fetchTickets} className="rounded-2xl border border-gray-200 bg-gray-50 p-2 text-gray-500 hover:bg-gray-100">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>
            ) : tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">No tickets yet.</div>
            ) : (
              <div className="mt-5 space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-900">{ticket.subject}</p>
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{ticket.status}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">{ticket.message}</p>
                    {ticket.replyMessage && (
                      <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Admin reply</p>
                        <p className="mt-1 text-sm leading-6 text-emerald-800 whitespace-pre-wrap">{ticket.replyMessage}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
