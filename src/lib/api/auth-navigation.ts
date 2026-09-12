import { clearAuthTokens } from "./client";
import { getMyInfo } from "./user";

export async function getLoginDestination(): Promise<"/admin" | "/home"> {
    try {
        const user = await getMyInfo();
        return user.role === "ADMIN" ? "/admin" : "/home";
    } catch (error) {
        clearAuthTokens();
        throw error;
    }
}
