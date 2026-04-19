import { NextResponse } from "next/server";
import { getAdminAuthResult } from "../_lib/auth";
import { getPrisma } from "../../screening/_lib/runtime";

export const runtime = "nodejs";
const isDevelopment = process.env.NODE_ENV !== "production";

export async function GET(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || searchParams.get("query") || "").trim();
    console.log(`[FETCH USERS] query=${query || "<none>"}`);
    const prisma = getPrisma();

    const users = query
      ? await prisma.$queryRawUnsafe<Array<{ id: string; name: string; email: string; role: string; createdAt: Date | string }>>(
          `
            SELECT id, name, email, role, "createdAt"
            FROM "User"
            WHERE LOWER(email) LIKE LOWER($1)
            ORDER BY "createdAt" DESC
          `,
          `%${query}%`,
        )
      : await prisma.$queryRawUnsafe<Array<{ id: string; name: string; email: string; role: string; createdAt: Date | string }>>(
          `
            SELECT id, name, email, role, "createdAt"
            FROM "User"
            ORDER BY "createdAt" DESC
          `,
        );

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("[API ERROR] [admin/users]", error);
    const message = isDevelopment && error instanceof Error ? error.message : "Failed to fetch users";
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
