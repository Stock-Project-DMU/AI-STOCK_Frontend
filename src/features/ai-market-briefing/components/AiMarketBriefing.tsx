"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GearIcon, NewsIcon } from "@/components/icons/Icon";
import {
    getBriefingByDate, getBriefingHistory, getPlanningPreferences, savePlanningPreferences, syncNewsChatSessions,
    type NewsBriefing, type NewsChatSession, type NewsChatSessions, type PlanningPreferences,
} from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import FinancialSummary from "@/features/ai-financial-planner/components/FinancialSummary";
import BriefingSettings from "./BriefingSettings";
import NewsChat from "./NewsChat";
import SavedBriefingsModal from "./SavedBriefingsModal";

function belongsToSession(briefing: NewsBriefing, session: NewsChatSession) {
    return briefing.outletDomain === session.outletDomain
        && (briefing.deliveryTime ?? null) === (session.deliveryTime ?? null);
}

function sessionLabel(session: NewsChatSession) {
    if (!session.outletDomain) return "전체 뉴스";
    return `${session.outletName} · ${session.deliveryTime ? session.deliveryTime.slice(0, 5) : "이전 기록"}`;
}

export default function AiMarketBriefing() {
    const [view, setView] = useState<"chat" | "settings">("chat");
    const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
    const [sessions, setSessions] = useState<NewsChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [jumpTarget, setJumpTarget] = useState<{ date: string } | null>(null);
    const [historyError, setHistoryError] = useState("");
    const [sessionError, setSessionError] = useState("");
    const [preferences, setPreferences] = useState<PlanningPreferences | null>(null);
    const [savedLoading, setSavedLoading] = useState(true);
    const [savedError, setSavedError] = useState("");
    const [savedListOpen, setSavedListOpen] = useState(false);
    const [savingDate, setSavingDate] = useState<string | null>(null);
    const saving = useRef(false);
    const extraBriefings = useRef<NewsBriefing[]>([]);

    const refreshSessions = useCallback(async (selectCurrent = false): Promise<NewsChatSessions> => {
        const result = await syncNewsChatSessions();
        setSessions(result.sessions);
        setCurrentSessionId(result.currentSessionId);
        setSelectedSessionId(previous => selectCurrent || previous === null || !result.sessions.some(item => item.sessionId === previous)
            ? result.currentSessionId : previous);
        setSessionError("");
        return result;
    }, []);

    useEffect(() => {
        let active = true;
        syncNewsChatSessions().then(result => {
            if (!active) return;
            setSessions(result.sessions);
            setCurrentSessionId(result.currentSessionId);
            setSelectedSessionId(result.currentSessionId);
        }).catch(cause => { if (active) setSessionError(getApiErrorMessage(cause, "설정별 채팅을 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        let active = true;
        const refresh = () => {
            getBriefingHistory().then(items => {
                if (!active) return;
                const byDate = new Map(extraBriefings.current.map(item => [item.briefingDate, item]));
                items.forEach(item => byDate.set(item.briefingDate, item));
                setBriefings([...byDate.values()].sort((a, b) => b.briefingDate.localeCompare(a.briefingDate)));
                setHistoryError("");
            }).catch(cause => { if (active) setHistoryError(getApiErrorMessage(cause, "브리핑 기록을 불러오지 못했습니다.")); });
        };
        refresh();
        const timer = window.setInterval(() => { refresh(); void refreshSessions().catch(() => {}); }, 60_000);
        return () => { active = false; window.clearInterval(timer); };
    }, [refreshSessions]);

    useEffect(() => {
        let active = true;
        getPlanningPreferences().then(items => { if (active) setPreferences(items); })
            .catch(cause => { if (active) setSavedError(getApiErrorMessage(cause, "저장한 브리핑을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setSavedLoading(false); });
        return () => { active = false; };
    }, []);

    const selectedSession = sessions.find(item => item.sessionId === selectedSessionId) ?? null;
    const visibleBriefings = selectedSession ? briefings.filter(item => belongsToSession(item, selectedSession)) : [];
    const focusedDate = visibleBriefings.some(item => item.briefingDate === selectedDate)
        ? selectedDate : visibleBriefings[0]?.briefingDate ?? "";
    const savedDates = [...(preferences?.savedBriefingDates ?? [])].sort((a, b) => b.localeCompare(a));

    const updateSavedBriefing = async (date: string, shouldSave: boolean) => {
        if (saving.current) throw new Error("다른 저장 작업이 진행 중입니다.");
        saving.current = true;
        setSavingDate(date);
        try {
            const current = await getPlanningPreferences();
            const updated = await savePlanningPreferences({
                ...current,
                savedBriefingDates: shouldSave ? [...new Set([...current.savedBriefingDates, date])] : current.savedBriefingDates.filter(item => item !== date),
                linkedBriefingDates: shouldSave ? current.linkedBriefingDates : current.linkedBriefingDates.filter(item => item !== date),
            });
            setPreferences(updated);
            setSavedError("");
        } finally {
            saving.current = false;
            setSavingDate(null);
        }
    };

    const selectSession = (id: number) => {
        setSelectedSessionId(id);
        setSelectedDate("");
        setJumpTarget(null);
        setView("chat");
    };

    const openSavedBriefing = async (date: string) => {
        let briefing = briefings.find(item => item.briefingDate === date);
        if (!briefing) {
            try {
                briefing = await getBriefingByDate(date);
                extraBriefings.current = [...extraBriefings.current.filter(item => item.briefingDate !== date), briefing];
                setBriefings(current => [...current.filter(item => item.briefingDate !== date), briefing!].sort((a, b) => b.briefingDate.localeCompare(a.briefingDate)));
            } catch (cause) {
                setSavedError(getApiErrorMessage(cause, "저장한 브리핑을 불러오지 못했습니다."));
                return;
            }
        }
        try {
            const result = await refreshSessions();
            const target = result.sessions.find(item => belongsToSession(briefing!, item));
            if (!target) throw new Error("브리핑의 설정별 채팅을 찾지 못했습니다.");
            setSelectedSessionId(target.sessionId);
            setSelectedDate(date);
            setJumpTarget({ date });
            setView("chat");
            setSavedListOpen(false);
            setSavedError("");
        } catch (cause) {
            setSavedError(getApiErrorMessage(cause, "브리핑 채팅을 열지 못했습니다."));
        }
    };

    const settingSaved = () => {
        void refreshSessions(true).catch(cause => setSessionError(getApiErrorMessage(cause, "새 설정의 채팅을 불러오지 못했습니다.")));
    };

    return <div className="cq-medium-flex-row ai-chat-page market-theme market-grid flex min-h-[calc(100dvh-72px)] min-w-0 flex-col">
        <aside aria-label="AI 뉴스 시황 메뉴" className="cq-planner-history flex shrink-0 flex-col border-b border-hairline bg-canvas">
            <div className="p-3">
                <button type="button" onClick={() => { if (currentSessionId !== null) selectSession(currentSessionId); }} disabled={currentSessionId === null}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                    <NewsIcon className="h-4 w-4" />현재 설정 채팅
                </button>
            </div>
            {view === "chat" && <div className="shrink-0 border-b border-hairline px-3 pb-3">
                <button type="button" onClick={() => setSavedListOpen(true)} aria-haspopup="dialog" aria-expanded={savedListOpen}
                    className="flex w-full items-center justify-between rounded-lg border border-hairline px-4 py-2.5 text-left text-sm font-semibold text-body hover:border-primary hover:text-primary">
                    <span>저장한 브리핑</span>
                    {!savedLoading && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{savedDates.length}건</span>}
                </button>
            </div>}
            <p className="cq-medium-show hidden px-6 pb-2 text-xs font-medium text-muted">설정별 채팅</p>
            {historyError && <p role="alert" className="px-3 pb-2 text-xs text-red-600">{historyError}</p>}
            {sessionError && <p role="alert" className="px-3 pb-2 text-xs text-red-600">{sessionError}</p>}
            {sessionError && <button type="button" onClick={() => { void refreshSessions(true).catch(cause => setSessionError(getApiErrorMessage(cause, "설정별 채팅을 불러오지 못했습니다."))); }}
                className="mx-3 mb-3 self-start rounded-md border border-hairline px-3 py-1.5 text-xs text-body">다시 시도</button>}
            <div className="cq-planner-session-list flex max-h-48 overflow-auto">
                {sessions.map(item => <button key={item.sessionId} type="button" onClick={() => selectSession(item.sessionId)}
                    aria-current={view === "chat" && selectedSessionId === item.sessionId ? "page" : undefined}
                    className={`w-full shrink-0 border-l-2 px-4 py-3 text-left text-xs ${view === "chat" && selectedSessionId === item.sessionId ? "border-primary bg-primary/6 font-semibold text-primary" : "border-transparent text-body hover:bg-surface-soft"}`}>
                    <span className="block truncate font-semibold">{sessionLabel(item)}</span>
                </button>)}
            </div>
            <button type="button" onClick={() => setView("settings")} aria-pressed={view === "settings"}
                className="flex h-12 shrink-0 items-center gap-2 border-t border-hairline px-5 text-xs font-bold text-muted hover:text-ink">
                <GearIcon className="h-3.5 w-3.5" />브리핑 설정
            </button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {view === "chat" && <div className="cq-planner-chat-row flex min-h-0 min-w-0 flex-1 flex-col">
                {selectedSession ? <NewsChat key={selectedSession.sessionId} session={selectedSession} briefings={visibleBriefings}
                    focusedBriefingDate={focusedDate} jumpTarget={jumpTarget} savedBriefingDates={savedDates}
                    savingDate={savingDate} savedLoading={savedLoading} onSave={date => updateSavedBriefing(date, true)}
                    onRemove={date => updateSavedBriefing(date, false)}
                    onActivity={() => { void refreshSessions().catch(() => {}); }} />
                    : <p role="status" className="flex-1 p-6 text-sm text-muted">설정별 채팅을 불러오는 중입니다...</p>}
                <FinancialSummary />
            </div>}
            {view === "settings" && <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
                <BriefingSettings onSaved={settingSaved} />
            </div>}
        </div>
        {savedListOpen && <SavedBriefingsModal dates={savedDates} briefings={briefings} loading={savedLoading} error={savedError}
            savingDate={savingDate} onSelect={date => { void openSavedBriefing(date); }}
            onDelete={date => { void updateSavedBriefing(date, false).catch(cause => setSavedError(getApiErrorMessage(cause, "저장 목록에서 삭제하지 못했습니다."))); }}
            onClose={() => setSavedListOpen(false)} />}
    </div>;
}
