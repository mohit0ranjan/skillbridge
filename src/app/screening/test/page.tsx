"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ───── Question Bank ───── */

type McqQuestion = { id: string; prompt: string; options: string[] };
type ShortQuestion = { id: string; prompt: string };

const MCQ_QUESTIONS: McqQuestion[] = [
  { id: "q1", prompt: "What is the correct syntax to print in C?", options: ['print("Hello")', 'cout << "Hello"', 'printf("Hello");', 'echo "Hello"'] },
  { id: "q2", prompt: "Which header file is required for printf()?", options: ["stdlib.h", "stdio.h", "math.h", "conio.h"] },
  { id: "q3", prompt: "Which is valid C++ output?", options: ['printf("Hello")', 'cout << "Hello";', 'print("Hello")', 'echo("Hello")'] },
  { id: "q4", prompt: "Size of int in most systems?", options: ["2 bytes", "4 bytes", "8 bytes", "Depends"] },
  { id: "q5", prompt: "Same function name with different parameters is called?", options: ["Encapsulation", "Inheritance", "Function Overloading", "Polymorphism"] },
  { id: "q6", prompt: "Declare variable in Python", options: ["int a = 10", "a := 10", "a = 10", "var a = 10"] },
  { id: "q7", prompt: "Output: print(type(10))", options: ["int", "<class 'int'>", "number", "integer"] },
  { id: "q8", prompt: "Keyword to define function", options: ["func", "define", "def", "function"] },
  { id: "q9", prompt: 'Output: print(3 * "Hi")', options: ["HiHiHi", "Error", "9", "Hi3"] },
  { id: "q10", prompt: "Hyperlink tag?", options: ["link", "a", "href", "url"] },
  { id: "q11", prompt: "CSS property for text color?", options: ["font-color", "text-color", "color", "background-color"] },
  { id: "q12", prompt: "CSS stands for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"] },
  { id: "q13", prompt: "Variable declaration keyword", options: ["var", "int", "define", "letvar"] },
  { id: "q14", prompt: 'Output: console.log(2 + "2")', options: ["4", "22", "Error", "undefined"] },
  { id: "q15", prompt: "Print in console", options: ["print()", "echo()", "console.log()", "log()"] },
];

const SHORT_QUESTIONS: ShortQuestion[] = [
  { id: "q16", prompt: "Difference between C and C++?" },
  { id: "q17", prompt: "What is a loop? Name one type." },
  { id: "q18", prompt: "Difference between HTML and CSS?" },
  { id: "q19", prompt: "What is JavaScript used for?" },
  { id: "q20", prompt: "Write logic to print numbers 1 to 5 (any language)" },
];

const ALL_QUESTIONS = [
  ...MCQ_QUESTIONS.map((q) => ({ ...q, type: "mcq" as const })),
  ...SHORT_QUESTIONS.map((q) => ({ ...q, type: "short" as const, options: undefined })),
];

const TEST_DURATION_SECONDS = 12 * 60;
const TEST_STORAGE_KEY = "screeningTestStateV2";

/* ───── Persisted State ───── */

type PersistedState = {
  mcqAnswers: Record<string, string>;
  shortAnswers: Record<string, string>;
  expiresAt: number;
  violations: number;
};

function readPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(TEST_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(TEST_STORAGE_KEY);
    return null;
  }
}

function secondsToClock(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ───── Exam Page ───── */

function ScreeningTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSubmittedRef = useRef(false);
  const initialPersisted = useMemo(() => readPersistedState(), []);

  // State
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>(() => initialPersisted?.mcqAnswers || {});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>(() => initialPersisted?.shortAnswers || {});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violations, setViolations] = useState(() => initialPersisted?.violations || 0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Timer: use persisted expiresAt or calculate fresh
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (initialPersisted?.expiresAt) {
      const remaining = Math.floor((initialPersisted.expiresAt - Date.now()) / 1000);
      return Math.max(0, remaining);
    }
    return TEST_DURATION_SECONDS;
  });

  // Derived
  const totalQuestions = ALL_QUESTIONS.length;
  const currentQ = ALL_QUESTIONS[currentIndex];
  const email = useMemo(() => {
    const queryEmail = (searchParams.get("email") || "").trim().toLowerCase();
    if (queryEmail) return queryEmail;
    if (typeof window === "undefined") return "";
    return (window.sessionStorage.getItem("screeningLeadEmail") || "").trim().toLowerCase();
  }, [searchParams]);

  const answeredMcq = useMemo(() => MCQ_QUESTIONS.filter((q) => Boolean(mcqAnswers[q.id])).length, [mcqAnswers]);
  const answeredShort = useMemo(() => SHORT_QUESTIONS.filter((q) => Boolean(shortAnswers[q.id]?.trim())).length, [shortAnswers]);
  const answeredTotal = answeredMcq + answeredShort;
  const progressPercent = Math.round((answeredTotal / totalQuestions) * 100);

  const isQuestionAnswered = useCallback(
    (qId: string) => Boolean(mcqAnswers[qId]) || Boolean(shortAnswers[qId]?.trim()),
    [mcqAnswers, shortAnswers],
  );

  /* ────── Persist state ────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      mcqAnswers,
      shortAnswers,
      expiresAt: Date.now() + secondsLeft * 1000,
      violations,
    };
    window.localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(payload));
  }, [mcqAnswers, shortAnswers, secondsLeft, violations]);

  /* ────── Submit handler ────── */
  const submitAssessment = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting) return;
      if (!email) {
        setError("Session not found. Please start from the application page.");
        return;
      }
      if (!isAutoSubmit && answeredMcq < MCQ_QUESTIONS.length) {
        setError("Please answer all MCQs before submitting.");
        return;
      }
      try {
        setSubmitting(true);
        setError("");
        const response = await fetch("/api/screening/submit-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            answers: { mcq: mcqAnswers, short: shortAnswers },
            autoSubmitted: isAutoSubmit,
            tabViolations: violations,
          }),
        });
        const payload = (await response.json()) as { success?: boolean; message?: string };
        if (!response.ok || !payload.success) {
          setError(payload.message || "Unable to submit test.");
          setSubmitting(false);
          return;
        }
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(TEST_STORAGE_KEY);
        }
        router.push("/screening/result");
      } catch {
        setError("Network issue. Please try again.");
        setSubmitting(false);
      }
    },
    [email, mcqAnswers, shortAnswers, submitting, violations, answeredMcq, router],
  );

  /* ────── Timer ────── */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            void submitAssessment(true);
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitAssessment]);

  /* ────── Tab-switch / visibility detection ────── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setViolations((v) => v + 1);
        setShowViolationWarning(true);
      }
    };
    const handleBlur = () => {
      setViolations((v) => v + 1);
      setShowViolationWarning(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  /* ────── Browser back-button blocking ────── */
  useEffect(() => {
    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", blockBack);
    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  /* ────── Before-unload warning ────── */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submitting) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submitting]);

  /* ────── Navigation ────── */
  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < totalQuestions) setCurrentIndex(idx);
    setShowPalette(false);
  };
  const goPrev = () => goToQuestion(currentIndex - 1);
  const goNext = () => goToQuestion(currentIndex + 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (answeredMcq < MCQ_QUESTIONS.length) {
      setError("Please answer all MCQs before submitting.");
      return;
    }
    setShowSubmitConfirm(true);
  };

  const timerUrgent = secondsLeft < 60;
  const timerWarning = secondsLeft < 180 && !timerUrgent;

  /* ————————————————————————————————————————————————
     Full-screen exam layout — NO navbar, NO footer
     ———————————————————————————————————————————————— */
  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 text-gray-900 font-sans overflow-hidden" style={{ zIndex: 9999 }}>
      {/* ═══ EXAM HEADER ═══ */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-green-600 text-white font-bold text-sm shadow-sm shrink-0">S</div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">SkillBridge Screening</p>
            <p className="text-[11px] text-gray-500 truncate">{email || "No session"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Violations badge */}
          {violations > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-700">{violations} violation{violations > 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-mono font-bold tracking-wider transition-colors ${
            timerUrgent
              ? "bg-red-600 text-white animate-pulse"
              : timerWarning
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-800"
          }`}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {secondsToClock(secondsLeft)}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || answeredMcq < MCQ_QUESTIONS.length}
            className="hidden sm:inline-flex btn-primary btn-sm gap-2"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </header>

      {/* ═══ PROGRESS BAR ═══ */}
      <div className="h-1.5 w-full bg-gray-200 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ═══ EXAM BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question palette — sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Questions</p>
            <p className="text-[11px] text-gray-400 mt-1">{answeredTotal}/{totalQuestions} answered</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5 px-4 pb-4">
            {ALL_QUESTIONS.map((q, idx) => {
              const answered = isQuestionAnswered(q.id);
              const active = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                    active
                      ? "bg-green-600 text-white shadow-md ring-2 ring-green-300"
                      : answered
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="px-4 pb-4 mt-auto space-y-2 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" /> Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-gray-100 border border-gray-300" /> Unanswered
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-green-600" /> Current
            </div>
          </div>
        </aside>

        {/* Question area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-10">
            <div className="w-full max-w-2xl space-y-6">
              {!email && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  ⚠️ Email session missing. Please start from the{" "}
                  <a href="/screening/apply" className="font-semibold underline">application page</a>.
                </div>
              )}

              {/* Question card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-600 text-white text-sm font-bold">
                      {currentIndex + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      {currentQ.type === "mcq" ? "Multiple Choice" : "Short Answer"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {currentIndex + 1} of {totalQuestions}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed">{currentQ.prompt}</p>

                  {currentQ.type === "mcq" && "options" in currentQ && (
                    <div className="mt-5 space-y-2.5">
                      {(currentQ as McqQuestion).options.map((option) => {
                        const selected = mcqAnswers[currentQ.id] === option;
                        return (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-all ${
                              selected
                                ? "border-green-500 bg-green-50 text-green-900 shadow-sm"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className={`flex items-center justify-center h-5 w-5 rounded-full border-2 transition-colors shrink-0 ${
                              selected ? "border-green-500 bg-green-500" : "border-gray-300"
                            }`}>
                              {selected && (
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <input
                              type="radio"
                              name={currentQ.id}
                              value={option}
                              checked={selected}
                              onChange={(e) => setMcqAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                              className="sr-only"
                            />
                            <span className="flex-1">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {currentQ.type === "short" && (
                    <textarea
                      rows={5}
                      value={shortAnswers[currentQ.id] || ""}
                      onChange={(e) => setShortAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                      placeholder="Write your answer here..."
                      className="mt-5 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors resize-y min-h-[140px]"
                    />
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
              )}
            </div>
          </div>

          {/* Bottom navigation bar */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-3">
            <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
                Previous
              </button>

              {/* Mobile palette toggle */}
              <button
                type="button"
                onClick={() => setShowPalette(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                {answeredTotal}/{totalQuestions}
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || answeredMcq < MCQ_QUESTIONS.length}
                  className="btn-primary btn-sm gap-2"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* --- Tab-switch violation warning --- */}
      {showViolationWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10001 }}>
          <div className="w-[92%] max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tab Switch Detected</h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Navigating away from the exam is flagged as a violation. You have{" "}
              <strong className="text-red-600">{violations}</strong> violation{violations > 1 ? "s" : ""} recorded.
              Repeated violations may lead to disqualification.
            </p>
            <button
              type="button"
              onClick={() => setShowViolationWarning(false)}
              className="mt-6 btn-primary w-full justify-center"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* --- Submit confirmation modal --- */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ zIndex: 10001 }}>
          <div className="w-[92%] max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Confirm Submission</h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              You&apos;ve answered <strong>{answeredTotal}</strong> of <strong>{totalQuestions}</strong> questions.
              {answeredTotal < totalQuestions && (
                <span className="text-amber-600 font-medium"> {totalQuestions - answeredTotal} question{totalQuestions - answeredTotal > 1 ? "s are" : " is"} unanswered.</span>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => { setShowSubmitConfirm(false); void submitAssessment(false); }}
                className="flex-1 btn-primary justify-center"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Mobile question palette overlay --- */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/50 lg:hidden" style={{ zIndex: 10000 }} onClick={() => setShowPalette(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-900">Question Palette</p>
              <button type="button" onClick={() => setShowPalette(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {ALL_QUESTIONS.map((q, idx) => {
                const answered = isQuestionAnswered(q.id);
                const active = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? "bg-green-600 text-white shadow-md"
                        : answered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300" /> Answered</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gray-100 border border-gray-300" /> Unanswered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreeningTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading test...</p>
        </div>
      }
    >
      <ScreeningTestContent />
    </Suspense>
  );
}
