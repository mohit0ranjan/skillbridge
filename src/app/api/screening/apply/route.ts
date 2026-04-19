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
const isDevelopment = process.env.NODE_ENV !== "production";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const validation = validateApplyPayload(payload as Partial<ScreeningLeadInput>);

    if (!validation.ok) {
      return NextResponse.json({ success: false, message: validation.message }, { status: 400 });
    }

    await ensureScreeningTable();
    const sanitized = sanitizeInput(payload as ScreeningLeadInput);

    const existing = await findLeadByEmail(sanitized.email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already exists in screening funnel" },
        { status: 409 },
      );
    }

    const created = await createLead(sanitized);
    return NextResponse.json({
      success: true,
      message: "Screening application submitted",
      data: {
        id: created?.id,
        email: created?.email,
        status: created?.status ?? "applied",
      },
    });
  } catch (error) {
    console.error("[screening/apply]", error);
    const message = isDevelopment && error instanceof Error ? error.message : "Failed to submit application";
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
