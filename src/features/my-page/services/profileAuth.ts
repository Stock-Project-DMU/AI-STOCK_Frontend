export type VerifyProfilePasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid-password" | "request-failed"; message: string };

import { apiRequest, ApiError, getApiErrorMessage } from "@/lib/api/client";

export async function verifyProfilePassword(
  password: string,
): Promise<VerifyProfilePasswordResult> {
  try {
    await apiRequest<null>("/api/users/me/password/verify", { method: "POST", retryOnUnauthorized: false, body: JSON.stringify({ password }) });
    return { ok: true };
  } catch (error) {
    const invalidPassword = error instanceof ApiError && (error.code === "INVALID_PASSWORD"
      || (!error.code && error.message === "비밀번호가 일치하지 않습니다."));
    return { ok: false, reason: invalidPassword ? "invalid-password" : "request-failed",
      message: getApiErrorMessage(error, "비밀번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.") };
  }
}
