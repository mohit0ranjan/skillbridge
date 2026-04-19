"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function WorkspaceLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("admin")) {
      router.push("/admin/workspace");
    } else {
      router.push("/workspace/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans antialiased text-[#0F172A] justify-center items-center p-6">
      <div className="w-full max-w-[440px]">
        {/* Sleek Minimal Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
           <h1 className="text-[32px] md:text-[36px] font-extrabold tracking-tighter text-emerald-600 mb-3">
             SkillBridge <span className="text-[#0F172A]">Workspace</span>
           </h1>
           <p className="text-[15px] font-medium text-[#64748B]">Log in to continue to your assignments.</p>
        </div>

        {/* Minimal Login Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-[#E2E8F0]/80 p-8 sm:p-10 mb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[10px] border border-[#E2E8F0] px-4 py-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#334155] mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[10px] border border-[#E2E8F0] px-4 py-3 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all bg-white"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                   type="checkbox" 
                   className="w-3.5 h-3.5 rounded-sm border-[#CBD5E1] text-emerald-600 focus:ring-emerald-600 transition bg-white" 
                />
                <span className="text-[12px] text-[#475569] font-medium">Remember me</span>
              </label>
              <a href="#" className="text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition">
                Reset password
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white rounded-[10px] py-3 text-[13px] font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              Continue <ChevronRight size={14} className="opacity-90" strokeWidth={2.5} />
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div className="text-center text-[13px] text-[#64748B] font-medium">
           Don't have an intern account? <a href="#" className="text-emerald-700 hover:text-emerald-800 hover:underline">Contact support.</a>
        </div>
      </div>
    </div>
  );
}