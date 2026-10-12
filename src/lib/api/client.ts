import type { ApiResponse, AuthTokens } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ACCESS_TOKEN_KEY = "aistock.accessToken";
const REFRESH_TOKEN_KEY = "aistock.refreshToken";
const USER_NAME_KEY = "aistock.userName";
const LOGIN_PROVIDER_KEY = "aistock.loginProvider";
export type LoginProvider = "KAKAO" | "NAVER" | "GOOGLE";
export const AUTH_STATE_CHANGE_EVENT = "aistock:auth-state-change";

let refreshRequest: Promise<boolean> | null = null;

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
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

export function getAuthenticatedLoginProvider(): LoginProvider | null {
    if (!getAccessToken()) return null;
    const provider = getStorage()?.getItem(LOGIN_PROVIDER_KEY);
    return provider === "KAKAO" || provider === "NAVER" || provider === "GOOGLE" ? provider : null;
}

export function saveAuthTokens(tokens: AuthTokens, userName?: string, loginProvider?: LoginProvider | null) {
    const storage = getStorage();
    if (!storage) return;

    storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    if (userName !== undefined) storage.setItem(USER_NAME_KEY, userName);
    if (loginProvider === null) storage.removeItem(LOGIN_PROVIDER_KEY);
    else if (loginProvider !== undefined) storage.setItem(LOGIN_PROVIDER_KEY, loginProvider);
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
    storage.removeItem(LOGIN_PROVIDER_KEY);
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
}

export function isAuthenticated() {
    return Boolean(getAccessToken());
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        throw new ApiError(getHttpErrorMessage(response.status), response.status);
    }
    if (!payload || typeof payload !== "object" || !("success" in payload)
        || typeof payload.success !== "boolean") {
        throw new ApiError(getHttpErrorMessage(response.status), response.status);
    }
    return payload as ApiResponse<T>;
}

function getHttpErrorMessage(status: number) {
    if (status === 401) return "로그인이 만료되었거나 인증이 필요합니다. 다시 로그인해 주세요.";
    if (status === 403) return "이 작업을 수행할 권한이 없습니다.";
    if (status === 404) return "요청한 정보를 찾을 수 없습니다.";
    if (status === 429) return "요청이 많아 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.";
    if (status === 502 || status === 503) return "서버가 준비 중이거나 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    if (status === 504 || status === 408) return "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
    if (status >= 500) return "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    if (status >= 400) return "요청을 처리할 수 없습니다. 입력 내용을 확인해 주세요.";
    return "서버 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.";
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { Authorization: `Bearer ${refreshToken}` },
        });
        if (response.status >= 500 || response.status === 429) {
            throw new ApiError(getHttpErrorMessage(response.status), response.status);
        }
        const payload = await parseResponse<AuthTokens>(response);

        if (!response.ok || !payload.success) {
            clearAuthTokens();
            return false;
        }

        saveAuthTokens(payload.data);
        return true;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.", 0);
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
    } catch (error) {
        if (error instanceof Error && error.name === "AbortError") throw error;
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
        const code = "code" in payload && typeof payload.code === "string" ? payload.code : undefined;
        const message = typeof payload.message === "string" && payload.message.trim()
            ? payload.message : getHttpErrorMessage(response.status);
        throw new ApiError(message, response.status, code);
    }

    return payload.data;
}

// 백엔드는 보통 한글 메시지를 그대로 내려주지만, 혹시 코드값만 오는 경우를 대비한 안전망.
const ERROR_CODE_MESSAGES: Record<string, string> = {
    DEPOSIT_LIMIT_EXCEEDED: "계좌 예치금은 최대 1조원까지 보유할 수 있습니다.",
    INVALID_TOKEN: "로그인이 만료되었거나 인증이 필요합니다. 다시 로그인해 주세요.",
    TOKEN_EXPIRED: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
    REFRESH_TOKEN_NOT_FOUND: "로그인이 만료되었습니다. 다시 로그인해 주세요.",
};

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (!(error instanceof ApiError)) return fallback;
    const authMessage = error.code && ["INVALID_TOKEN", "TOKEN_EXPIRED", "REFRESH_TOKEN_NOT_FOUND"].includes(error.code)
        ? ERROR_CODE_MESSAGES[error.code] : undefined;
    if (authMessage) return authMessage;
    if (["유효하지 않은 토큰입니다.", "만료된 토큰입니다.", "리프레시 토큰을 찾을 수 없습니다."].includes(error.message)) {
        return ERROR_CODE_MESSAGES.INVALID_TOKEN;
    }
    return ERROR_CODE_MESSAGES[error.message] ?? (/^[A-Z][A-Z0-9_]+$/.test(error.message) ? fallback : error.message);
}
