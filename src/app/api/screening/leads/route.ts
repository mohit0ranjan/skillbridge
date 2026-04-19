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

  const withoutVersion = backendBase.endsWith("/api/v1")
    ? backendBase.slice(0, -"/api/v1".length)
    : backendBase;

  const authUrls = [
    `${backendBase}/auth/me`,
    `${withoutVersion}/auth/me`,
    `${withoutVersion}/api/v1/auth/me`,
  ];

  const visited = new Set<string>();

  for (const url of authUrls) {
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
        cache: "no-store",
      });

      if (!response.ok) continue;

      const body = (await response.json()) as { data?: { role?: string } };
      if (body?.data?.role === "ADMIN") return true;
    } catch {
      // Try the next candidate URL.
    }
  }

  return false;
}

export async function GET(request: Request) {
  try {
    const allowed = await isAdminRequest(request);
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

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error("[screening/leads]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 });
  }
}
