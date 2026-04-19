import { NextResponse } from "next/server";
import { ensureScreeningTable, markTestSubmitted, normalizeEmail } from "../_lib/store";

export const runtime = "nodejs";

type SubmitPayload = {
  email?: string;
  answers?:
    | {
        mcq?: Record<string, string | number>;
        short?: Record<string, string>;
      }
    | Array<string | number>;
  subjectiveAnswer?: string;
};

const MCQ_ANSWER_KEY: Record<string, string> = {
  q1: 'printf("Hello");',
  q2: "stdio.h",
  q3: 'cout << "Hello";',
  q4: "4 bytes",
  q5: "Function Overloading",
  q6: "a = 10",
  q7: "<class 'int'>",
  q8: "def",
  q9: "HiHiHi",
  q10: "a",
  q11: "color",
  q12: "Cascading Style Sheets",
  q13: "var",
  q14: "22",
  q15: "console.log()",
};

function normalizeAnswer(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function calculateMcqScore(answers: SubmitPayload["answers"]) {
  if (!answers || Array.isArray(answers)) return 0;
  const mcq = answers.mcq || {};

  let score = 0;
  for (const [questionId, correctValue] of Object.entries(MCQ_ANSWER_KEY)) {
    if (normalizeAnswer(mcq[questionId]) === normalizeAnswer(correctValue)) {
      score += 1;
    }
  }

  return score;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmitPayload;

    if (!payload.email || !payload.email.trim()) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await ensureScreeningTable();

    const email = normalizeEmail(payload.email);
    const testScore = calculateMcqScore(payload.answers);

    const updatedLead = await markTestSubmitted(email, testScore, payload.answers as Record<string, unknown>);

    if (!updatedLead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    // Email service shifted to manual admin CRM logic.
    // Candidate strictly moves into under_review state.

    return NextResponse.json({
      success: true,
      message: "Test submitted successfully",
      data: {
        email: updatedLead.email,
        status: updatedLead.status,
        testSubmitted: updatedLead.test_submitted,
        testScore: updatedLead.test_score,
        emailSent: updatedLead.email_sent,
      },
    });
  } catch (error) {
    console.error("[screening/submit-test]", error);
    return NextResponse.json({ success: false, message: "Failed to submit test" }, { status: 500 });
  }
}
