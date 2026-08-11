import { apiRequest, saveAuthTokens } from "./client";
import type { LoginResponse, SignupResponse } from "./types";

export async function login(loginId: string, password: string) {
    const response = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ loginId, password }),
    });
    saveAuthTokens(response);
    return response;
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
}) {
    return apiRequest<SignupResponse>("/api/auth/signup", {
        method: "POST",
        auth: false,
        body: JSON.stringify(request),
    });
}
