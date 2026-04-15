import { NextResponse } from "next/server";
import { ensureScreeningTable, markConverted, normalizeEmail } from "../../screening/_lib/store";

export const runtime = "nodejs";

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
    const payload = (await request.json()) as WebhookPayload;
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
    return NextResponse.json({ success: false, message: "Webhook processing failed", error: String(error) }, { status: 500 });
  }
}
