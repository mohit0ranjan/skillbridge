import { randomUUID } from "node:crypto";
import { getPrisma } from "./runtime";

export type ScreeningStatus = "applied" | "under_review" | "selected" | "converted";

export type ScreeningLeadInput = {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
  source?: string;
};

export type ScreeningLeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
  source: string | null;
  status: ScreeningStatus;
  test_submitted: boolean;
  test_score: number | null;
  email_sent: boolean;
  clicked_confirm: boolean;
  converted: boolean;
  selection_mail_sent: boolean;
  payment_mail_sent: boolean;
  offer_sent: boolean;
  onboarding_sent: boolean;
  certificate_issued: boolean;
  created_at: Date | string;
};

let tableEnsured = false;

export async function ensureScreeningTable() {
  if (tableEnsured) return;

  const prisma = getPrisma();
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS screening_leads (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      college TEXT NOT NULL,
      year TEXT NOT NULL,
      branch TEXT NOT NULL,
      source TEXT,
      status TEXT NOT NULL DEFAULT 'applied',
      test_submitted BOOLEAN NOT NULL DEFAULT FALSE,
      test_score INT,
      test_answers JSONB,
      email_sent BOOLEAN NOT NULL DEFAULT FALSE,
      clicked_confirm BOOLEAN NOT NULL DEFAULT FALSE,
      converted BOOLEAN NOT NULL DEFAULT FALSE,
      selection_mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
      payment_mail_sent BOOLEAN NOT NULL DEFAULT FALSE,
      offer_sent BOOLEAN NOT NULL DEFAULT FALSE,
      onboarding_sent BOOLEAN NOT NULL DEFAULT FALSE,
      certificate_issued BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE screening_leads DROP CONSTRAINT IF EXISTS screening_leads_status_check;
  `).catch(() => {});

  await prisma.$executeRawUnsafe(`
    ALTER TABLE screening_leads
    ADD COLUMN IF NOT EXISTS test_score INT,
    ADD COLUMN IF NOT EXISTS test_answers JSONB,
    ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS clicked_confirm BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS selection_mail_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS payment_mail_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS offer_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS onboarding_sent BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE screening_leads ADD CONSTRAINT screening_leads_status_check CHECK (status IN ('applied', 'under_review', 'selected', 'converted'));
  `).catch(() => {});

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS screening_leads_email_lower_unique
    ON screening_leads (LOWER(email));
  `);

  tableEnsured = true;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function sanitizeInput(input: ScreeningLeadInput): ScreeningLeadInput {
  return {
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    phone: input.phone.trim(),
    college: input.college.trim(),
    year: input.year.trim(),
    branch: input.branch.trim(),
    source: input.source?.trim() || undefined,
  };
}

export function validateApplyPayload(payload: Partial<ScreeningLeadInput>) {
  const required: Array<keyof ScreeningLeadInput> = ["name", "email", "phone", "college", "year", "branch"];
  const missing = required.filter((field) => !payload[field] || !String(payload[field]).trim());

  if (missing.length > 0) {
    return { ok: false as const, message: `Missing required fields: ${missing.join(", ")}` };
  }

  const email = String(payload.email);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return { ok: false as const, message: "Invalid email address" };
  }

  if (String(payload.name).trim().length < 2) {
    return { ok: false as const, message: "Name must be at least 2 characters" };
  }

  return { ok: true as const };
}

export async function findLeadByEmail(email: string) {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    SELECT * FROM screening_leads WHERE LOWER(email) = LOWER(${email}) LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createLead(input: ScreeningLeadInput) {
  const prisma = getPrisma();
  const recordId = randomUUID();
  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    INSERT INTO screening_leads (
      id, name, email, phone, college, year, branch, source, status, test_submitted, test_score, email_sent, clicked_confirm, converted, selection_mail_sent, payment_mail_sent, offer_sent, onboarding_sent, certificate_issued
    ) VALUES (${recordId}::uuid, ${input.name}, ${input.email}, ${input.phone}, ${input.college}, ${input.year}, ${input.branch}, ${input.source ?? null}, 'applied', false, NULL, false, false, false, false, false, false, false, false)
    RETURNING *
  `;

  return rows[0] ?? null;
}

export async function markTestSubmitted(email: string, testScore: number, testAnswers?: Record<string, unknown>) {
  const prisma = getPrisma();
  const answersJson = testAnswers ? JSON.stringify(testAnswers) : null;
  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    UPDATE screening_leads
    SET test_submitted = true, status = 'under_review', test_score = ${testScore}, test_answers = ${answersJson}::jsonb, email_sent = false
    WHERE LOWER(email) = LOWER(${email})
    RETURNING *
  `;

  return rows[0] ?? null;
}

export async function recordEmailSent(email: string, type: "selection" | "payment" | "offer" | "onboarding") {
  const prisma = getPrisma();
  if (type === "selection") {
    const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
      UPDATE screening_leads
      SET status = 'selected', selection_mail_sent = true, email_sent = true
      WHERE LOWER(email) = LOWER(${email})
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  if (type === "payment") {
    const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
      UPDATE screening_leads
      SET payment_mail_sent = true, email_sent = true
      WHERE LOWER(email) = LOWER(${email})
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  if (type === "offer") {
    const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
      UPDATE screening_leads
      SET offer_sent = true, email_sent = true
      WHERE LOWER(email) = LOWER(${email})
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    UPDATE screening_leads
    SET onboarding_sent = true, email_sent = true
    WHERE LOWER(email) = LOWER(${email})
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function markConfirmClicked(email: string) {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    UPDATE screening_leads
    SET clicked_confirm = true
    WHERE LOWER(email) = LOWER(${email})
    RETURNING *
  `;

  return rows[0] ?? null;
}

export async function markConverted(email: string) {
  const prisma = getPrisma();
  const rows = await prisma.$queryRaw<ScreeningLeadRecord[]>`
    UPDATE screening_leads
    SET converted = true, status = 'converted'
    WHERE LOWER(email) = LOWER(${email})
    RETURNING *
  `;

  return rows[0] ?? null;
}

export async function listLeads(status?: ScreeningStatus) {
  const prisma = getPrisma();

  if (status) {
    return prisma.$queryRaw<ScreeningLeadRecord[]>`
      SELECT id, name, email, phone, college, year, branch, source, status, test_submitted, test_score, email_sent, clicked_confirm, converted, created_at, selection_mail_sent, payment_mail_sent, offer_sent, onboarding_sent, certificate_issued
      FROM screening_leads
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;
  }

  return prisma.$queryRaw<ScreeningLeadRecord[]>`
    SELECT id, name, email, phone, college, year, branch, source, status, test_submitted, test_score, email_sent, clicked_confirm, converted, created_at, selection_mail_sent, payment_mail_sent, offer_sent, onboarding_sent, certificate_issued
    FROM screening_leads
    ORDER BY created_at DESC
  `;
}
