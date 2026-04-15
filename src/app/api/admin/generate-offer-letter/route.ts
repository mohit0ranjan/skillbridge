import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import { getAdminAuthResult } from "../_lib/auth";
import { getEmailService } from "../../screening/_lib/runtime";
import { normalizeEmail, recordEmailSent } from "../../screening/_lib/store";
import { getOfferAttachmentEmailHtml } from "../_lib/emailTemplates";
import { sendWithRetry } from "../_lib/sendWithRetry";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const { generateOfferLetterPdf } = require("../../../../../backend/utils/offerLetterPdf");

type OfferPayload = {
  email?: string;
  name?: string;
  role?: string;
  duration?: string;
  signatureName?: string;
};

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const payload = (await request.json()) as OfferPayload;
    const email = String(payload.email || "").trim().toLowerCase();
    const name = String(payload.name || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk || !name) {
      return NextResponse.json({ success: false, message: "Email and name are required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const pdfBuffer = await generateOfferLetterPdf({
      name,
      role: payload.role?.trim() || "Software Engineering Intern",
      duration: payload.duration?.trim() || "4 Weeks",
      signatureName: payload.signatureName?.trim() || "SkillBridge Talent Team",
    });

    await sendWithRetry(getEmailService(), {
      to: normalizedEmail,
      subject: "SkillBridge: Offer Letter Attached",
      html: getOfferAttachmentEmailHtml({
        name,
        role: payload.role,
        duration: payload.duration,
      }),
      attachments: [
        {
          filename: `SkillBridge-Offer-Letter-${name.replace(/\s+/g, "-")}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }, "admin-generate-offer-letter");

    await recordEmailSent(normalizedEmail, "offer");

    return NextResponse.json({
      success: true,
      message: "Offer letter generated and emailed successfully",
      data: {
        email: normalizedEmail,
        name,
        role: payload.role?.trim() || "Software Engineering Intern",
        duration: payload.duration?.trim() || "4 Weeks",
      },
    });
  } catch (error) {
    console.error("[API ERROR] [admin/generate-offer-letter]", error);
    return NextResponse.json({ success: false, message: "Failed to generate offer letter", error: String(error) }, { status: 500 });
  }
}
