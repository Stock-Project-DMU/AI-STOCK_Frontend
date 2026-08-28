import type { ApiResponse, AuthTokens } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "aistock.accessToken";
const REFRESH_TOKEN_KEY = "aistock.refreshToken";
const USER_NAME_KEY = "aistock.userName";
export const AUTH_STATE_CHANGE_EVENT = "aistock:auth-state-change";

let refreshRequest: Promise<boolean> | null = null;

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

function getStorage() {
    return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken() {
    return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken() {
    return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function getAuthenticatedUserName() {
    return getStorage()?.getItem(USER_NAME_KEY) ?? null;
}

export function saveAuthTokens(tokens: AuthTokens, userName?: string) {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    if (userName !== undefined) storage.setItem(USER_NAME_KEY, userName);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function saveAuthenticatedUserName(userName: string) {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(USER_NAME_KEY, userName);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function clearAuthTokens() {
    const storage = getStorage();
    if (!storage) return;

    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_NAME_KEY);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function isAuthenticated() {
    return Boolean(getAccessToken());
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
        return (await response.json()) as ApiResponse<T>;
    } catch {
        throw new ApiError("서버 응답을 확인할 수 없습니다.", response.status);
    }
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const payload = await parseResponse<AuthTokens>(response);

        if (!response.ok || !payload.success) {
            clearAuthTokens();
            return false;
        }

        saveAuthTokens(payload.data);
        return true;
    } catch {
        clearAuthTokens();
        return false;
    }
}

type ApiRequestOptions = RequestInit & {
    auth?: boolean;
    retryOnUnauthorized?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
        auth = true,
        retryOnUnauthorized = true,
        headers: providedHeaders,
        ...requestInit
    } = options;
    const headers = new Headers(providedHeaders);

    if (requestInit.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (auth) {
        const accessToken = getAccessToken();
        if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, { ...requestInit, headers });
    } catch {
        throw new ApiError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.", 0);
    }

    if (response.status === 401 && auth && retryOnUnauthorized) {
        refreshRequest ??= refreshAccessToken().finally(() => {
            refreshRequest = null;
        });

        if (await refreshRequest) {
            return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
        }
    }

    const payload = await parseResponse<T>(response);
    if (!response.ok || !payload.success) {
        throw new ApiError(payload.message || "요청 처리에 실패했습니다.", response.status);
    }

    return payload.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
    return error instanceof ApiError ? error.message : fallback;
}
