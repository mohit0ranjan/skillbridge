import { NextResponse } from "next/server";
import { getAdminAuthResult } from "../_lib/auth";
import { getEmailService } from "../../screening/_lib/runtime";
import { recordEmailSent } from "../../screening/_lib/store";
import {
  EmailTemplateParams,
  getOnboardingEmailHtml,
  getOfferEmailHtml,
  getPaymentEmailHtml,
  getSelectionEmailHtml,
} from "../_lib/emailTemplates";
import { sendWithRetry } from "../_lib/sendWithRetry";

export const runtime = "nodejs";
const isDevelopment = process.env.NODE_ENV !== "production";

type SendMailPayload = {
  email: string;
  type: "selection" | "payment" | "offer" | "onboarding";
  name: string;
  paymentLink?: string;
  deadline?: string;
  role?: string;
  duration?: string;
  whatsappLink?: string;
};

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const payload = (await request.json()) as SendMailPayload;
    const normalizedEmail = String(payload.email || "").trim().toLowerCase();
    const normalizedName = String(payload.name || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!emailOk || !payload.type || !normalizedName) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (payload.type === "payment" && !payload.paymentLink) {
      return NextResponse.json({ success: false, message: "paymentLink is required for payment emails" }, { status: 400 });
    }

    if (payload.type === "onboarding" && !payload.whatsappLink) {
      return NextResponse.json({ success: false, message: "whatsappLink is required for onboarding emails" }, { status: 400 });
    }

    const emailService = getEmailService();
    let html = "";
    let subject = "";

    switch (payload.type) {
      case "selection":
        subject = "SkillBridge: Shortlisted for Next Step";
        html = getSelectionEmailHtml({ ...payload, name: normalizedName } as EmailTemplateParams);
        break;
      case "payment":
        subject = "SkillBridge: Payment Step for Enrollment";
        html = getPaymentEmailHtml({ ...payload, name: normalizedName } as EmailTemplateParams);
        break;
      case "offer":
        subject = "SkillBridge: Offer Letter Update";
        html = getOfferEmailHtml({ ...payload, name: normalizedName } as EmailTemplateParams);
        break;
      case "onboarding":
        subject = "SkillBridge: Onboarding Instructions";
        html = getOnboardingEmailHtml({ ...payload, name: normalizedName } as EmailTemplateParams);
        break;
      default:
        return NextResponse.json({ success: false, message: "Invalid email type" }, { status: 400 });
    }

    await sendWithRetry(emailService, {
      to: normalizedEmail,
      subject,
      html,
    }, `admin-send-mail:${payload.type}`);

    // Update database tracking, but do not fail delivery if tracking is unavailable.
    let trackingUpdated = false;
    try {
      const tracked = await recordEmailSent(normalizedEmail, payload.type);
      trackingUpdated = Boolean(tracked);
      if (!trackingUpdated) {
        console.warn(`[admin/send-mail] tracking row not updated for ${normalizedEmail} (${payload.type})`);
      }
    } catch (trackingError) {
      console.error(`[admin/send-mail] tracking update failed for ${normalizedEmail} (${payload.type})`, trackingError);
    }

    return NextResponse.json({
      success: true,
      message: trackingUpdated
        ? "Email sent successfully and status updated."
        : "Email sent successfully.",
      trackingUpdated,
    });
  } catch (error) {
    console.error("[API ERROR] [admin/send-mail]", error);
    const message = isDevelopment && error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json(
      {
        success: false,
        message,
        ...(isDevelopment ? { error: String(error) } : {}),
      },
      { status: 500 },
    );
  }
}
