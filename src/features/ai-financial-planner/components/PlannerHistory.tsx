import { PlusIcon } from "@/components/icons/Icon";
import type { PlanningSession } from "@/lib/api/ai";
export default function PlannerHistory({ onNewDiagnosis, onNewChat, loading, sessions, selectedId, onSelect }: {
    onNewDiagnosis: () => void; onNewChat: () => void; loading: boolean; sessions: PlanningSession[]; selectedId: number | null; onSelect: (id: number) => void;
}) {
    return <aside className="flex shrink-0 flex-col border-b border-hairline bg-canvas lg:w-[240px] lg:border-r lg:border-b-0">
        <div className="flex gap-2 p-3 lg:flex-col"><button type="button" disabled={loading} onClick={onNewChat} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><PlusIcon className="h-4 w-4" />새 채팅</button>
        <button type="button" disabled={loading} onClick={onNewDiagnosis} className="rounded-lg border border-hairline px-4 py-2 text-sm text-muted disabled:opacity-50">투자 성향 다시 진단</button></div>
        <p className="hidden px-6 pb-2 text-xs text-muted lg:block">최근 대화</p>
        <div className="flex max-h-24 overflow-auto lg:max-h-none lg:flex-1 lg:flex-col">{sessions.map(session => <button type="button" key={session.sessionId} onClick={() => onSelect(session.sessionId)} aria-pressed={selectedId === session.sessionId} className={`shrink-0 px-6 py-3 text-left text-sm ${selectedId === session.sessionId ? "bg-primary/10 text-primary" : "hover:bg-surface-soft"}`}>{session.title || "새 상담"}</button>)}</div>
        {!loading && !sessions.length && <p className="hidden px-6 text-xs text-muted lg:block">아직 대화 기록이 없습니다.</p>}
    </aside>;
}
