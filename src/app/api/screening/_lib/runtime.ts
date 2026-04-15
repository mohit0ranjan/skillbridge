import { createRequire } from "node:module";

type PrismaLike = {
  $executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
};

type EmailServiceLike = {
  send: (payload: { to: string; subject: string; html: string; attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }> }) => Promise<unknown>;
};

const require = createRequire(import.meta.url);

const prisma = require("../../../../../backend/prisma") as PrismaLike;
const emailServiceModule = require("../../../../../backend/services/email.service") as {
  emailService?: EmailServiceLike;
} & EmailServiceLike;

const emailService = (emailServiceModule.emailService ?? emailServiceModule) as EmailServiceLike;

export function getPrisma() {
  return prisma;
}

export function getEmailService() {
  return emailService;
}

export function getFrontendBaseUrl() {
  const configured =
    process.env.FRONTEND_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return configured.replace(/\/+$/, "");
}

export function getBackendBaseUrl() {
  const configured = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const normalized = configured.trim().replace(/\/+$/, "");

  if (normalized) return normalized;

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000";
  }

  return "";
}
