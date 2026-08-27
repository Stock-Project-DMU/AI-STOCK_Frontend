"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserIcon } from "@/components/icons/Icon";
import { ProtectedPageSkeleton } from "@/components/common/PageSkeletons";
import {
    AUTH_STATE_CHANGE_EVENT,
    ApiError,
    getAuthenticatedUserName,
    isAuthenticated,
    saveAuthenticatedUserName,
} from "@/lib/api/client";
import { getMyInfo } from "@/lib/api/user";

const PROTECTED_PATHS = [
    "/ai-financial-planner",
    "/ai-market-briefing",
    "/goal-simulation",
    "/my-page",
] as const;

type AuthGuardContextValue = {
    authReady: boolean;
    authenticated: boolean;
    userName: string | null;
    requireLogin: () => boolean;
};

const AuthGuardContext = createContext<AuthGuardContextValue | null>(null);
const USER_INFO_RETRY_DELAYS_MS = [500, 1_500] as const;

function isRetryableUserInfoError(error: unknown) {
    return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

function waitForRetry(delayMs: number, signal: AbortSignal) {
    return new Promise<boolean>((resolve) => {
        if (signal.aborted) {
            resolve(false);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            signal.removeEventListener("abort", handleAbort);
            resolve(true);
        }, delayMs);
        const handleAbort = () => {
            window.clearTimeout(timeoutId);
            resolve(false);
        };

        signal.addEventListener("abort", handleAbort, { once: true });
    });
}

function isProtectedPath(pathname: string) {
    return PROTECTED_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
}

export default function AuthGuardProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authReady, setAuthReady] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [requestedModalOpen, setRequestedModalOpen] = useState(false);
    const authSyncControllerRef = useRef<AbortController | null>(null);
    const directRouteBlocked = authReady && !authenticated && isProtectedPath(pathname);
    const modalOpen = directRouteBlocked || requestedModalOpen;

    useEffect(() => {
        const syncAuthState = async () => {
            authSyncControllerRef.current?.abort();
            const controller = new AbortController();
            authSyncControllerRef.current = controller;
            const nextAuthenticated = isAuthenticated();
            const cachedUserName = nextAuthenticated
                ? getAuthenticatedUserName()
                : null;

            setAuthenticated(nextAuthenticated);
            setUserName(cachedUserName);
            setAuthReady(true);

            if (!nextAuthenticated || cachedUserName) return;

            for (let attempt = 0; attempt <= USER_INFO_RETRY_DELAYS_MS.length; attempt += 1) {
                try {
                    const user = await getMyInfo(controller.signal);
                    if (controller.signal.aborted || !isAuthenticated()) return;

                    setUserName(user.name);
                    saveAuthenticatedUserName(user.name);
                    return;
                } catch (error) {
                    if (controller.signal.aborted) return;

                    if (!isAuthenticated()) {
                        setAuthenticated(false);
                        setUserName(null);
                        return;
                    }

                    const retryDelay = USER_INFO_RETRY_DELAYS_MS[attempt];
                    if (retryDelay === undefined || !isRetryableUserInfoError(error)) {
                        return;
                    }

                    if (!(await waitForRetry(retryDelay, controller.signal))) return;
                }
            }
        };

        void syncAuthState();
        const handleAuthStateChange = () => void syncAuthState();
        window.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
        window.addEventListener("storage", handleAuthStateChange);

        return () => {
            authSyncControllerRef.current?.abort();
            window.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
            window.removeEventListener("storage", handleAuthStateChange);
        };
    }, []);

    const requireLogin = useCallback(() => {
        if (!authReady) return false;
        if (authenticated) return true;
        setRequestedModalOpen(true);
        return false;
    }, [authReady, authenticated]);

    const closeModal = useCallback(() => {
        setRequestedModalOpen(false);
        if (directRouteBlocked) router.replace("/home");
    }, [directRouteBlocked, router]);

    const moveToLogin = useCallback(() => {
        setRequestedModalOpen(false);
        router.replace("/login");
    }, [router]);

    useEffect(() => {
        if (!modalOpen) return;

        const previousOverflow = document.body.style.overflow;
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeModal();
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [closeModal, modalOpen]);

    const value = useMemo(
        () => ({ authReady, authenticated, userName, requireLogin }),
        [authReady, authenticated, userName, requireLogin],
    );

    return (
        <AuthGuardContext.Provider value={value}>
            {children}
            {modalOpen && (
                <LoginRequiredModal onClose={closeModal} onLogin={moveToLogin} />
            )}
        </AuthGuardContext.Provider>
    );
}

export function ProtectedRouteGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { authReady, authenticated } = useAuthGuard();

    if (isProtectedPath(pathname) && (!authReady || !authenticated)) {
        return <ProtectedPageSkeleton pathname={pathname} />;
    }

    return children;
}

export function useAuthGuard() {
    const context = useContext(AuthGuardContext);
    if (!context) {
        throw new Error("useAuthGuard must be used within AuthGuardProvider.");
    }
    return context;
}

function LoginRequiredModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
            onMouseDown={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-required-title"
                aria-describedby="login-required-description"
                className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-6 text-center shadow-2xl sm:p-7"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                    <UserIcon />
                </div>
                <h2 id="login-required-title" className="mt-4 text-xl font-black text-ink">
                    로그인이 필요한 서비스입니다
                </h2>
                <p id="login-required-description" className="mt-2 text-sm leading-6 text-muted">
                    해당 기능을 이용하려면 먼저 로그인해 주세요.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-bold text-body hover:bg-surface-soft"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={onLogin}
                        className="rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-active"
                    >
                        로그인하기
                    </button>
                </div>
            </section>
        </div>
    );
}
