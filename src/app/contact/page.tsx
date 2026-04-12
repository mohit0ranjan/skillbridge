import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Mail, MapPin, Clock3 } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-24 md:pt-32 md:pb-20">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <div className="section-label justify-center">Contact</div>
          <h1 className="text-[32px] md:text-[40px] font-bold text-gray-900 tracking-tight leading-[1.08] mb-3">
            Get in Touch
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            Need help? Send us a message and we&apos;ll get back to you within 24
            hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 max-w-[900px] mx-auto">
          {/* Form */}
          <div className="rounded-2xl bg-white border border-gray-200/80 p-7 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <form className="space-y-5">
              <label className="block text-[14px] font-medium text-gray-700">
                Name
                <input
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none focus:border-green-500 transition-colors"
                  placeholder="Your name"
                />
              </label>
              <label className="block text-[14px] font-medium text-gray-700">
                Email
                <input
                  type="email"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none focus:border-green-500 transition-colors"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-[14px] font-medium text-gray-700">
                Message
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] outline-none focus:border-green-500 transition-colors min-h-32 resize-y"
                  placeholder="How can we help?"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl text-white py-3 font-semibold transition-all shadow-[0_4px_12px_rgba(22,163,74,0.2)] cursor-pointer"
                style={{
                  background: "linear-gradient(145deg, #22c55e, #16a34a)",
                }}
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact info cards */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                Email Us
              </h3>
              <a
                href="mailto:support@skillbridge.in"
                className="text-[13px] text-green-600 hover:underline"
              >
                support@skillbridge.in
              </a>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <Clock3 className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                Response Time
              </h3>
              <p className="text-[13px] text-gray-500">
                We typically respond within 24 hours on business days.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                Location
              </h3>
              <p className="text-[13px] text-gray-500">
                Remote-first, India
              </p>
            </div>
          </div>
        </div>
      </main>

      <StickyMobileCTA />
      <Footer />
    </div>
  );
}
