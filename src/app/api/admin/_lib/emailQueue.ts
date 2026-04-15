import { randomUUID } from "node:crypto";
import { getPrisma } from "../../screening/_lib/runtime";

export type EmailQueueRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  attempts: number;
  last_error: string | null;
  sent_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export async function ensureEmailQueueTable() {
  const prisma = getPrisma();
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      last_error TEXT,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS email_queue_status_created_idx ON email_queue (status, created_at);
  `);
}

export async function upsertEmailQueue(rows: Array<{ name: string; email: string }>) {
  await ensureEmailQueueTable();
  const prisma = getPrisma();
  const saved: EmailQueueRow[] = [];

  for (const row of rows) {
    const name = row.name.trim();
    const email = row.email.trim().toLowerCase();
    if (!name || !email) continue;

    const result = await prisma.$queryRawUnsafe<EmailQueueRow[]>(
      `
        INSERT INTO email_queue (id, name, email, status, attempts, updated_at)
        VALUES ($1::uuid, $2, $3, 'pending', 0, NOW())
        ON CONFLICT (email)
        DO UPDATE SET
          name = EXCLUDED.name,
          status = 'pending',
          attempts = 0,
          last_error = NULL,
          sent_at = NULL,
          updated_at = NOW()
        RETURNING id, name, email, status, attempts, last_error, sent_at, created_at, updated_at
      `,
      randomUUID(),
      name,
      email,
    );

    if (result[0]) {
      saved.push(result[0]);
    }
  }

  return saved;
}

export async function getPendingEmailQueue(limit = 10) {
  await ensureEmailQueueTable();
  const prisma = getPrisma();
  return prisma.$queryRawUnsafe<EmailQueueRow[]>(
    `
      SELECT id, name, email, status, attempts, last_error, sent_at, created_at, updated_at
      FROM email_queue
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1
    `,
    limit,
  );
}

export async function markEmailQueueSent(id: string) {
  await ensureEmailQueueTable();
  const prisma = getPrisma();
  const result = await prisma.$queryRawUnsafe<EmailQueueRow[]>(
    `
      UPDATE email_queue
      SET status = 'sent', sent_at = NOW(), last_error = NULL, updated_at = NOW()
      WHERE id = $1::uuid
      RETURNING id, name, email, status, attempts, last_error, sent_at, created_at, updated_at
    `,
    id,
  );

  return result[0] ?? null;
}

export async function markEmailQueueFailed(id: string, errorMessage: string) {
  await ensureEmailQueueTable();
  const prisma = getPrisma();
  const result = await prisma.$queryRawUnsafe<EmailQueueRow[]>(
    `
      UPDATE email_queue
      SET status = 'failed', attempts = attempts + 1, last_error = $2, updated_at = NOW()
      WHERE id = $1::uuid
      RETURNING id, name, email, status, attempts, last_error, sent_at, created_at, updated_at
    `,
    id,
    errorMessage.slice(0, 500),
  );

  return result[0] ?? null;
}
