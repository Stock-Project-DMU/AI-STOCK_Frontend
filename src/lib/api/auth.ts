import { apiRequest, clearAuthTokens, saveAuthTokens } from "./client";
import type { LoginResponse, SignupResponse } from "./types";

export function checkLoginId(loginId: string) {
    return apiRequest<{ loginId: string; available: boolean }>(`/api/auth/login-id/availability?loginId=${encodeURIComponent(loginId)}`, { auth: false });
}

export type AccountRecoveryRequest = { loginId?: string; name: string; email: string; birthdate?: string; newPassword?: string };
export type RecoveryEmailCodeRequest = {
    purpose: "FIND_ID" | "RESET_PASSWORD";
    loginId?: string;
    name: string;
    email: string;
    birthdate?: string;
};
export function sendRecoveryEmailCode(request: RecoveryEmailCodeRequest) {
    return apiRequest<null>("/api/auth/recovery/send-code", {
        method: "POST",
        auth: false,
        body: JSON.stringify(request),
    });
}
export function findLoginId(request: AccountRecoveryRequest) {
    return apiRequest<string>("/api/auth/find-id", { method: "POST", auth: false, body: JSON.stringify(request) });
}
export function resetPassword(request: AccountRecoveryRequest) {
    return apiRequest<null>("/api/auth/password/reset", { method: "POST", auth: false, body: JSON.stringify(request) });
}

export async function login(loginId: string, password: string) {
    const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ loginId, password }),
    });
    saveAuthTokens(response, response.name);
    return response;
}

export async function logout() {
    try {
        await apiRequest<null>("/api/auth/logout", {
            method: "POST",
            retryOnUnauthorized: false,
        });
    } finally {
        clearAuthTokens();
    }
}

export function sendEmailVerificationCode(email: string) {
    return apiRequest<null>("/api/auth/email/send-code", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email }),
    });
}

export function verifyEmailCode(email: string, code: string) {
    return apiRequest<null>("/api/auth/email/verify-code", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, code }),
    });
}

export function signup(request: {
    loginId: string;
    password: string;
    name: string;
    email: string;
    birthdate: string;
    investmentLevel?: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
}) {
    return apiRequest<SignupResponse>("/api/auth/signup", {
        method: "POST",
        auth: false,
        body: JSON.stringify(request),
    });
}
