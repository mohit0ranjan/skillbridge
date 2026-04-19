"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function VerifyEmailLogic() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { fetchUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Verification link is missing or invalid.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        await api.verifyEmail({ token: token as string });
        if (isMounted) {
          setSuccess(true);
          await fetchUser(); // Refresh user state to show verified
          setTimeout(() => {
            if (isMounted) router.push("/dashboard");
          }, 3000);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to verify email. The link may have expired.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, router, fetchUser]);

  if (loading) {
    return (
      <div className="card max-w-md mx-auto p-12 text-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
        <p>Verifying your email address...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-md mx-auto p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
        <p className="text-gray-600">{error}</p>
        <Link href="/dashboard" className="btn-primary w-full inline-block mt-4">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card max-w-md mx-auto p-8 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
        <p className="text-gray-600">Your email address has been successfully verified. Redirecting to dashboard...</p>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="min-h-[80vh] flex flex-col justify-center px-4 py-12">
        <Suspense fallback={
          <div className="card max-w-md mx-auto p-8 text-center text-gray-500">
             <p>Loading...</p>
          </div>
        }>
          <VerifyEmailLogic />
        </Suspense>
      </div>
    </div>
  );
}
