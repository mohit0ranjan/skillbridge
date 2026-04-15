"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Award,
  Send,
  LifeBuoy,
  ShieldCheck,
  Users,
  FileText,
  Upload,
  Home,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export type ShellVariant = "student" | "admin";

type AppShellProps = {
  variant: ShellVariant;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const studentNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Workspace", href: "/workspace", icon: Briefcase },
  { label: "Certificate", href: "/certificate", icon: Award },
  { label: "Submit Project", href: "/submit-project", icon: Send },
  { label: "Support", href: "/support", icon: LifeBuoy },
  { label: "Home", href: "/", icon: Home },
];

const adminNav = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Screening Leads", href: "/admin/screening-leads", icon: Users },
  { label: "Screening Actions", href: "/admin/screening-actions", icon: Send },
  { label: "User Directory", href: "/admin/users", icon: Users },
  { label: "Email Uploads", href: "/admin/upload-emails", icon: Upload },
  { label: "Submissions", href: "/admin/dashboard#submissions", icon: FileText },
  { label: "Internships", href: "/admin/dashboard#overview", icon: Briefcase },
  { label: "Users", href: "/admin/dashboard#users", icon: Users },
  { label: "Certificates", href: "/admin/dashboard#certificates", icon: ShieldCheck },
  { label: "Queries", href: "/admin/dashboard#tickets", icon: LifeBuoy },
];

function getInitials(name?: string | null) {
  if (!name) return "SB";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AppShell({ variant, title, subtitle, actions, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const navItems = useMemo(() => (variant === "admin" ? adminNav : studentNav), [variant]);
  const initials = getInitials(user?.name);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(variant === "admin" ? "/admin" : "/login");
      return;
    }
    if (variant === "admin" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, loading, router, variant]);

  useEffect(() => {
    const syncHash = () => setCurrentHash(typeof window !== "undefined" ? window.location.hash : "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  if (loading || !isAuthenticated || (variant === "admin" && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center mx-auto mb-3 text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        {/* ─── Sidebar ─── */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-gray-200 bg-white transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <Link href={variant === "admin" ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white font-bold text-sm">
                  S
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-gray-900">SkillBridge</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{variant === "admin" ? "Admin" : "Student"}</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4">
              <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Navigation</p>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const hrefPath = item.href.split("#")[0];
                  const hrefHash = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";
                  const active = item.href === "/"
                    ? pathname === "/"
                    : hrefHash
                      ? pathname === hrefPath && currentHash === hrefHash
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "bg-green-50 text-green-700 border border-green-100" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    >
                      <item.icon className={`h-4 w-4 ${active ? "text-green-600" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User card — bottom */}
            <div className="border-t border-gray-100 p-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="status-badge status-badge-success">
                    {variant === "admin" ? "Admin" : "Student"}
                  </span>
                  <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut className="h-3 w-3" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ─── Main Content ─── */}
        <div className="flex min-h-screen flex-1 flex-col md:pl-[260px]">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">{title}</h1>
                  {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {actions}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
