"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScreeningCard from "../_components/ScreeningCard";
import ScreeningStepHeader from "../_components/ScreeningStepHeader";

type ApplyForm = {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
};

const initialForm: ApplyForm = {
  name: "",
  email: "",
  phone: "",
  college: "",
  year: "",
  branch: "",
};

function InputField(props: {
  label: string;
  name: keyof ApplyForm;
  value: string;
  onChange: (name: keyof ApplyForm, value: string) => void;
  type?: string;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-gray-700">{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(event) => props.onChange(props.name, event.target.value)}
        placeholder={props.placeholder}
        className="input-base"
        required
      />
    </label>
  );
}

export default function ScreeningApplyPage() {
  const router = useRouter();
  const [form, setForm] = useState<ApplyForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: keyof ApplyForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/screening/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string; error?: string };

      if (!response.ok || !payload.success) {
        // If duplicate email (409), redirect to test page — the student already applied
        if (response.status === 409) {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem("screeningLeadEmail", form.email.trim().toLowerCase());
          }
          router.push("/screening/test");
          return;
        }
        setError(payload.error ? `${payload.message} (${payload.error})` : (payload.message || "Unable to submit your application."));
        return;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("screeningLeadEmail", form.email.trim().toLowerCase());
      }

      router.push("/screening/test");
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-0">
      <Navbar />
      <main className="pt-28 pb-12 px-4 sm:px-6">
        <ScreeningCard
          title="Screening Application"
          subtitle="Complete this short form to enter the SkillBridge screening funnel."
        >
          <ScreeningStepHeader current={1} />

          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={submitForm}>
            <div className="sm:col-span-2">
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            <InputField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
            />

            <InputField
              label="College"
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="Your college name"
            />

            <InputField
              label="Year"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 1st Year"
            />

            <div className="sm:col-span-2">
              <InputField
                label="Branch"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                placeholder="e.g. CSE / ECE / Mechanical"
              />
            </div>

            {error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-lg w-full"
              >
                {submitting ? "Submitting..." : "Continue to Screening Test"}
              </button>
            </div>
          </form>
        </ScreeningCard>
      </main>
      <Footer />
    </div>
  );
}
