"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShieldCheck, AlertCircle, Building2, Calendar, Award, Link2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("id") || "";

  const [query, setQuery] = useState(prefillId);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Auto-search if ID is in URL
  useEffect(() => {
    if (prefillId) {
      doSearch(prefillId);
    }
  }, [prefillId]);

  const doSearch = async (id: string) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const data = await api.verifyCertificate(id.trim());
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    doSearch(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 flex h-[60px] items-center px-6 sticky top-0 z-40">
        <div className="max-w-[800px] mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-gray-900 flex items-center justify-center text-white text-[13px] font-bold">S</span>
            <span className="text-[16px] font-semibold text-gray-900 tracking-tight">SkillBridge</span>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-gray-50 border border-gray-200">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Verification Portal</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[800px] mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center">
        <div className="text-center mb-10 w-full max-w-[480px]">
          <h1 className="text-[28px] md:text-[32px] font-semibold text-gray-900 tracking-tight mb-3">Verify Certificate</h1>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            Enter a certificate ID to verify its authenticity and view the holder&apos;s details.
          </p>
        </div>

        <div className="w-full max-w-[480px]">
          <form onSubmit={handleSearch} className="relative mb-10">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Certificate ID (e.g., SKILO-XXXXXXXXXX)"
              className="w-full h-14 rounded-[8px] border border-gray-300 bg-white shadow-sm pl-4 pr-14 text-[15px] text-gray-900 outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors uppercase placeholder:normal-case placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 w-11 rounded-[6px] bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {hasSearched && !loading && (
              <motion.div
                key={result ? "success" : "error"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {result && result.valid ? (
                  <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                        <span className="text-[12px] font-bold text-gray-700 tracking-widest uppercase">Verified</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">Certificate Valid</span>
                    </div>
                    
                    <div className="p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-[6px] bg-gray-100 border border-gray-200 flex items-center justify-center font-semibold text-gray-600 text-lg shrink-0">
                          {result.studentName?.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Student</p>
                          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight leading-none mb-1.5">{result.studentName}</h2>
                          {result.college && (
                            <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                              <Building2 className="w-3.5 h-3.5" />
                              {result.college}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-[6px] border border-gray-200">
                           <span className="text-[12px] text-gray-500 flex items-center gap-2"><Award className="w-4 h-4" /> Program</span>
                           <span className="text-[13px] font-semibold text-gray-900">{result.internship}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-[6px] border border-gray-200">
                           <span className="text-[12px] text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date Issued</span>
                           <span className="text-[13px] font-medium text-gray-900">{new Date(result.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-[6px] border border-gray-200">
                           <span className="text-[12px] text-gray-500 flex items-center gap-2"><Link2 className="w-4 h-4" /> Certificate ID</span>
                           <span className="text-[13px] font-mono font-semibold text-gray-900">{result.certificateId}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-[#10b981]">
                          <ShieldCheck className="w-5 h-5" />
                          <span className="text-[13px] font-semibold">This certificate is authentic and valid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[12px] border border-gray-200 p-8 text-center max-w-[400px] mx-auto shadow-sm">
                    <div className="w-10 h-10 bg-gray-50 rounded-[6px] border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <h2 className="text-[15px] font-semibold text-gray-900 mb-2">Certificate Not Found</h2>
                    <p className="text-[13px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                      No certificate found with ID <span className="font-mono text-gray-800 break-all">{query}</span>. Please check the ID and try again.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-6 text-center text-[11px] font-medium tracking-wide text-gray-400 mt-auto border-t border-gray-200 bg-white">
        <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#10b981] animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
