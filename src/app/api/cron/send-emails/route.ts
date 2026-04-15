import { NextResponse } from "next/server";
import { getEmailService } from "../../screening/_lib/runtime";
import { getPendingEmailQueue, markEmailQueueFailed, markEmailQueueSent } from "../../admin/_lib/emailQueue";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveDelayMs() {
  if (process.env.NODE_ENV === "production") {
    const minimum = 30_000;
    const maximum = 60_000;
    return Math.floor(minimum + Math.random() * (maximum - minimum));
  }

  return 0;
}

export async function POST() {
  try {
    const pending = await getPendingEmailQueue(10);
    const emailService = getEmailService();
    const results: Array<{ email: string; status: string }> = [];

    for (let index = 0; index < pending.length; index += 1) {
      const row = pending[index];

      try {
        await emailService.send({
          to: row.email,
          subject: "SkillBridge: Important update",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
                <h2 style="margin: 0 0 12px; color: #111827;">Hello ${row.name},</h2>
                <p style="margin: 0; color: #374151; line-height: 1.7;">
                  This is a SkillBridge follow-up message queued through the admin email system.
                </p>
              </div>
            </div>
          `,
        });

        await markEmailQueueSent(row.id);
        results.push({ email: row.email, status: "sent" });
      } catch (error) {
        await markEmailQueueFailed(row.id, error instanceof Error ? error.message : String(error));
        results.push({ email: row.email, status: "failed" });
      }

      if (index < pending.length - 1) {
        await sleep(resolveDelayMs());
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} queued emails`,
      data: {
        processed: results.length,
        sent: results.filter((item) => item.status === "sent").length,
        failed: results.filter((item) => item.status === "failed").length,
        results,
      },
    });
  } catch (error) {
    console.error("[cron/send-emails]", error);
    return NextResponse.json({ success: false, message: "Cron send failed", error: String(error) }, { status: 500 });
  }
}
