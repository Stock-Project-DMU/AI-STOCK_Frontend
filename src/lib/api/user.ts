import { apiRequest } from "./client";
import type { InvestmentProfileResponse, UserInfoResponse } from "./types";

export function getMyInfo() {
    return apiRequest<UserInfoResponse>("/api/users/me");
}

export function updateMyInfo(name: string, email: string) {
    return apiRequest<UserInfoResponse>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
    });
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
