"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Search, CalendarDays, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="dash-metric">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-black tracking-tight text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 text-right">{hint}</p>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchUsers = async (search = "") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sb_token") : "";
    if (!token) {
      setError("Admin session not found.");
      setUsers([]);
      setLoading(false);
      return;
    }

    console.log(`[FETCH USERS] /api/admin/users query=${search.trim() || "<none>"}`);
    const response = await fetch(`/api/admin/users${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const payload = (await response.json()) as { success?: boolean; message?: string; data?: AdminUserRow[] };

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "Failed to load users.");
    }

    setUsers(Array.isArray(payload.data) ? payload.data : []);
  };

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError("");
        await fetchUsers("");
      } catch (loadError) {
        console.error("[API ERROR] [FETCH USERS]", loadError);
        setError(loadError instanceof Error ? loadError.message : "Unable to load users.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === "ADMIN").length;
    return {
      total: users.length,
      admins,
      students: users.length - admins,
    };
  }, [users]);

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSearching(true);
      setError("");
      await fetchUsers(query);
    } catch (searchError) {
      console.error("[API ERROR] [FETCH USERS search]", searchError);
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <AppShell
      variant="admin"
      title="Users"
      subtitle="Search the full user table by email and inspect roles at a glance."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/screening-leads" className="btn-secondary btn-sm gap-2">
            Screening Leads <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/admin/screening-actions" className="btn-secondary btn-sm gap-2">
            Actions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Users" value={summary.total} hint="all accounts" />
          <MetricCard label="Admins" value={summary.admins} hint="protected roles" />
          <MetricCard label="Students" value={summary.students} hint="active learners" />
        </div>

        <div className="dash-card p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Admin CRM</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">User directory</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Search uses a lowercase email match and falls back to the full user list when the query is empty.
              </p>
            </div>

            <form onSubmit={runSearch} className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="relative flex-1 lg:w-[360px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="input-base pl-10"
                  placeholder="Search by email"
                />
              </label>
              <button type="submit" disabled={searching} className="btn-primary btn-sm gap-2">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-20 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
          ) : users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Role</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900">{user.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{user.email}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${user.role === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {new Date(user.createdAt).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
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
