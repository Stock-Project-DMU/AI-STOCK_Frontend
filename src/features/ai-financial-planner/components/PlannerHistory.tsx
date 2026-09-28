import { useState, type FormEvent } from "react";
import { PlusIcon } from "@/components/icons/Icon";
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
    const [draftTitle, setDraftTitle] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const deletingSession = sessions.find(session => session.sessionId === deletingId);

    function beginEdit(session: PlanningSession) {
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
                const title = session.title || "새 상담";
                return <div key={session.sessionId} className={`w-60 max-w-full shrink-0 border-l-2 p-2 ${selectedId === session.sessionId ? "border-primary bg-primary/6" : "border-transparent hover:bg-surface-soft"}`}>
                    {editing ? <form onSubmit={event => void saveTitle(event, session.sessionId)} className="space-y-2">
                        <input autoFocus aria-label="채팅명" value={draftTitle} maxLength={100} onChange={event => setDraftTitle(event.target.value)} disabled={busyId !== null} className="w-full rounded border border-hairline bg-white px-2 py-1 text-sm outline-none focus:border-primary" />
                        <div className="flex gap-1.5 text-xs"><button type="submit" disabled={!draftTitle.trim() || busyId !== null} className="rounded-md bg-primary px-2.5 py-1 font-semibold text-white disabled:opacity-50">저장</button><button type="button" onClick={() => setEditingId(null)} disabled={busyId !== null} className="rounded-md border border-hairline bg-white px-2.5 py-1 text-body disabled:opacity-50">취소</button></div>
                    </form> : <>
                        <div className="flex min-w-0 items-center gap-1">
                            <button type="button" onClick={() => onSelect(session.sessionId)} aria-pressed={selectedId === session.sessionId} disabled={busyId !== null} title={title} className={`min-w-0 flex-1 truncate text-left text-sm ${selectedId === session.sessionId ? "font-semibold text-primary" : "text-body"}`}>{title}</button>
                            <button type="button" onClick={() => beginEdit(session)} aria-label={`${title} 이름 수정`} disabled={busyId !== null} className="shrink-0 rounded-md border border-hairline bg-white px-2 py-1 text-xs font-semibold text-body hover:border-primary hover:text-primary disabled:opacity-50">수정</button>
                            <button type="button" onClick={() => { setDeletingId(session.sessionId); setEditingId(null); setError(""); }} aria-label={`${title} 삭제`} disabled={busyId !== null} className="shrink-0 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">삭제</button>
                        </div>
                    </>}
                </div>;
            })}
        </div>
        {!loading && !sessions.length && <p className="cq-medium-show hidden px-6 text-xs text-muted">아직 대화 기록이 없습니다.</p>}
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
