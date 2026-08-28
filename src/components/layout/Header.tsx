"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HEADER_LINKS } from "@/constants/navigation";
import { SearchIcon, UserIcon } from "@/components/icons/Icon";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { logout } from "@/lib/api/auth";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { authReady, authenticated, userName } = useAuthGuard();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);
        try {
            await logout();
        } catch {
            // 서버 요청이 실패해도 logout()에서 브라우저의 인증 정보는 정리됩니다.
        } finally {
            router.replace("/home");
            router.refresh();
            setLoggingOut(false);
        }
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 h-[72px] border-b border-hairline bg-canvas/95 px-4 text-ink shadow-[0_1px_0_rgba(10,11,13,0.04)] backdrop-blur-xl lg:px-7">
            <div className="mx-auto grid h-full max-w-[1760px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                <Link href="/home" className="flex items-center gap-2.5" aria-label="AI STOCK 홈">
                    <img src="/Logo.png" alt="" className="h-9 w-9 object-contain" width={36} height={36} />
                    <strong className="hidden text-base font-bold tracking-[0.12em] text-ink sm:block">AI STOCK</strong>
                </Link>

                <nav className="flex min-w-0 items-center justify-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="주요 메뉴">
                    {HEADER_LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold sm:px-3.5 sm:text-sm ${active ? "theme-accent-soft theme-accent-text" : "text-body hover:bg-surface-soft hover:text-ink"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-2.5">
                    <span className="group hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-700 transition-[background-color,border-color] duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-100/70 xl:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 transition-transform duration-200 ease-out group-hover:scale-125 motion-reduce:transform-none motion-reduce:transition-none" /> 모의투자
                    </span>
                    <label className="hidden items-center rounded-md border border-hairline bg-surface-soft px-3.5 2xl:flex">
                        <SearchIcon className="h-4 w-4 text-muted" />
                        <input className="w-36 bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-muted-soft" placeholder="종목명·코드 검색" />
                    </label>
                    {!authReady ? (
                        <span aria-hidden="true" className="h-9 w-20 animate-pulse rounded-full bg-surface-strong" />
                    ) : authenticated ? (
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-flex h-9 max-w-28 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-primary/20 bg-primary/5 px-3 text-xs font-semibold text-primary sm:max-w-44 sm:px-4 sm:text-sm"
                                aria-label={`로그인 사용자: ${userName ?? "사용자"}`}
                            >
                                <UserIcon />
                                <span className="truncate">{userName ? `${userName}님` : "내 정보"}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                disabled={loggingOut}
                                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-up px-3 text-[12px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loggingOut ? "처리 중" : "로그아웃"}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-active sm:px-5 sm:text-sm"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
