import { apiRequest, saveAuthenticatedUserName } from "./client";
import type { InvestmentProfileResponse, UserInfoResponse } from "./types";

export function getMyInfo(signal?: AbortSignal) {
    return apiRequest<UserInfoResponse>("/api/users/me", { signal });
}

export async function updateMyInfo(name: string, email: string, birthdate?: string) {
    const response = await apiRequest<UserInfoResponse>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email, birthdate }),
    });
    saveAuthenticatedUserName(response.name);
    return response;
}

export function getInvestmentProfile() {
    return apiRequest<InvestmentProfileResponse | null>("/api/users/me/investment-profile");
}
export function updateInvestmentProfile(request: InvestmentProfileResponse) {
    return apiRequest<InvestmentProfileResponse>("/api/users/me/investment-profile", { method: "PUT", body: JSON.stringify(request) });
}
export function changePassword(currentPassword: string, newPassword: string) {
    return apiRequest<null>("/api/users/me/password", { method: "PATCH", retryOnUnauthorized: false, body: JSON.stringify({ currentPassword, newPassword }) });
}

export function saveInvestmentSurvey(request: {
    answers: number[];
    investmentTendency: number;
    fundTendency: number;
}) {
    return apiRequest<InvestmentProfileResponse>("/api/users/me/survey", {
        method: "POST",
        body: JSON.stringify(request),
    });
}
export async function updateProfile(request: {
    currentPassword: string;
    user: { name: string; email: string; birthdate: string };
    investment?: InvestmentProfileResponse;
    passwordChange?: { currentPassword: string; newPassword: string };
}) {
    const result = await apiRequest<UserInfoResponse>("/api/users/me/profile", { method: "PATCH", retryOnUnauthorized: false, body: JSON.stringify(request) });
    saveAuthenticatedUserName(result.name);
    return result;
}
