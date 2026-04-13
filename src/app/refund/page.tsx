import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | SkillBridge",
  description: "SkillBridge internship refund policy and support steps.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#0f172a]">
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Refund Policy</h1>
        <p className="mt-4 text-sm text-slate-600">
          We review every refund request fairly. If you were charged but access was not granted,
          contact support with your payment ID and order ID.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">How to request a refund</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Open a support ticket from your dashboard.</li>
            <li>Include your Razorpay payment ID and order ID.</li>
            <li>Share the reason for refund.</li>
            <li>Our team validates payment and responds within 3-5 business days.</li>
          </ol>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Payment verification issues</h2>
          <p className="mt-2 text-sm text-slate-700">
            If payment succeeded at Razorpay but access is missing, do not retry multiple payments.
            Contact support so we can reconcile your order securely.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
