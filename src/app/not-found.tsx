import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-[#16a34a] mb-2">
        404
      </h1>
      <h2 className="text-3xl font-semibold text-[#0f172a] mb-4">
        Page Not Found
      </h2>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[#16a34a] px-8 py-3 font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2"
      >
        Go back home
      </Link>
    </div>
  );
}
