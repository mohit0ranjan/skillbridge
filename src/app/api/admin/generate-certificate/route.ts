import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import { getAdminAuthResult } from "../_lib/auth";
import { getEmailService } from "../../screening/_lib/runtime";
import { normalizeEmail } from "../../screening/_lib/store";
import { getCertificateEmailHtml } from "../_lib/emailTemplates";
import { sendWithRetry } from "../_lib/sendWithRetry";

export const runtime = "nodejs";
const isDevelopment = process.env.NODE_ENV !== "production";

const require = createRequire(import.meta.url);
const { generateCertificatePdf } = require("../../../../../backend/utils/pdfGenerator");
const { generateCertificateId } = require("../../../../../backend/utils/generateCertificateId");
const { getPrisma } = require("../../screening/_lib/runtime");

type CertificatePayload = {
  email?: string;
  name?: string;
  internship?: string;
  issueDate?: string;
  certificateId?: string;
  duration?: string;
};

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const payload = (await request.json()) as CertificatePayload;
    const email = String(payload.email || "").trim().toLowerCase();
    const name = String(payload.name || "").trim();
    const internship = String(payload.internship || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailOk || !name || !internship) {
      return NextResponse.json({ success: false, message: "Email, name, and internship are required" }, { status: 400 });
    }

    const certificateId = payload.certificateId?.trim() || generateCertificateId();
    const issueDate = payload.issueDate ? new Date(payload.issueDate) : new Date();
    if (Number.isNaN(issueDate.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid issueDate value" }, { status: 400 });
    }

    const pdfBuffer = await generateCertificatePdf({
      studentName: name,
      internship,
      issueDate,
      certificateId,
    });

    const normalizedEmail = normalizeEmail(email);

    await sendWithRetry(getEmailService(), {
      to: normalizedEmail,
      subject: `SkillBridge: Certificate Ready - ${internship}`,
      html: getCertificateEmailHtml({
        name,
        internship,
        certificateId,
      }),
      attachments: [
        {
          filename: `SkillBridge-Certificate-${certificateId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }, "admin-generate-certificate");

    const prisma = getPrisma();
    await prisma.$executeRawUnsafe(
      `
        UPDATE screening_leads
        SET certificate_issued = true
        WHERE LOWER(email) = LOWER($1)
      `,
      normalizedEmail,
    );

    return NextResponse.json({
      success: true,
      message: "Certificate generated and emailed successfully",
      data: {
        email: normalizedEmail,
        name,
        internship,
        certificateId,
      },
    });
  } catch (error) {
    console.error("[API ERROR] [admin/generate-certificate]", error);
    const message = isDevelopment && error instanceof Error ? error.message : "Failed to generate certificate";
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
