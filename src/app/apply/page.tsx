"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, Shield, Cpu, Code2, LineChart, Database, Loader2, Search } from "lucide-react";
import { internships } from "@/lib/skillo-data";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

type FormData = { fullName: string; email: string; college: string; year: string; password: string; confirmPassword: string };
type BackendInternship = {
  id: string;
  title: string;
  domain: string;
  duration: string;
  level: string;
  price: number;
  description?: string | null;
};

const STEPS = ["Program", "Details", "Review", "Payment"];

const iconMap: Record<string, any> = {
  Cpu: Cpu,
  Code2: Code2,
  LineChart: LineChart,
  Database: Database,
};

type CategoryTab = "All" | "Development" | "AI / Data" | "Design";

const CATEGORY_TABS: CategoryTab[] = ["All", "Development", "AI / Data", "Design"];

function getInternshipCategory(domain: string): Exclude<CategoryTab, "All"> {
  const value = domain.toLowerCase();
  if (
    value.includes("ai") ||
    value.includes("ml") ||
    value.includes("data") ||
    value.includes("analytics") ||
    value.includes("power bi") ||
    value.includes("tableau")
  ) {
    return "AI / Data";
  }

  if (value.includes("ui") || value.includes("ux") || value.includes("design")) {
    return "Design";
  }

  return "Development";
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

async function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  const existing = document.getElementById("razorpay-checkout-script") as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener("load", () => resolve(!!window.Razorpay), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    }>
      <ApplyPageInner />
    </Suspense>
  );
}

function ApplyPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, signup } = useAuth();
  const selectableInternships = useMemo(() => internships.filter((item) => item.id !== "test-internship"), []);

  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState(selectableInternships[0]?.id ?? internships[0].id);
  const [backendInternships, setBackendInternships] = useState<BackendInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<FormData>({
    fullName: user?.name || "",
    email: user?.email || "",
    college: user?.college || "",
    year: user?.year || "2",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const selectedFromUrl = searchParams.get("internship");
    if (selectedFromUrl && selectableInternships.some((item) => item.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
    }
  }, [searchParams, selectableInternships]);

  useEffect(() => {
    let isMounted = true;

    async function loadInternships() {
      try {
        const data = await api.getInternships();
        if (isMounted) {
          setBackendInternships(Array.isArray(data) ? data : []);
        }
      } catch {
        // Keep UI usable with local fallback data even if list fetch fails.
      }
    }

    loadInternships();
    return () => {
      isMounted = false;
    };
  }, []);

  const internship = useMemo(
    () => selectableInternships.find((i) => i.id === selectedId) ?? selectableInternships[0] ?? internships[0],
    [selectedId, selectableInternships]
  );

  const filteredInternships = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return selectableInternships.filter((item) => {
      const category = getInternshipCategory(item.domain);
      const categoryMatch = activeCategory === "All" || category === activeCategory;
      const searchMatch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchQuery, selectableInternships]);

  useEffect(() => {
    if (!filteredInternships.length) return;
    if (!filteredInternships.some((item) => item.id === selectedId)) {
      setSelectedId(filteredInternships[0].id);
    }
  }, [filteredInternships, selectedId]);

  const backendInternship = useMemo(() => {
    if (!backendInternships.length) return null;

    return (
      backendInternships.find((item) => item.id === selectedId) ||
      backendInternships.find((item) => item.title.toLowerCase() === internship.title.toLowerCase()) ||
      null
    );
  }, [backendInternships, selectedId, internship.title]);

  const canNext =
    step === 1 ||
    (step === 2 && form.fullName && form.email && form.college && (isAuthenticated || (form.password.length >= 8 && form.password === form.confirmPassword))) ||
    step === 3 ||
    step === 4;

  async function handlePayment() {
    setError("");
    setLoading(true);
    let modalOpened = false;

    try {
      // Step 1: If not logged in, create account first
      if (!isAuthenticated) {
        if (form.password !== form.confirmPassword) {
          throw new Error("Password and confirm password must match.");
        }

        await signup({
          name: form.fullName,
          email: form.email,
          password: form.password,
          college: form.college,
          year: form.year,
        });
      }

      // Step 2: Open Razorpay checkout in test/production if key is configured.
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const internshipIdForEnrollment = backendInternship?.id;
      const priceToPay = backendInternship?.price ?? internship.price;

      // If it's a free internship, skip payment gateway
      if (priceToPay === 0) {
        if (!internshipIdForEnrollment) {
          throw new Error("Selected free internship is unavailable right now. Please try again.");
        }
        await api.enroll(internshipIdForEnrollment);
        router.push("/dashboard?payment=success");
        return;
      }

      // Paid internship checks
      if (!razorpayKey) {
        throw new Error("Payment gateway is not currently configured. Please contact support.");
      }

      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout failed to load. Disable ad blocker and try again.");
      }

      const orderData = await api.createOrder(
        priceToPay / 100,
        undefined,
        internshipIdForEnrollment,
        {
          title: internship.title,
          domain: internship.domain,
          duration: internship.duration,
          level: internship.level,
          description: internship.description,
        }
      );

      const resolvedInternshipId = orderData.internshipId;

      if (!resolvedInternshipId) {
        throw new Error("Unable to resolve internship from server. Please try again.");
      }

      if ((orderData as any).alreadyProcessed || (orderData as any).accessGranted) {
        router.push("/dashboard?payment=success");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(orderData.amount * 100), // Razorpay expects paise
        currency: "INR",
        name: "SkillBridge",
        description: `${internship.title} Internship`,
        order_id: orderData.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
        },
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId,
              internshipId: resolvedInternshipId,
            });
            router.push("/dashboard?payment=success");
          } catch {
            setError("Payment verification failed. Please contact support.");
            router.push("/dashboard?payment=failed");
          }
          setLoading(false);
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
        },
        modal: {
          ondismiss: async () => {
            setLoading(false);
            try {
              await api.markPaymentFailed({
                razorpay_order_id: orderData.orderId,
                paymentId: orderData.paymentId,
                internshipId: resolvedInternshipId,
                reason: "Checkout closed before successful payment",
              });
            } catch {
              // Best-effort failure recording
            }
            router.push("/dashboard?payment=failed");
          },
        },
        theme: { color: "#10b981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response: any) => {
        try {
          await api.markPaymentFailed({
            razorpay_order_id: response?.error?.metadata?.order_id || orderData.orderId,
            paymentId: orderData.paymentId,
            internshipId: resolvedInternshipId,
            reason: response?.error?.description || "Payment failed",
          });
        } catch {
          // Best-effort failure recording
        }
        setLoading(false);
        router.push("/dashboard?payment=failed");
      });
      rzp.open();
      modalOpened = true;
      return; // Don't set loading to false here — Razorpay modal handles it
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      if (!modalOpened) {
        setLoading(false);
      }
    }
  }

  function next() {
    if (step < 4 && canNext) setStep((p) => p + 1);
    else if (step === 4) handlePayment();
  }

  function prev() {
    if (step > 1) setStep((p) => p - 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/programs" aria-label="Go back to programs" className="w-11 h-11 rounded border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#10b981] flex items-center justify-center text-gray-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-[14px] font-semibold text-gray-900">Enroll in a Program</h1>
          </div>
          <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
            Step <span className="text-gray-900">{step}</span> of 4
          </div>
        </div>
      </header>

      <main className="max-w-[980px] mx-auto px-4 sm:px-6 py-6 md:py-10 pb-28">
        {/* Progress Stepper */}
        <div className="mb-7">
          <div className="flex items-center justify-between relative">
             <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gray-200 z-0 hidden sm:block" />
             <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#10b981] z-0 hidden sm:block transition-all duration-300" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
            
            {STEPS.map((label, i) => {
              const num = i + 1;
              const active = step >= num;
              const current = step === num;
              
              return (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2 bg-gray-50 sm:bg-transparent sm:px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-[2px] transition-colors text-[12px] font-semibold ${
                    active ? "bg-white border-[#10b981] text-[#10b981]" : "bg-white border-gray-200 text-gray-300"
                  } ${current ? "ring-4 ring-[#10b981]/10" : ""}`}>
                    {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider hidden sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-50 border border-red-200 text-[13px] text-red-700 font-medium">{error}</div>
        )}

        {/* Step content */}
        <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden">
          <div className="p-5 md:p-7">
            {step === 1 && (
              <div>
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2">Select Program</h2>
                <p className="text-[13px] text-gray-500 mb-4">Pick quickly with filters and search.</p>

                <div className="mb-3 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Internship..."
                    className="w-full rounded-[9px] border border-gray-200 pl-9 pr-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981]"
                  />
                </div>

                <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {CATEGORY_TABS.map((tab) => {
                    const isActive = activeCategory === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveCategory(tab)}
                        className={`whitespace-nowrap min-h-10 px-3 py-2 rounded-full text-[12px] font-semibold border transition-colors ${
                          isActive
                            ? "border-[#10b981] bg-[#ecfdf5] text-[#047857]"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3">
                  {filteredInternships.map((item) => {
                    const sel = selectedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`text-left rounded-[10px] border p-3 transition-all ${
                          sel ? "border-[#10b981] bg-[#ecfdf5]/40 ring-1 ring-[#10b981]/70" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-gray-900 text-[12px] leading-snug line-clamp-2 min-h-[2rem]">{item.title}</h3>
                          {sel && <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500">{item.duration}</p>
                        <p className="text-[14px] font-bold text-gray-900 mt-0.5 mb-2.5">₹{item.price / 100}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full rounded-[7px] py-1.5 text-[12px] font-semibold border transition-colors ${
                            sel
                              ? "border-[#10b981] bg-[#10b981] text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {sel ? "Selected" : "Select"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {!filteredInternships.length && (
                  <div className="mt-4 rounded-[10px] border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
                    <p className="text-[13px] text-gray-600">No internship found. Try a different search or tab.</p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2">Your Details</h2>
                <p className="text-[14px] text-gray-500 mb-8">This information will appear on your certificate.</p>
                <div className="space-y-5 max-w-[480px]">
                  <div>
                    <label htmlFor="fullName" className="block text-[13px] font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full rounded-[8px] border border-gray-200 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
                      placeholder="Enter your full name" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
                    <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-[8px] border border-gray-200 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
                      placeholder="mail@domain.com" required />
                  </div>
                  <div>
                    <label htmlFor="college" className="block text-[13px] font-medium text-gray-700 mb-1.5">College</label>
                    <input id="college" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
                      className="w-full rounded-[8px] border border-gray-200 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
                      placeholder="Name of your college" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Year</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4+"].map((y) => (
                        <button key={y} type="button" onClick={() => setForm({ ...form, year: y })}
                          className={`flex-1 py-2 rounded-[8px] text-[13px] font-medium border transition-colors ${
                            form.year === y ? "border-[#10b981] bg-[#ecfdf5] text-[#065f46]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}>
                          Year {y}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div>
                      <label htmlFor="password" className="block text-[13px] font-medium text-gray-700 mb-1.5">Create Password</label>
                      <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full rounded-[8px] border border-gray-200 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
                        placeholder="Min 8 chars, Aa1@" minLength={8} required />
                      <p className="text-[12px] text-gray-500 mt-1">Must include uppercase, lowercase, number, and special character (@$!%*?&).</p>

                      <label htmlFor="confirmPassword" className="mt-4 block text-[13px] font-medium text-gray-700 mb-1.5">Confirm Password</label>
                      <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full rounded-[8px] border border-gray-200 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-colors"
                        placeholder="Re-enter password" minLength={8} required />
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p className="text-[12px] text-red-600 mt-1">Passwords do not match.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2">Review</h2>
                <p className="text-[14px] text-gray-500 mb-8">Verify your information before payment.</p>
                
                <div className="rounded-[12px] border border-gray-200 p-6 space-y-4 max-w-[500px]">
                  <div className="pb-4 border-b border-gray-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-[8px] bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                       {iconMap[internship.iconName] && (() => { const IC = iconMap[internship.iconName]; return <IC className="w-6 h-6" />; })()}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">{internship.title}</p>
                      <p className="text-[13px] text-gray-500 mt-1">{internship.duration}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      { label: "Name", value: form.fullName },
                      { label: "Email", value: form.email },
                      { label: "College", value: form.college },
                      { label: "Year", value: form.year ? `Year ${form.year}` : "" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-500">{row.label}</span>
                        <span className="text-[13px] font-medium text-gray-900">{row.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[13px] font-semibold text-gray-900">Total</span>
                    <span className="text-[18px] font-bold text-gray-900">₹{internship.price / 100}</span>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2">Payment</h2>
                <p className="text-[14px] text-gray-500 mb-8">Complete payment to start your internship.</p>
                
                <div className="max-w-[400px]">
                  <div className="rounded-[12px] border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <span className="text-[14px] font-medium text-gray-600">Program Fee</span>
                      <span className="text-[24px] font-bold text-gray-900">₹{internship.price / 100}</span>
                    </div>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        All tasks & resources included
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        Verified certificate on completion
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        100% refund if certificate not delivered
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-[8px] flex items-start gap-3">
                    <Shield className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-600 leading-relaxed">
                      Payments are securely processed via Razorpay with 256-bit encryption. We never store your payment details.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          {step === 1 ? (
            <div className="hidden" />
          ) : (
            <div className="bg-gray-50 border-t border-gray-200 p-4 sm:p-6 md:px-10 flex items-center justify-between">
            <button type="button" onClick={prev} disabled={step === 1}
              className="px-4 py-2 rounded-[6px] text-[13px] font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Go Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext || loading}
              className="px-5 py-2.5 rounded-[6px] bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-[13px] focus:outline-none focus:ring-2 focus:ring-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : step === 4 ? (
                `Pay ₹${internship.price / 100}`
              ) : (
                "Continue"
              )}
            </button>
            </div>
          )}
        </div>
      </main>

      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="max-w-[980px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Selected Internship</p>
              <p className="text-[13px] font-semibold text-gray-900 truncate">{internship.title}</p>
            </div>
            <button
              type="button"
              onClick={next}
              className="shrink-0 min-h-11 px-4 py-2.5 rounded-[8px] bg-[#10b981] hover:bg-[#059669] text-white text-[12px] md:text-[13px] font-semibold transition-colors"
            >
              Continue to Payment ₹{internship.price / 100}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
