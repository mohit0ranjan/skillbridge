import { NextResponse } from "next/server";
import { ensureScreeningTable, markConverted, normalizeEmail } from "../_lib/store";

export const runtime = "nodejs";

type ConvertPayload = {
  email?: string;
};

async function resolveEmail(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryEmail = (searchParams.get("email") || "").trim();
  if (queryEmail) return queryEmail;

  try {
    const payload = (await request.json()) as ConvertPayload;
    return (payload.email || "").trim();
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const rawEmail = await resolveEmail(request);
    console.log(`[CONVERT] Start email=${rawEmail}`);
    if (!rawEmail) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    await ensureScreeningTable();

    const updated = await markConverted(normalizeEmail(rawEmail));
    if (!updated) {
      console.log(`[CONVERT] FAIL Lead not found email=${rawEmail}`);
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }
    
    console.log(`[CONVERT] DB update OK email=${rawEmail}`);

    return NextResponse.json({
      success: true,
      message: "Lead converted",
      data: {
        email: updated.email,
        status: updated.status,
        converted: updated.converted,
      },
    });
  } catch (error) {
    console.error("[screening/convert]", error);
    return NextResponse.json({ success: false, message: "Failed to mark conversion" }, { status: 500 });
  }
}
