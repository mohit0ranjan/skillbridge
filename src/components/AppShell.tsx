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
      if (pathname.startsWith('/workspace') && pathname !== '/workspace/login') {
        router.replace('/workspace/login');
      } else {
        router.replace(variant === "admin" ? "/admin" : "/login");
      }
      return;
    }
    if (variant === "admin" && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, loading, router, variant, pathname]);

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
        <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[#E2E8F0] bg-[#F8F9FA] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 h-16 mt-2">
              <Link href={variant === "admin" ? "/admin/dashboard" : "/dashboard"} className="flex items-center" onClick={() => setMobileOpen(false)}>
                <div className="w-5 h-5 rounded-[6px] bg-emerald-600 mr-3 shadow-sm shrink-0"></div>
                <span className="font-bold text-[16px] text-emerald-600 tracking-tight leading-none">
                  SkillBridge <span className="text-[#0F172A] font-semibold">{variant === "admin" ? "Admin" : "Workspace"}</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-6">
              <p className="px-3 pb-3 text-[11px] font-medium text-gray-400">Overview</p>
              <div className="space-y-0.5">
                {navItems.map((item) => {
                  const hrefPath = item.href.split("#")[0];
                  const hrefHash = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";
                  const active = item.href === "/"
                    ? pathname === "/"
                    : hrefHash
                      ? pathname === hrefPath && currentHash === hrefHash
                      : pathname.startsWith(item.href);
                      
                  const isSamePageHash = hrefHash && pathname === hrefPath;
                  
                  if (isSamePageHash) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                          active 
                            ? "bg-white text-emerald-700 shadow-[0_1px_3px_rgb(0,0,0,0.04)] border border-gray-200/50" 
                            : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 border border-transparent"
                        }`}
                      >
                        <item.icon className={`h-[15px] w-[15px] ${active ? "text-emerald-600" : "text-gray-400"}`} strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                        active 
                          ? "bg-white text-emerald-700 shadow-[0_1px_3px_rgb(0,0,0,0.04)] border border-gray-200/50" 
                          : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 border border-transparent"
                      }`}
                    >
                      <item.icon className={`h-[15px] w-[15px] ${active ? "text-emerald-600" : "text-gray-400"}`} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User card — bottom */}
            <div className="p-3 mb-2 border-t border-[#E2E8F0]/60 mx-3">
              <button 
                onClick={logout} 
                className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50 rounded-lg transition-colors w-full"
              >
                <LogOut size={15} strokeWidth={2} />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-[#0F172A]/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ─── Main Content ─── */}
        <div className="flex min-h-screen flex-1 flex-col md:pl-[260px] bg-white">
          {/* Header */}
          <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 lg:px-12 shrink-0 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex h-9 w-9 -ml-2 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8F9FA] hover:text-[#0F172A] md:hidden transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight text-[#0F172A] leading-tight">{title}</h1>
                {subtitle && <p className="text-[13px] font-medium text-[#64748B] hidden sm:block mt-0.5">{subtitle}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {actions && <div className="flex items-center gap-3 mr-2">{actions}</div>}
              
              <div className="hidden sm:flex items-center gap-3 cursor-pointer hover:bg-[#F8F9FA] py-1.5 px-2 rounded-lg transition-colors border border-transparent hover:border-[#E2E8F0]/60">
                 <div className="text-[13px] text-[#334155] font-medium">
                   {user?.name || (variant === "admin" ? "Administrator" : "Student")}
                 </div>
                 <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-[11px] shadow-sm">
                   {initials}
                 </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-8 md:px-12 lg:px-20 max-w-6xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
