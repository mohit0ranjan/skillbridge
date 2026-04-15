'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry in production
    console.error('Unhandled global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 text-red-600 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-8 w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl mb-3">
        Something went wrong!
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-[#16a34a] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#15803d] transition-colors focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-200 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
