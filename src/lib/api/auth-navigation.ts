import { clearAuthTokens } from "./client";
import type { UserInfoResponse } from "./types";
import { getMyInfo } from "./user";

export function needsSocialProfileCompletion(user: UserInfoResponse): boolean {
    return user.loginId === null && (
        !user.name?.trim() || user.name.trim() === "회원" || !user.email?.trim() || !user.birthdate
    );
}

export async function getLoginDestination(): Promise<"/admin" | "/home" | "/complete-profile"> {
    try {
        const user = await getMyInfo();
        if (needsSocialProfileCompletion(user)) return "/complete-profile";
        return user.role === "ADMIN" ? "/admin" : "/home";
    } catch (error) {
        clearAuthTokens();
        throw error;
    }
}
