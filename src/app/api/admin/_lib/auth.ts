import { getBackendBaseUrl } from "../../screening/_lib/runtime";

const normalizeRole = (role: unknown) => String(role || "").trim().toUpperCase();

export type AdminAuthResult = {
  ok: boolean;
  status: number;
  message: string;
};

const tokenFailurePatterns = ["token", "expired", "jwt", "session", "not authorized"];

export async function getAdminAuthResult(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, message: "Missing or malformed authorization header" };
  }

  const backendBase = getBackendBaseUrl();
  if (!backendBase) {
    return { ok: false, status: 503, message: "Backend base URL is not configured" };
  }

  try {
    const response = await fetch(`${backendBase}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let message = "Authorization check failed";
      try {
        const errorBody = (await response.json()) as { message?: string };
        if (errorBody?.message) {
          message = errorBody.message;
        }
      } catch {
        // Ignore parse failures and use fallback message.
      }

      const lower = message.toLowerCase();
      if (tokenFailurePatterns.some((pattern) => lower.includes(pattern))) {
        return { ok: false, status: 401, message: "Session expired. Please login again." };
      }

      return { ok: false, status: response.status, message };
    }

    const body = (await response.json()) as { data?: { role?: string } };
    const isAdmin = normalizeRole(body?.data?.role) === "ADMIN";

    if (!isAdmin) {
      return { ok: false, status: 403, message: "Admin access required" };
    }

    return { ok: true, status: 200, message: "Authorized" };
  } catch {
    return { ok: false, status: 503, message: "Unable to reach authentication service" };
  }
}

export async function isAdminRequest(request: Request) {
  const result = await getAdminAuthResult(request);
  if (!result.ok) {
    console.warn(`[ADMIN AUTH] failed status=${result.status} message=${result.message}`);
  }
  return result.ok;
}
