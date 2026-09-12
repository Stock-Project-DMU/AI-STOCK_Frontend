import { apiRequest, saveAuthTokens } from "./client";
import type { LoginResponse } from "./types";

export type OAuthProvider = "GOOGLE" | "NAVER" | "KAKAO";
export async function startOAuth(provider: OAuthProvider) {
    const result = await apiRequest<{ url: string; state: string }>(`/api/auth/oauth/${provider}/authorize`, { auth: false, credentials: "include" });
    sessionStorage.setItem("aistock.oauth", JSON.stringify({ provider, state: result.state, createdAt: Date.now() }));
    window.location.assign(result.url);
}
export async function finishOAuth(provider: OAuthProvider, code: string, state: string) {
    const saved = sessionStorage.getItem("aistock.oauth");
    sessionStorage.removeItem("aistock.oauth");
    const expected = saved ? JSON.parse(saved) as { provider: string; state: string; createdAt: number } : null;
    if (!expected || expected.provider !== provider || expected.state !== state || Date.now() - expected.createdAt > 600_000) {
        throw new Error("로그인 요청이 만료되었거나 일치하지 않습니다. 다시 로그인해 주세요.");
    }
    const result = await apiRequest<LoginResponse>("/api/auth/oauth/login", { method: "POST", auth: false, credentials: "include", body: JSON.stringify({ provider, code, state }) });
    saveAuthTokens(result, result.name);
}
