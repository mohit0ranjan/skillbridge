"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    // Only auto-redirect if the user is already authenticated on initial page load
    if (isAuthenticated && user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router, user?.role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const auth = await login(email, password);
      if (auth.role !== "ADMIN") {
        logout();
        setError("This account does not have admin access.");
        return;
      }
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.08),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-gray-900">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden lg:flex flex-col justify-between px-10 py-12 xl:px-14">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20 font-bold text-xl">
              S
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-gray-900">SkillBridge</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Admin access</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-green-700">
              <Sparkles className="h-4 w-4" /> Secure command center
            </p>
            <h1 className="text-5xl font-black tracking-tight text-gray-900 xl:text-[4.4rem] xl:leading-[1.02]">
              Minimal, secure control for the admin team.
            </h1>
            <p className="mt-6 max-w-[560px] text-lg leading-8 text-gray-500">
              Sign in to manage internships, approvals, certificates, users, and queries from one protected space.
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {[
              "Backend role checks protect every admin route",
              "Route protection redirects unauthorized users out of the console",
              "Fast access key remains optional for local admin workflows",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[460px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase flex items-center gap-3 mb-3 text-green-600">
                  <span className="w-6 h-px block bg-green-600"></span>
                  Admin Portal
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to continue</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Use your admin email and password to open the dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-gray-400">
                <LockKeyhole className="h-6 w-6" />
              </div>
            </div>

            {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Email address</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="input-base"
                  placeholder="admin@skillbridge.in"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">Password</span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="input-base"
                  placeholder="Your admin password"
                  required
                />
              </label>


              <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 mt-4">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {loading ? "Opening dashboard..." : "Open admin dashboard"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-4 text-xs font-semibold text-gray-500">
              <Link href="/login" className="text-green-600 hover:text-green-700 hover:underline">
                Student sign in
              </Link>
              <span>Protected route</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
