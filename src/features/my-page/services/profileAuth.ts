export type VerifyProfilePasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid-password" | "request-failed" };

const MOCK_CURRENT_PASSWORD = "Stock1234!";

export async function verifyProfilePassword(
  password: string,
): Promise<VerifyProfilePasswordResult> {
  // TODO: API 연동 시 이 함수 내부만 실제 비밀번호 확인 요청으로 교체합니다.
  return password === MOCK_CURRENT_PASSWORD
    ? { ok: true }
    : { ok: false, reason: "invalid-password" };
}
