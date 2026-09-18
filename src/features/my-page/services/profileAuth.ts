export type VerifyProfilePasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid-password" | "request-failed" };

import { apiRequest, ApiError } from "@/lib/api/client";

export async function verifyProfilePassword(
  password: string,
): Promise<VerifyProfilePasswordResult> {
  try {
    await apiRequest<null>("/api/users/me/password/verify", { method: "POST", retryOnUnauthorized: false, body: JSON.stringify({ password }) });
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: error instanceof ApiError && error.status === 401 ? "invalid-password" : "request-failed" };
  }
}
