import { NextResponse } from "next/server";
import {
  createLead,
  ensureScreeningTable,
  findLeadByEmail,
  sanitizeInput,
  validateApplyPayload,
  type ScreeningLeadInput,
} from "../_lib/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const validation = validateApplyPayload(payload as Partial<ScreeningLeadInput>);

    if (!validation.ok) {
      return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
    }

    await ensureScreeningTable();
    const sanitized = sanitizeInput(payload as ScreeningLeadInput);
    console.log(`[APPLY] Start email=${sanitized.email} name="${sanitized.name}"`);

    const existing = await findLeadByEmail(sanitized.email);
    if (existing) {
      console.log(`[APPLY] BLOCKED Duplicate email=${sanitized.email}`);
      return NextResponse.json(
        { success: false, message: "Email already exists in screening funnel" },
        { status: 409 },
      );
    }

    const created = await createLead(sanitized);
    console.log(`[APPLY] DB insert OK email=${sanitized.email}`);
    return NextResponse.json({
      success: true,
      message: "Screening application submitted",
      data: {
        id: created?.id,
        email: created?.email,
        status: created?.status ?? "applied",
      },
    });
  } catch (error: any) {
    console.error("[screening/apply]", error);
    return NextResponse.json({ success: false, message: "Failed to submit application", error: String(error), stack: error?.stack }, { status: 500 });
  }
}
