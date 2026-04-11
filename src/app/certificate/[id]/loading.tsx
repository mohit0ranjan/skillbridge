import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CertificateLoadingPage() {
  return (
    <div className="min-h-screen font-sans bg-[#fafafa]">
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-6 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start animate-pulse">
          <section className="rounded-2xl border border-gray-200/80 bg-white p-6 md:p-8">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 space-y-4">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-10 w-72 bg-gray-200 rounded" />
              <div className="h-16 w-full bg-gray-200 rounded" />
              <div className="h-16 w-full bg-gray-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 w-full bg-gray-200 rounded" />
                <div className="h-16 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-gray-200/80 bg-white p-6">
            <div className="h-4 w-36 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
            <div className="h-10 w-full bg-gray-200 rounded mb-2" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
