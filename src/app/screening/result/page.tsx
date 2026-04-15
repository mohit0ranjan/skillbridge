import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScreeningCard from "../_components/ScreeningCard";
import ScreeningStepHeader from "../_components/ScreeningStepHeader";

export default function ScreeningResultPage() {
  return (
    <div className="min-h-screen font-sans pb-24 md:pb-0">
      <Navbar />
      <main className="pt-28 pb-12 px-4 sm:px-6">
        <ScreeningCard
          title="Test Submitted"
          subtitle="Your screening test has been received and queued for manual review."
        >
          <ScreeningStepHeader current={3} />

          <div className="dash-inner bg-emerald-50 border-emerald-200 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Submission complete</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Your test has been submitted
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
              Results will be shared via email after admin review. Please keep an eye on your inbox for the next step.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="dash-inner bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500 mb-3">What happens next</p>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>Our team will manually review your responses.</li>
                <li>If shortlisted, you&apos;ll receive a <strong>Selection Email</strong> within 24-48 hours.</li>
                <li>Follow the payment link in the email to secure your slot.</li>
                <li>Onboarding details and offer letter follow immediately after payment.</li>
              </ol>
            </div>
            <Link href="/" className="btn-secondary w-full justify-center">
              Back to Home
            </Link>
          </div>
        </ScreeningCard>
      </main>
      <Footer />
    </div>
  );
}
