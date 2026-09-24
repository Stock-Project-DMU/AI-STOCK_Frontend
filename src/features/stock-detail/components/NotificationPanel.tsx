"use client";
import { useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
type Notification = { notiId: number; title: string; content: string; isRead: boolean; createdAt: string };
export default function NotificationPanel() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    async function show() {
        if (open) { setOpen(false); return; }
        setOpen(true); setBusy(true); setError("");
        try { setItems(await apiRequest<Notification[]>("/api/notifications")); }
        catch (cause) { setError(getApiErrorMessage(cause, "알림을 불러오지 못했습니다.")); }
        finally { setBusy(false); }
    }
    async function read(id: number) {
        setBusy(true);
        try {
            await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
            setItems(current => current.map(item => item.notiId === id ? { ...item, isRead: true } : item));
        } catch (cause) { setError(getApiErrorMessage(cause, "읽음 처리에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="relative"><button disabled={busy} aria-expanded={open} onClick={() => void show()} className="rounded-full border border-hairline px-3 py-1">알림 내역</button>{open && <section className="absolute right-0 top-full z-30 mt-2 max-h-96 w-80 overflow-y-auto rounded border border-hairline bg-canvas p-4 shadow-lg"><h2 className="font-bold">내 알림</h2>{busy && <p role="status">불러오는 중…</p>}{error && <p role="alert">{error}</p>}{!busy && !error && !items.length && <p className="mt-3">알림이 없습니다.</p>}{items.map(item => <article key={item.notiId} className="mt-3 border-t border-hairline pt-3"><strong>{item.title}</strong><p className="my-2 whitespace-pre-wrap">{item.content}</p><small>{formatDateTime(item.createdAt)}</small>{!item.isRead && <button disabled={busy} onClick={() => void read(item.notiId)} className="ml-3 text-primary">읽음 처리</button>}</article>)}</section>}</div>;
}
