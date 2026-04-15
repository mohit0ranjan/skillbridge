import { NextResponse } from "next/server";
import { getAdminAuthResult } from "../_lib/auth";
import { ensureScreeningTable, listLeads, type ScreeningStatus } from "../../screening/_lib/store";

export const runtime = "nodejs";

const validStatuses: ScreeningStatus[] = ["applied", "under_review", "selected", "converted"];

export async function GET(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    await ensureScreeningTable();

    const { searchParams } = new URL(request.url);
    const statusParam = (searchParams.get("status") || "").toLowerCase();
    const status = validStatuses.includes(statusParam as ScreeningStatus)
      ? (statusParam as ScreeningStatus)
      : undefined;
    console.log(`[FETCH LEADS] status=${status || "all"}`);

    const leads = await listLeads(status);

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("[API ERROR] [admin/screening-leads]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch screening leads" }, { status: 500 });
  }
}
