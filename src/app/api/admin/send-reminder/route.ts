import { NextResponse } from "next/server";
import { getAdminAuthResult } from "../_lib/auth";
import { getEmailService } from "../../screening/_lib/runtime";
import { normalizeEmail } from "../../screening/_lib/store";
import { getReminderEmailHtml } from "../_lib/emailTemplates";
import { sendWithRetry } from "../_lib/sendWithRetry";

export const runtime = "nodejs";

type ReminderPayload = {
  email?: string;
  name?: string;
  stage?: "test" | "payment" | "general";
  note?: string;
};

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const payload = (await request.json()) as ReminderPayload;
    const email = String(payload.email || "").trim().toLowerCase();
    const name = String(payload.name || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk || !name) {
      return NextResponse.json({ success: false, message: "Email and name are required" }, { status: 400 });
    }

    const stage = payload.stage || "general";
    const subject = stage === "payment"
      ? "SkillBridge: Payment reminder"
      : stage === "test"
        ? "SkillBridge: Test submission reminder"
        : "SkillBridge: Follow-up from our team";

    const normalizedEmail = normalizeEmail(email);
    const html = getReminderEmailHtml({ name, stage, note: payload.note });

    await sendWithRetry(getEmailService(), {
      to: normalizedEmail,
      subject,
      html,
    }, `admin-send-reminder:${stage}`);

    return NextResponse.json({
      success: true,
      message: "Reminder sent successfully",
      data: {
        email: normalizedEmail,
        stage,
      },
    });
  } catch (error) {
    console.error("[API ERROR] [admin/send-reminder]", error);
    return NextResponse.json({ success: false, message: "Failed to send reminder", error: String(error) }, { status: 500 });
  }
}
