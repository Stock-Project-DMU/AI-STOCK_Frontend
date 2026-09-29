"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";

type NotificationType = "SYSTEM" | "ORDER" | "AI" | "SIMULATION" | "NEWS" | "ACCOUNT";
type Notification = {
    notiId: number;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
};

const destination: Partial<Record<NotificationType, string>> = {
    ACCOUNT: "/my-page",
    ORDER: "/my-page",
    NEWS: "/ai-market-briefing",
    SIMULATION: "/goal-simulation",
    AI: "/ai-financial-planner",
};

const category: Record<NotificationType, string> = {
    SYSTEM: "공지",
    ORDER: "주문",
    AI: "AI",
    SIMULATION: "목표",
    NEWS: "시황",
    ACCOUNT: "계좌",
};

export default function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [readingId, setReadingId] = useState<number | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    const refreshCount = useCallback(async () => {
        try {
            const result = await apiRequest<{ unreadCount: number }>("/api/notifications/unread-count");
            setUnreadCount(result.unreadCount);
        } catch {
            // 다음 주기나 패널을 열 때 다시 동기화합니다.
        }
    }, []);

    const refreshItems = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
            setError("");
        }
        try {
            const result = await apiRequest<Notification[]>("/api/notifications");
            setItems(result);
            setUnreadCount(result.filter(item => !item.isRead).length);
        } catch (cause) {
            if (!silent) setError(getApiErrorMessage(cause, "알림을 불러오지 못했습니다."));
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const initialFetchId = window.setTimeout(() => void refreshCount(), 0);
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void refreshCount();
        }, 15000);
        const onFocus = () => void refreshCount();
        window.addEventListener("focus", onFocus);
        return () => {
            window.clearTimeout(initialFetchId);
            window.clearInterval(intervalId);
            window.removeEventListener("focus", onFocus);
        };
    }, [refreshCount]);

    useEffect(() => {
        if (!open) return;
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void refreshItems(true);
        }, 15000);
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, refreshItems]);

    function toggle() {
        if (!open) void refreshItems();
        setOpen(value => !value);
    }

    async function markAsRead(item: Notification) {
        if (item.isRead || readingId !== null) return;
        setReadingId(item.notiId);
        setError("");
        try {
            await apiRequest(`/api/notifications/${item.notiId}/read`, { method: "PATCH" });
            setItems(current => current.map(entry => entry.notiId === item.notiId ? { ...entry, isRead: true } : entry));
            setUnreadCount(current => Math.max(0, current - 1));
        } catch (cause) {
            setError(getApiErrorMessage(cause, "읽음 처리에 실패했습니다."));
        } finally {
            setReadingId(null);
        }
    }

    return (
        <div ref={rootRef} className="relative">
            <button type="button" onClick={toggle} aria-label={`알림${unreadCount ? `, 읽지 않은 알림 ${unreadCount}개` : ""}`} aria-expanded={open} aria-controls="notification-center"
                className="relative flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-canvas text-body hover:bg-surface-soft hover:text-ink">
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
                </svg>
                {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-up px-1 text-[10px] font-bold leading-5 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            {open && <section id="notification-center" aria-label="내 알림" className="fixed right-3 top-[76px] z-[60] flex max-h-[min(56vh,420px)] w-[min(88vw,320px)] flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-xl sm:right-6">
                <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5">
                    <div><h2 className="text-sm font-bold text-ink">알림</h2><p className="text-[11px] text-muted">읽지 않은 알림 {unreadCount}개</p></div>
                    <button type="button" onClick={() => void refreshItems()} disabled={loading} className="text-xs font-semibold text-primary disabled:opacity-50">새로고침</button>
                </div>
                {error && <p role="alert" className="px-3 py-2 text-xs text-up">{error}</p>}
                <div className="min-h-0 overflow-y-auto">
                    {loading && <p role="status" className="p-3 text-xs text-muted">알림을 불러오는 중입니다.</p>}
                    {!loading && !error && items.length === 0 && <p className="p-5 text-center text-xs text-muted">아직 알림이 없습니다.</p>}
                    {!loading && items.map(item => {
                        const href = destination[item.type];
                        const details = <>
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0"><span className="text-[10px] font-semibold text-primary">{category[item.type] ?? "알림"}</span><h3 className="text-xs font-bold text-ink">{item.title}</h3></div>
                                {!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="읽지 않음" />}
                            </div>
                            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-[18px] text-body">{item.content}</p>
                            <time className="mt-1.5 block text-[10px] text-muted">{formatDateTime(item.createdAt)}</time>
                        </>;
                        return <article key={item.notiId} className={`border-b border-hairline last:border-b-0 ${item.isRead ? "bg-canvas" : "bg-primary/5"}`}>
                            {href ? <Link href={href} onClick={() => { void markAsRead(item); setOpen(false); }} className="block px-3 py-2.5 text-left transition-colors hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-primary">{details}</Link>
                                : <button type="button" onClick={() => void markAsRead(item)} disabled={item.isRead || readingId !== null} className="block w-full px-3 py-2.5 text-left transition-colors enabled:hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default">{details}</button>}
                        </article>;
                    })}
                </div>
            </section>}
        </div>
    );
}
