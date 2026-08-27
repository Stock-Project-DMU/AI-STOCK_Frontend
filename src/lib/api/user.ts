import { apiRequest, saveAuthenticatedUserName } from "./client";
import type { InvestmentProfileResponse, UserInfoResponse } from "./types";

export function getMyInfo(signal?: AbortSignal) {
    return apiRequest<UserInfoResponse>("/api/users/me", { signal });
}

export async function updateMyInfo(name: string, email: string) {
    const response = await apiRequest<UserInfoResponse>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
    });
    saveAuthenticatedUserName(response.name);
    return response;
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
