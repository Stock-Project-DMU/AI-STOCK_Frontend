"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HEADER_LINKS } from "@/constants/navigation";
import { CloseIcon, SearchIcon, UserIcon } from "@/components/icons/Icon";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import { getStockSearchSuggestions, type StockSearchSuggestion } from "@/lib/api/market";
import { logout } from "@/lib/api/auth";
import NotificationCenter, { NotificationPopups } from "./NotificationCenter";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { authReady, authenticated, userName, role } = useAuthGuard();
    const [loggingOut, setLoggingOut] = useState(false);

    const [query, setQuery] = useState("");
    const [searchError, setSearchError] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<StockSearchSuggestion[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const [suggestionStatus, setSuggestionStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchToggleRef = useRef<HTMLButtonElement>(null);
    const lastSuggestionRequestAt = useRef(0);

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    useEffect(() => {
        const value = query.trim();
        if (!value) return;

        const controller = new AbortController();
        const throttleWait = Math.max(0, 500 - (Date.now() - lastSuggestionRequestAt.current));
        const timer = window.setTimeout(async () => {
            lastSuggestionRequestAt.current = Date.now();
            try {
                const matches = await getStockSearchSuggestions(value, controller.signal);
                if (!controller.signal.aborted) {
                    setSuggestions(matches);
                    setActiveSuggestionIndex(-1);
                    setSuggestionStatus("ready");
                }
            } catch {
                if (!controller.signal.aborted) setSuggestionStatus("error");
            }
        }, Math.max(250, throttleWait));

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    function closeSearch() {
        setSearchOpen(false);
        setQuery("");
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
        setSuggestionStatus("idle");
        setSearchError("");
    }

    function openStock(stockCode: string) {
        closeSearch();
        router.push(`/stock-detail?code=${stockCode}`);
    }

    function updateQuery(value: string) {
        setQuery(value);
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
        setSuggestionStatus(value.trim() ? "loading" : "idle");
        setSearchError("");
    }

    async function search(event: React.FormEvent) {
        event.preventDefault();
        if (!query.trim() || searching) return;
        if (suggestions.length > 0) {
            openStock(suggestions[0].stockCode);
            return;
        }
        setSearching(true); setSearchError("");
        try {
            const code = await apiRequest<string>(`/api/market/search?query=${encodeURIComponent(query.trim())}`, { auth: false });
            openStock(code);
        } catch (error) { setSearchError(getApiErrorMessage(error, "종목을 찾지 못했습니다.")); }
        finally { setSearching(false); }
    }
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
        <>
        {searchOpen && (
            <button type="button" aria-label="검색창 바깥 영역 닫기" onClick={closeSearch} className="fixed inset-0 z-40 bg-black/25 2xl:hidden" />
        )}
        <header className="sticky top-0 z-50 h-[72px] border-b border-hairline bg-canvas/95 px-4 text-ink shadow-[0_1px_0_rgba(10,11,13,0.04)] backdrop-blur-xl lg:px-7">
            <div className="mx-auto grid h-full max-w-[1760px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                <Link href="/home" className="flex items-center" aria-label="AI STOCK 홈">
                    <img src="/images/brand/logo-main.png" alt="AI STOCK" className="h-17 w-auto object-contain" width={137} height={68} />
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
                    <button
                        ref={searchToggleRef}
                        type="button"
                        aria-label={searchOpen ? "종목 검색 닫기" : "종목 검색 열기"}
                        aria-expanded={searchOpen}
                        aria-controls="header-stock-search"
                        onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-hairline text-body hover:bg-surface-soft hover:text-ink 2xl:hidden"
                    >
                        {searchOpen ? <CloseIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
                    </button>
                    <form
                        id="header-stock-search"
                        onSubmit={search}
                        onBlur={event => {
                            if (!searchOpen && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                setQuery("");
                                setSuggestions([]);
                                setActiveSuggestionIndex(-1);
                                setSuggestionStatus("idle");
                            }
                        }}
                        onKeyDown={event => {
                            if (event.key === "Escape") {
                                closeSearch();
                                searchToggleRef.current?.focus();
                            } else if (event.key === "ArrowDown" && suggestions.length > 0) {
                                event.preventDefault();
                                setActiveSuggestionIndex(index => (index + 1) % suggestions.length);
                            } else if (event.key === "ArrowUp" && suggestions.length > 0) {
                                event.preventDefault();
                                setActiveSuggestionIndex(index => (index - 1 + suggestions.length) % suggestions.length);
                            } else if (event.key === "Enter" && activeSuggestionIndex >= 0) {
                                event.preventDefault();
                                openStock(suggestions[activeSuggestionIndex].stockCode);
                            }
                        }}
                        className={`absolute left-1/2 top-[calc(100%+12px)] z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-2 rounded-lg border border-hairline bg-canvas p-3 shadow-lg ${searchOpen ? "flex" : "hidden"} 2xl:relative 2xl:left-auto 2xl:top-auto 2xl:w-auto 2xl:max-w-none 2xl:translate-x-0 2xl:flex 2xl:gap-0 2xl:rounded-md 2xl:bg-surface-soft 2xl:px-3.5 2xl:py-0 2xl:shadow-none`}
                    >
                        <SearchIcon className="h-4 w-4 text-muted" />
                        <input ref={searchInputRef} maxLength={100} role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls="header-stock-suggestions" aria-activedescendant={activeSuggestionIndex >= 0 ? `header-stock-suggestion-${activeSuggestionIndex}` : undefined} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-muted-soft 2xl:w-36 2xl:flex-none" placeholder="종목명·코드 검색" aria-label="종목명·코드 검색" value={query} onChange={event => updateQuery(event.target.value)} disabled={searching} />
                        <button type="submit" className="text-xs" disabled={searching}>검색</button>
                        {query.trim() && (
                            <div id="header-stock-suggestions" role={suggestions.length > 0 ? "listbox" : undefined} className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-lg border border-hairline bg-canvas p-1 shadow-lg">
                                {suggestionStatus === "loading" && <p role="status" className="px-3 py-2 text-xs text-muted">종목을 찾는 중...</p>}
                                {suggestionStatus === "ready" && suggestions.length === 0 && <p role="status" className="px-3 py-2 text-xs text-muted">일치하는 종목이 없습니다.</p>}
                                {suggestionStatus === "error" && <p role="alert" className="px-3 py-2 text-xs text-up">검색 목록을 불러오지 못했습니다.</p>}
                                {suggestions.map((stock, index) => (
                                    <button key={stock.stockCode} id={`header-stock-suggestion-${index}`} role="option" aria-selected={activeSuggestionIndex === index} type="button" onMouseEnter={() => setActiveSuggestionIndex(index)} onClick={() => openStock(stock.stockCode)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-surface-soft focus-visible:bg-surface-soft ${activeSuggestionIndex === index ? "bg-surface-soft" : ""}`}>
                                        <span className="font-semibold text-ink">{stock.stockName}</span>
                                        <span className="text-xs text-muted">{stock.stockCode}</span>
                                    </button>
                                ))}
                                {searchError && <p role="alert" className="px-3 py-2 text-xs text-up">{searchError}</p>}
                            </div>
                        )}
                    </form>
                    {!authReady ? (
                        <span aria-hidden="true" className="h-9 w-20 animate-pulse rounded-full bg-surface-strong" />
                    ) : authenticated ? (
                        <div className="flex items-center gap-1.5">
                            {role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-hairline px-3 text-[12px] font-semibold text-body hover:bg-surface-soft hover:text-ink"
                                >
                                    관리자 페이지로
                                </Link>
                            )}
                            <NotificationCenter />
                            <NotificationPopups />
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
        </>
    );
}
