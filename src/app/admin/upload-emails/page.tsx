"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet, Loader2, Upload, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";

type QueueRow = { name: string; email: string };

function parseDelimitedText(text: string): QueueRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const hasHeader = /email|name/i.test(lines[0]);
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => line.split(/[\t,;]/).map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .map((cells) => {
      const [first, second] = cells;
      const firstLooksEmail = first.includes("@");
      const secondLooksEmail = second.includes("@");

      if (firstLooksEmail && !secondLooksEmail) {
        return { email: first, name: second };
      }

      return { name: first, email: second };
    })
    .filter((row) => row.name && row.email);
}

export default function AdminUploadEmailsPage() {
  const [sourceText, setSourceText] = useState("");
  const [previewRows, setPreviewRows] = useState<QueueRow[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const previewCount = previewRows.length;

  const buildPreview = async () => {
    try {
      setLoadingPreview(true);
      setError("");
      setMessage("");
      const rows = parseDelimitedText(sourceText);
      setPreviewRows(rows);
      if (rows.length === 0) {
        setError("No valid name/email rows found.");
      }
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setMessage("");
      const text = await file.text();
      setSourceText(text);
      setPreviewRows(parseDelimitedText(text));
    } catch {
      setError("Unable to read this file. Save it as CSV or paste the rows directly from Excel.");
      setPreviewRows([]);
    } finally {
      event.target.value = "";
    }
  };

  const uploadRows = async () => {
    if (previewRows.length === 0) {
      setError("Preview some rows first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const token = typeof window !== "undefined" ? localStorage.getItem("sb_token") : "";
      if (!token) {
        setError("Admin session not found.");
        return;
      }

      const response = await fetch("/api/admin/upload-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows: previewRows }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string; data?: { inserted?: number } };
      if (!response.ok || !payload.success) {
        setError(payload.message || "Upload failed.");
        return;
      }

      setMessage(payload.message || `Queued ${payload.data?.inserted || previewRows.length} emails.`);
      setPreviewRows([]);
      setSourceText("");
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const pasteHint = useMemo(() => {
    return "Paste two columns from Excel or provide CSV rows with Name, Email.";
  }, []);

  return (
    <AppShell
      variant="admin"
      title="Upload Emails"
      subtitle="Stage outreach rows into the safe daily email queue."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/screening-actions" className="btn-secondary btn-sm gap-2">
            Actions <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/screening-leads" className="btn-primary btn-sm gap-2">
            Leads <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Queue mode</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">Pending</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Daily cap</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">10</p></div>
          <div className="dash-metric"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Spacing</p><p className="mt-2 text-3xl font-black tracking-tight text-gray-900">30-60s</p></div>
        </div>

        <div className="dash-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> Zoho safe batch upload
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900">CSV / Excel row import</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{pasteHint}</p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
              <Upload className="h-4 w-4" />
              Upload file
              <input type="file" accept=".csv,.txt,.tsv,.xlsx,.xls" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                className="input-base min-h-[320px] font-mono text-sm"
                placeholder={"Name, Email\nAditi Sharma, aditi@example.com\nRahul Verma, rahul@example.com"}
              />

              <div className="flex flex-wrap gap-2">
                <button onClick={buildPreview} type="button" className="btn-secondary btn-sm gap-2" disabled={loadingPreview}>
                  {loadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />} Build Preview
                </button>
                <button onClick={uploadRows} type="button" className="btn-primary btn-sm gap-2" disabled={uploading || previewRows.length === 0}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Queue Emails
                </button>
              </div>

              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
              {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Preview</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight text-gray-900">{previewCount} rows</h3>
                </div>
              </div>

              {previewRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  No preview yet.
                </div>
              ) : (
                <div className="max-h-[420px] overflow-auto rounded-2xl bg-white ring-1 ring-gray-100">
                  <table className="min-w-full border-separate border-spacing-y-1">
                    <thead className="sticky top-0 bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr key={`${row.email}-${row.name}`} className="rounded-xl bg-gray-50">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
