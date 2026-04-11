"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── Bridge Logo SVG ─── */
function BridgeLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="url(#bridge-grad)" />
      <path
        d="M9 24Q20 10 31 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="10.5" y="23" width="2.8" height="8" rx="1" fill="#fff" />
      <rect x="26.7" y="23" width="2.8" height="8" rx="1" fill="#fff" />
      <line
        x1="9"
        y1="27"
        x2="31"
        y2="27"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
      <defs>
        <linearGradient id="bridge-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#22c55e" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const NAV = [
  { label: "Home", href: "/" },
  { label: "Internships", href: "/programs" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-[1120px]"
    >
      <div
        className={`relative rounded-2xl px-4 py-3 md:px-5 md:py-3.5 flex items-center justify-between backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "border border-neutral-200 bg-background/95 shadow-sm"
            : "border border-neutral-100/60 bg-background/80"
        }`}
      >
        {/* Top shine line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-light/20 to-transparent" />

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 relative z-10 group"
        >
          <BridgeLogo className="w-8 h-8 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-[22px] leading-none font-bold tracking-tight text-foreground">
            Skill
            <span className="text-brand">Bridge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 rounded-xl border border-neutral-200 bg-neutral-50 px-1 py-1">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? "text-brand bg-white shadow-sm"
                  : "text-muted hover:text-foreground hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden md:block text-[13px] font-medium text-muted hover:text-foreground transition-colors px-3 py-2"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:block text-[13px] font-medium text-muted hover:text-foreground transition-colors px-3 py-2"
            >
              Log in
            </Link>
          )}
          <Link
            href="/programs"
            className="hidden md:inline-flex btn-primary btn-sm"
          >
            Browse Internships
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-xl border border-neutral-200 bg-background text-foreground flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="w-[18px] h-[18px]" />
            ) : (
              <Menu className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden mt-2 rounded-2xl border border-neutral-200 bg-background/95 backdrop-blur-xl shadow-lg p-4"
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-brand bg-brand-surface font-medium"
                    : "text-muted hover:bg-neutral-50 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block text-center py-2.5 text-sm text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Log in
              </Link>
              <Link
                href="/programs"
                onClick={() => setOpen(false)}
                className="btn-primary w-full text-center"
              >
                Browse Internships
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
