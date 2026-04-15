import { NextResponse } from "next/server";
import { getAdminAuthResult } from "../_lib/auth";
import { upsertEmailQueue } from "../_lib/emailQueue";

export const runtime = "nodejs";

type UploadPayload = {
  rows?: Array<{ name?: string; email?: string }>;
  csvText?: string;
};

function parseDelimitedRows(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [] as Array<{ name: string; email: string }>;
  }

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("email") || header.includes("name");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => line.split(/[\t,;]/).map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .map((cells) => {
      const [first, second] = cells;
      const firstLooksEmail = first.includes("@");
      const secondLooksEmail = second.includes("@");

      if (firstLooksEmail && !secondLooksEmail) {
        return { email: first, name: second };
      }

      return { name: first, email: second };
    })
    .filter((row) => row.name && row.email);
}

export async function POST(request: Request) {
  try {
    const adminAuth = await getAdminAuthResult(request);
    if (!adminAuth.ok) {
      return NextResponse.json({ success: false, message: adminAuth.message }, { status: adminAuth.status });
    }

    const payload = (await request.json()) as UploadPayload;
    const rows = Array.isArray(payload.rows) && payload.rows.length > 0
      ? payload.rows
          .map((row) => ({ name: String(row.name || "").trim(), email: String(row.email || "").trim() }))
          .filter((row) => row.name && row.email)
      : parseDelimitedRows(payload.csvText || "");

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "No valid name/email rows found" }, { status: 400 });
    }

    const inserted = await upsertEmailQueue(rows);

    return NextResponse.json({
      success: true,
      message: `Queued ${inserted.length} emails`,
      data: {
        inserted: inserted.length,
        rows: inserted,
      },
    });
  } catch (error) {
    console.error("[API ERROR] [admin/upload-emails]", error);
    return NextResponse.json({ success: false, message: "Failed to upload emails", error: String(error) }, { status: 500 });
  }
}
