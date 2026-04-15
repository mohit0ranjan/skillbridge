import { NextResponse } from "next/server";
import { ensureScreeningTable, markConfirmClicked, normalizeEmail } from "../_lib/store";

export const runtime = "nodejs";

type ConfirmClickPayload = {
  email?: string;
};

async function resolveEmail(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryEmail = (searchParams.get("email") || "").trim();
  if (queryEmail) return queryEmail;

  try {
    const payload = (await request.json()) as ConfirmClickPayload;
    return (payload.email || "").trim();
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const rawEmail = await resolveEmail(request);
    console.log(`[CONFIRM CLICK] Start email=${rawEmail}`);
    if (!rawEmail) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await ensureScreeningTable();

    const updated = await markConfirmClicked(normalizeEmail(rawEmail));
    if (!updated) {
      console.log(`[CONFIRM CLICK] FAIL Lead not found email=${rawEmail}`);
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }
    
    console.log(`[CONFIRM CLICK] DB update OK email=${rawEmail}`);

    return NextResponse.json({
      success: true,
      message: "Confirm click tracked",
      data: {
        email: updated.email,
        clickedConfirm: updated.clicked_confirm,
      },
    });
  } catch (error) {
    console.error("[screening/confirm-click]", error);
    return NextResponse.json({ success: false, message: "Failed to track confirmation click" }, { status: 500 });
  }
}
