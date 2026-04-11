"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isAuthenticated, user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("2");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, router, user?.role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (mode === "login") {
        const auth = await login(email, password);
        router.replace(auth.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      } else {
        const auth = await signup({ name, email, password, college, year });
        router.replace(auth.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_30%),linear-gradient(180deg,#fafaf8_0%,#ffffff_100%)] flex font-sans">
      <div className="hidden lg:flex lg:w-[46%] p-10 xl:p-14">
        <div className="flex w-full flex-col justify-between rounded-[36px] border border-gray-200 bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white font-bold shadow-lg shadow-green-500/20">S</div>
              <div>
                <p className="text-lg font-bold tracking-tight text-gray-900">SkillBridge</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Virtual internships</p>
              </div>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="section-label">Student and admin access</p>
              <h1 className="text-5xl font-black tracking-tight text-gray-900">A clean workspace for learning, review, and certification.</h1>
              <p className="mt-5 text-lg leading-8 text-gray-500">Sign in to continue your internship journey, track week-based progress, submit your final project, and monitor review status in one place.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-gray-200 bg-gray-50 p-6">
            {[
              "Week-based dashboards and progress tracking",
              "Review-first project submission flow",
              "Public certificate verification and support tickets",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-[460px] rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="section-label mb-3">Welcome back</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{mode === "login" ? "Sign in" : "Create account"}</h2>
              <p className="mt-2 text-sm text-gray-500">{mode === "login" ? "Continue where you left off." : "Start your internship journey."}</p>
            </div>
            <Sparkles className="h-6 w-6 text-green-600" />
          </div>

          <div className="mb-8 grid grid-cols-2 rounded-2xl border border-gray-200 bg-gray-50 p-1">
            {(["login", "signup"] as const).map((item) => (
              <button
                key={item}
                onClick={() => { setMode(item); setError(""); }}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${mode === item ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
              >
                {item === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-900">Full name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="input-base" placeholder="Your full name" required />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-900">College</span>
                  <input value={college} onChange={(event) => setCollege(event.target.value)} className="input-base" placeholder="Your college" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-900">Year</span>
                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3", "4+"].map((item) => (
                      <button key={item} type="button" onClick={() => setYear(item)} className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition-all ${year === item ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </label>
              </>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-900">Email address</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="input-base" placeholder="mail@domain.com" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-900">Password</span>
              <div className="relative">
                <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPwd ? "text" : "password"} className="input-base pr-12" placeholder="••••••••" required minLength={8} />
                <button type="button" onClick={() => setShowPwd((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full inline-flex gap-2 justify-center">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              {loading ? (mode === "login" ? "Signing in..." : "Creating account...") : (mode === "login" ? "Sign in" : "Create account")}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {mode === "login" ? "Need an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="font-semibold text-gray-900 hover:underline">
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
