import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { ensureScreeningTable, markConverted, normalizeEmail } from "../../screening/_lib/store";

export const runtime = "nodejs";
const isDevelopment = process.env.NODE_ENV !== "production";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        email?: string;
        notes?: Record<string, string>;
        status?: string;
      };
    };
  };
  email?: string;
  status?: string;
};

function getRawSignature(request: Request) {
  return request.headers.get("x-razorpay-signature") || request.headers.get("X-Razorpay-Signature") || "";
}

function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

function resolveWebhookEmail(payload: WebhookPayload) {
  const entity = payload.payload?.payment?.entity;
  const noteEmail = entity?.notes?.email;
  return payload.email || entity?.email || noteEmail || "";
}

function isSuccessfulPayment(payload: WebhookPayload) {
  const eventName = String(payload.event || "").toLowerCase();
  const entityStatus = String(payload.payload?.payment?.entity?.status || payload.status || "").toLowerCase();
  return eventName === "payment.captured" || entityStatus === "captured" || entityStatus === "success";
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = getRawSignature(request);

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ success: false, message: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    const email = resolveWebhookEmail(payload).trim();

    if (!email) {
      return NextResponse.json({ success: true, message: "Webhook received" });
    }

    await ensureScreeningTable();

    if (isSuccessfulPayment(payload)) {
      const updated = await markConverted(normalizeEmail(email));
      return NextResponse.json({
        success: true,
        message: "Payment recorded",
        data: {
          email: updated?.email || normalizeEmail(email),
          status: updated?.status || "converted",
          converted: updated?.converted ?? true,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("[payment/webhook]", error);
    const message = isDevelopment && error instanceof Error ? error.message : "Webhook processing failed";
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
