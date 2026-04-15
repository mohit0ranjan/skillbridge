import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "../_lib/runtime";
import { ensureScreeningTable, listLeads, type ScreeningStatus } from "../_lib/store";

export const runtime = "nodejs";

const validStatuses: ScreeningStatus[] = ["applied", "under_review", "selected", "converted"];

async function isAdminRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  const backendBase = getBackendBaseUrl();
  if (!backendBase) return false;

  try {
    const response = await fetch(`${backendBase}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const body = (await response.json()) as { data?: { role?: string } };
    return body?.data?.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const allowed = await isAdminRequest(request);
    console.log(`[ADMIN LEADS] Access Check allowed=${allowed}`);
    if (!allowed) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await ensureScreeningTable();

    const { searchParams } = new URL(request.url);
    const statusParam = (searchParams.get("status") || "").toLowerCase();
    const status = validStatuses.includes(statusParam as ScreeningStatus)
      ? (statusParam as ScreeningStatus)
      : undefined;

    const leads = await listLeads(status);
    console.log(`[ADMIN LEADS] Fetched count=${leads.length} status=${status || "all"}`);

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("[screening/leads]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 });
  }
}
