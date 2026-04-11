export default function LoadingInternshipDetail() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-44 w-full bg-gray-200 rounded-2xl" />
          <div className="h-44 w-full bg-gray-200 rounded-2xl" />
        </div>
        <div className="h-64 w-full bg-gray-200 rounded-2xl" />
      </div>
    </main>
  );
}
