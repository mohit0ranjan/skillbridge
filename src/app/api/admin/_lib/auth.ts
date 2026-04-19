import { createRequire } from "node:module";
import { getPrisma } from "../../screening/_lib/runtime";

type AdminPrismaLike = {
  user: {
    findUnique: (args: {
      where: { id: string };
      select: { id: boolean; role: boolean };
    }) => Promise<{ id: string; role: string } | null>;
  };
};

type JwtLike = {
  verifyToken: (token: string, secretName?: string, expectedPurpose?: string) => { id?: string };
};

const require = createRequire(import.meta.url);
const { verifyToken } = require("../../../../../backend/utils/jwt") as JwtLike;
const prisma = getPrisma() as unknown as AdminPrismaLike;

const normalizeRole = (role: unknown) => String(role || "").trim().toUpperCase();

export type AdminAuthResult = {
  ok: boolean;
  status: number;
  message: string;
};

export async function getAdminAuthResult(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, message: "Missing or malformed authorization header" };
  }

  try {
    const token = authHeader.slice("Bearer ".length).trim();
    const decoded = verifyToken(token);
    const userId = String(decoded?.id || "").trim();

    if (!userId) {
      return { ok: false, status: 401, message: "Invalid session token" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    const isAdmin = normalizeRole(user?.role) === "ADMIN";

    if (!isAdmin) {
      return { ok: false, status: 403, message: "Admin access required" };
    }

    return { ok: true, status: 200, message: "Authorized" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify authentication";
    if (/jwt|token|expired|purpose|secret/i.test(message)) {
      return { ok: false, status: 401, message: "Session expired. Please login again." };
    }

    return { ok: false, status: 503, message: `Unable to verify authentication: ${message}` };
  }
}

export async function isAdminRequest(request: Request) {
  const result = await getAdminAuthResult(request);
  if (!result.ok) {
    console.warn(`[ADMIN AUTH] failed status=${result.status} message=${result.message}`);
  }
  return result.ok;
}
