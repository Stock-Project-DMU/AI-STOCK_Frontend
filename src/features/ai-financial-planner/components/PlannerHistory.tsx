import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontalIcon, PlusIcon } from "@/components/icons/Icon";
import type { PlanningSession } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

type PlannerHistoryProps = {
    onNewDiagnosis: () => void;
    onNewChat: () => void;
    loading: boolean;
    sessions: PlanningSession[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onRename: (id: number, title: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
};

export default function PlannerHistory({ onNewDiagnosis, onNewChat, loading, sessions, selectedId, onSelect, onRename, onDelete }: PlannerHistoryProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; arrowLeft: number; above: boolean } | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const openMenuRef = useRef<HTMLDivElement | null>(null);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const firstMenuOptionRef = useRef<HTMLButtonElement | null>(null);
    const deletingSession = sessions.find(session => session.sessionId === deletingId);
    const menuSession = sessions.find(session => session.sessionId === openMenuId);

    useEffect(() => {
        if (openMenuId === null) return;
        const closeOnOutsideInteraction = (event: PointerEvent | FocusEvent) => {
            const target = event.target as Node;
            if (!openMenuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) setOpenMenuId(null);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpenMenuId(null);
            menuButtonRef.current?.focus();
        };
        const closeOnScroll = () => setOpenMenuId(null);
        document.addEventListener("pointerdown", closeOnOutsideInteraction);
        document.addEventListener("focusin", closeOnOutsideInteraction);
        document.addEventListener("keydown", closeOnEscape);
        window.addEventListener("scroll", closeOnScroll, true);
        window.addEventListener("resize", closeOnScroll);
        firstMenuOptionRef.current?.focus({ preventScroll: true });
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideInteraction);
            document.removeEventListener("focusin", closeOnOutsideInteraction);
            document.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("scroll", closeOnScroll, true);
            window.removeEventListener("resize", closeOnScroll);
        };
    }, [openMenuId]);

    function toggleMenu(id: number, button: HTMLButtonElement) {
        if (openMenuId === id) {
            setOpenMenuId(null);
            return;
        }
        const rect = button.getBoundingClientRect();
        const width = 160;
        const height = 84;
        const above = window.innerHeight - rect.bottom < height + 12 && rect.top > height + 12;
        const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
        setMenuPosition({
            top: above ? rect.top - height - 8 : rect.bottom + 8,
            left,
            arrowLeft: Math.max(12, Math.min(rect.left + rect.width / 2 - left - 5, width - 20)),
            above,
        });
        setOpenMenuId(id);
    }

    function beginEdit(session: PlanningSession) {
        setOpenMenuId(null);
        setEditingId(session.sessionId);
        setDraftTitle(session.title || "새 상담");
        setDeletingId(null);
        setError("");
    }

    async function saveTitle(event: FormEvent, id: number) {
        event.preventDefault();
        const title = draftTitle.trim();
        if (!title || busyId !== null) return;
        setBusyId(id);
        setError("");
        try {
            await onRename(id, title);
            setEditingId(null);
        } catch (renameError) {
            setError(getApiErrorMessage(renameError, "채팅명을 수정하지 못했습니다."));
        } finally {
            setBusyId(null);
        }
    }

    async function removeSession(id: number) {
        if (busyId !== null) return;
        setBusyId(id);
        setError("");
        try {
            await onDelete(id);
            setDeletingId(null);
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "채팅을 삭제하지 못했습니다."));
        } finally {
            setBusyId(null);
        }
    }

    return <aside className="cq-planner-history flex shrink-0 flex-col border-b border-hairline bg-canvas">
        <div className="cq-medium-flex-col flex gap-2 p-3">
            <button type="button" disabled={loading} onClick={onNewChat} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><PlusIcon className="h-4 w-4" />새 채팅</button>
            <button type="button" disabled={loading} onClick={onNewDiagnosis} className="rounded-lg border border-hairline px-4 py-2 text-sm text-muted disabled:opacity-50">투자 성향 다시 진단</button>
        </div>
        <p className="cq-medium-show hidden px-6 pb-2 text-xs font-medium text-muted">최근 대화</p>
        {error && deletingId === null && <p role="alert" className="px-3 pb-2 text-xs text-red-600">{error}</p>}
        <div className="cq-planner-session-list flex max-h-48 overflow-auto">
            {sessions.map(session => {
                const editing = editingId === session.sessionId;
                const menuOpen = openMenuId === session.sessionId;
                const title = session.title || "새 상담";
                return <div key={session.sessionId} className={`w-60 max-w-full shrink-0 border-l-2 p-2 ${selectedId === session.sessionId ? "border-primary bg-primary/6" : "border-transparent hover:bg-surface-soft"}`}>
                    {editing ? <form onSubmit={event => void saveTitle(event, session.sessionId)} className="flex min-w-0 items-center gap-1">
                        <input autoFocus aria-label="채팅명" value={draftTitle} maxLength={100} onChange={event => setDraftTitle(event.target.value)} disabled={busyId !== null} className="min-w-0 flex-1 rounded border border-hairline bg-white px-2 py-1.5 text-sm outline-none focus:border-primary" />
                        <button type="submit" disabled={!draftTitle.trim() || busyId !== null} className="shrink-0 rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50">저장</button>
                        <button type="button" onClick={() => setEditingId(null)} disabled={busyId !== null} className="shrink-0 rounded-md border border-hairline bg-white px-2 py-1.5 text-xs text-body disabled:opacity-50">취소</button>
                    </form> : <>
                        <div className="flex min-w-0 items-center gap-1">
                            <button type="button" onClick={() => { setOpenMenuId(null); onSelect(session.sessionId); }} aria-pressed={selectedId === session.sessionId} disabled={busyId !== null} title={title} className={`min-w-0 flex-1 truncate text-left text-sm ${selectedId === session.sessionId ? "font-semibold text-primary" : "text-body"}`}>{title}</button>
                            <button type="button" ref={menuOpen ? menuButtonRef : null} onClick={event => toggleMenu(session.sessionId, event.currentTarget)} aria-label={`${title} 옵션 ${menuOpen ? "닫기" : "열기"}`} aria-expanded={menuOpen} aria-controls={menuOpen ? `planner-session-options-${session.sessionId}` : undefined} disabled={busyId !== null} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-white text-muted hover:border-primary hover:text-primary disabled:opacity-50"><MoreHorizontalIcon /></button>
                        </div>
                    </>}
                </div>;
            })}
        </div>
        {!loading && !sessions.length && <p className="cq-medium-show hidden px-6 text-xs text-muted">아직 대화 기록이 없습니다.</p>}
        {menuSession && menuPosition && createPortal(
            <div ref={openMenuRef} id={`planner-session-options-${menuSession.sessionId}`} role="group" aria-label={`${menuSession.title || "새 상담"} 상담 옵션`} style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[60] h-[84px] w-40 rounded-lg border border-hairline bg-canvas p-1.5 shadow-xl">
                <span aria-hidden="true" style={{ left: menuPosition.arrowLeft }} className={`absolute h-2.5 w-2.5 rotate-45 border-hairline bg-canvas ${menuPosition.above ? "-bottom-1.5 border-b border-r" : "-top-1.5 border-l border-t"}`} />
                <button ref={firstMenuOptionRef} type="button" onClick={() => beginEdit(menuSession)} className="relative block h-9 w-full rounded-md px-3 text-left text-xs font-semibold text-body hover:bg-surface-soft hover:text-primary">수정</button>
                <button type="button" onClick={() => { setOpenMenuId(null); setDeletingId(menuSession.sessionId); setEditingId(null); setError(""); }} className="relative block h-9 w-full rounded-md px-3 text-left text-xs font-semibold text-red-600 hover:bg-red-50">삭제</button>
            </div>,
            document.body,
        )}
        {deletingSession && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget && busyId === null) setDeletingId(null); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="planner-delete-title" aria-describedby="planner-delete-description" onKeyDown={event => { if (event.key === "Escape" && busyId === null) setDeletingId(null); }} className="w-full max-w-sm rounded-xl border border-hairline bg-white p-6 shadow-2xl">
                <h2 id="planner-delete-title" className="text-lg font-bold text-ink">채팅을 삭제할까요?</h2>
                <p id="planner-delete-description" className="mt-3 text-sm leading-6 text-body"><strong className="break-all text-ink">{deletingSession.title || "새 상담"}</strong> 채팅과 대화 내용이 함께 삭제됩니다.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" autoFocus onClick={() => setDeletingId(null)} disabled={busyId !== null} className="rounded-lg border border-hairline bg-white px-4 py-2 text-sm font-semibold text-body hover:bg-surface-soft disabled:opacity-50">취소</button>
                    <button type="button" onClick={() => void removeSession(deletingSession.sessionId)} disabled={busyId !== null} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{busyId === deletingSession.sessionId ? "삭제 중..." : "삭제"}</button>
                </div>
            </div>
        </div>}
    </aside>;
}
