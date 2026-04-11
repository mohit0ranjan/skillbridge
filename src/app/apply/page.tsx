"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, ArrowRight, Shield, Mail, Cpu, Code2, LineChart, Database, Loader2 } from "lucide-react";
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

  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState(internships[0].id);
  const [backendInternships, setBackendInternships] = useState<BackendInternship[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    if (selectedFromUrl && internships.some((item) => item.id === selectedFromUrl)) {
      setSelectedId(selectedFromUrl);
    }
  }, [searchParams]);

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

  const internship = useMemo(() => internships.find((i) => i.id === selectedId) ?? internships[0], [selectedId]);

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

      if (!internshipIdForEnrollment) {
        throw new Error("Selected internship is unavailable right now. Please try again.");
      }

      // If it's a free internship, skip payment gateway
      if (priceToPay === 0) {
        await api.enroll(internshipIdForEnrollment);
        setSubmitted(true);
        setLoading(false);
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

      const orderData = await api.createOrder(priceToPay / 100, undefined, internshipIdForEnrollment);

      if ((orderData as any).alreadyProcessed || (orderData as any).accessGranted) {
        setSubmitted(true);
        setLoading(false);
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
                internshipId: internshipIdForEnrollment,
              });
              setSubmitted(true);
            } catch {
              setError("Payment verification failed. Please contact support.");
              router.push("/dashboard?payment=failed");
            }
            setLoading(false);
          },
          modal: {
            ondismiss: async () => {
              setLoading(false);
              try {
                await api.markPaymentFailed({
                  razorpay_order_id: orderData.orderId,
                  paymentId: orderData.paymentId,
                  internshipId: internshipIdForEnrollment,
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
              internshipId: internshipIdForEnrollment,
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

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 font-sans">
        <div className="w-full max-w-[480px] bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#10b981] h-2 w-full" />
          <div className="p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-[12px] bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
            </div>

            <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight mb-2">
              You&apos;re In!
            </h1>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
              You&apos;ve been enrolled in {internship.title}. Check your email for confirmation details.
            </p>

            <div className="rounded-[12px] border border-gray-200 bg-gray-50 p-5 mb-8 text-left text-[14px]">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Confirmation Sent</p>
                  <p className="text-[12px] text-gray-500">Details sent to {form.email || "your email"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Program</span>
                  <span className="font-semibold text-gray-900">{internship.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium text-gray-900">{internship.duration}</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-[8px] text-[14px] transition-colors"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/programs" aria-label="Go back to programs" className="w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#10b981] flex items-center justify-center text-gray-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-[14px] font-semibold text-gray-900">Enroll in a Program</h1>
          </div>
          <div className="text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
            Step <span className="text-gray-900">{step}</span> of 4
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 md:py-16">
        {/* Progress Stepper */}
        <div className="mb-12">
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
          <div className="mb-6 p-3 rounded-[8px] bg-red-50 border border-red-200 text-[13px] text-red-700 font-medium">{error}</div>
        )}

        {/* Step content */}
        <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            {step === 1 && (
              <div>
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2">Select Program</h2>
                <p className="text-[14px] text-gray-500 mb-8">Choose the internship you want to join.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {internships.map((item) => {
                    const sel = selectedId === item.id;
                    const IconComp = iconMap[item.iconName] || Code2;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`text-left rounded-[12px] border p-5 transition-all outline-none ${
                          sel ? "border-[#10b981] bg-[#ecfdf5]/30 ring-1 ring-[#10b981]" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${sel ? "bg-[#10b981] text-white" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          {sel && <CheckCircle2 className="w-5 h-5 text-[#10b981]" />}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-[15px] mb-1">{item.title}</h3>
                        <p className="text-[12px] text-gray-500 mb-3">{item.duration}</p>
                        <p className="text-[16px] font-semibold text-gray-900 pt-3 border-t border-gray-100">₹{item.price}</p>
                      </button>
                    );
                  })}
                </div>
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
        </div>
      </main>
    </div>
  );
}
