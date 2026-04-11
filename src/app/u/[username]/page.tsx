import { Award, BriefcaseBusiness, FolderKanban, Share2 } from "lucide-react";
import { internships } from "@/lib/skillo-data";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function StudentProfilePage({ params }: PageProps) {
  const { username } = await params;
  const name = username
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-[1040px] mx-auto space-y-6">
        <header className="rounded-[24px] border border-gray-100 bg-white p-7 shadow-[0_1px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-600 mt-1">Student • India</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="rounded-full border border-gray-200 px-3 py-1.5">2 Internships Completed</span>
              <span className="rounded-full border border-gray-200 px-3 py-1.5">3 Projects Built</span>
              <span className="rounded-full border border-gray-200 px-3 py-1.5">2 Certificates</span>
            </div>
          </div>
          <button className="rounded-[12px] border border-gray-200 px-4 py-2.5 text-sm text-gray-700 inline-flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
        </header>

        <section className="rounded-[24px] border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 inline-flex items-center gap-2"><BriefcaseBusiness className="w-5 h-5" />Internships Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.slice(0, 2).map((item) => (
              <article key={item.id} className="rounded-[16px] border border-gray-100 bg-[#fafafa] p-4">
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.duration} • {item.level}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 inline-flex items-center gap-2"><FolderKanban className="w-5 h-5" />Projects Built</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="rounded-[14px] border border-gray-100 bg-[#fafafa] px-4 py-3">Landing page with responsive sections and deployed link</li>
            <li className="rounded-[14px] border border-gray-100 bg-[#fafafa] px-4 py-3">Social campaign plan with post creatives</li>
            <li className="rounded-[14px] border border-gray-100 bg-[#fafafa] px-4 py-3">Analytics dashboard with summary insights</li>
          </ul>
        </section>

        <section className="rounded-[24px] border border-gray-100 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 inline-flex items-center gap-2"><Award className="w-5 h-5" />Certificates</h2>
          <div className="space-y-3">
            <div className="rounded-[14px] border border-gray-100 bg-[#fafafa] px-4 py-3 flex items-center justify-between">
              <span className="text-gray-700">Web Development Internship Certificate</span>
              <span className="text-sm font-semibold text-[#0f8d61]">Verified</span>
            </div>
            <div className="rounded-[14px] border border-gray-100 bg-[#fafafa] px-4 py-3 flex items-center justify-between">
              <span className="text-gray-700">Digital Marketing Internship Certificate</span>
              <span className="text-sm font-semibold text-[#0f8d61]">Verified</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
