"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ScreeningCard from "../_components/ScreeningCard";

export default function ScreeningConfirmPage() {
  const clickTrackedRef = useRef(false);
  const [movingOn, setMovingOn] = useState(false);
  const [notice, setNotice] = useState("");

  const email = useMemo(() => {
    if (typeof window === "undefined") return "";

    const params = new URLSearchParams(window.location.search);
    const urlEmail = (params.get("email") || "").trim().toLowerCase();
    if (urlEmail) return urlEmail;

    return (window.sessionStorage.getItem("screeningLeadEmail") || "").trim().toLowerCase();
  }, []);

  useEffect(() => {
    if (!email || clickTrackedRef.current) return;
    clickTrackedRef.current = true;

    void fetch("/api/screening/confirm-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }, [email]);

  async function handleContinue() {
    if (!email) {
      setNotice("Email not found. Open this page from your screening email link.");
      return;
    }

    try {
      setMovingOn(true);
      setNotice("");

      const paymentUrl = process.env.NEXT_PUBLIC_SCREENING_PAYMENT_URL || "";
      if (paymentUrl && typeof window !== "undefined") {
        window.location.href = paymentUrl;
        return;
      }

      setNotice("Your selection has been confirmed. Payment instructions will be shared by email.");
    } catch {
      setNotice("Network issue while opening the payment step. Please try again.");
    } finally {
      setMovingOn(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#fef3c7_0,#fffbeb_42%,#ffffff_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <ScreeningCard
        title="Shortlisted"
        subtitle="Your selection has been captured and the next step is payment.">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="text-sm leading-relaxed text-green-800">
            You have been shortlisted. Keep an eye on your inbox for the payment link and onboarding instructions.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">Selection locked</h3>
            <p className="mt-2 text-sm text-slate-600">Your admin review status is now ready for the payment stage.</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">Payment next</h3>
            <p className="mt-2 text-sm text-slate-600">The Razorpay payment link will open after this step.</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">Onboarding follows</h3>
            <p className="mt-2 text-sm text-slate-600">Once payment is successful, onboarding details are sent automatically.</p>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Selection is valid for a limited time.</p>
          <p className="mt-1 text-sm text-amber-700">Please complete the payment step promptly.</p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={movingOn}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {movingOn ? "Opening payment..." : "Continue to payment"}
          </button>
        </div>

        {notice && <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-700">{notice}</p>}
      </ScreeningCard>
    </main>
  );
}
