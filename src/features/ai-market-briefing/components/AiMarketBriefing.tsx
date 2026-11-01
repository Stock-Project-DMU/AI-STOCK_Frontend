"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GearIcon, MoreHorizontalIcon, NewsIcon } from "@/components/icons/Icon";
import {
    deleteNewsChatSession, getBriefingByDate, getBriefingHistory, getPlanningPreferences, savePlanningPreferences, syncNewsChatSessions,
    type NewsBriefing, type NewsChatSession, type NewsChatSessions, type PlanningPreferences,
} from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import FinancialSummary from "@/features/ai-financial-planner/components/FinancialSummary";
import BriefingSettings from "./BriefingSettings";
import NewsChat from "./NewsChat";
import SavedBriefingsModal from "./SavedBriefingsModal";
import { belongsToSession, briefingKey, findLatestByDate } from "../utils";

function sessionLabel(session: NewsChatSession) {
    if (!session.outletDomain) return "전체 뉴스";
    return `${session.outletName} · ${session.deliveryTime ? session.deliveryTime.slice(0, 5) : "이전 기록"}`;
}

// 채팅(설정)이 삭제된 뒤에도 저장 목록에 남은 브리핑은 열람할 수 있어야 한다 — 채팅 없이 내용만 보여준다.
function OrphanBriefingView({ briefing, saved, busy, savedLoading, onToggleSave, onBack }: {
    briefing: NewsBriefing; saved: boolean; busy: boolean; savedLoading: boolean;
    onToggleSave: () => void; onBack: () => void;
}) {
    return <section className="flex min-h-[540px] min-w-0 flex-1 flex-col bg-surface-soft">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-canvas px-6 font-bold">
            <button type="button" onClick={onBack} className="text-xs font-semibold text-primary hover:underline">← 현재 설정 채팅</button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 lg:p-8">
            <p className="text-xs text-muted">이 브리핑의 설정별 채팅은 삭제되어 더 이상 열람할 수 없습니다. 브리핑 내용만 보여드립니다.</p>
            <article className="min-w-0 rounded-lg border border-hairline bg-canvas px-5 py-4 text-sm leading-7 text-body">
                <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-primary">{briefing.briefingDate} · {briefing.outletName} 시황 브리핑</p>
                    <button type="button" disabled={savedLoading || busy} onClick={onToggleSave} className="shrink-0 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                        {busy ? "처리 중..." : saved ? "저장 해제" : "저장"}
                    </button>
                </div>
                <p className="whitespace-pre-wrap break-words">{briefing.content}</p>
            </article>
        </div>
    </section>;
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
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [orphanBriefing, setOrphanBriefing] = useState<NewsBriefing | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; arrowLeft: number; above: boolean } | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteBusyId, setDeleteBusyId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState("");
    const saving = useRef(false);
    const extraBriefings = useRef<NewsBriefing[]>([]);
    const openMenuRef = useRef<HTMLDivElement | null>(null);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);

    const applyBriefingItems = useCallback((items: NewsBriefing[]) => {
        const byKey = new Map(extraBriefings.current.map(item => [briefingKey(item), item]));
        items.forEach(item => byKey.set(briefingKey(item), item));
        setBriefings([...byKey.values()].sort((a, b) => b.briefingDate.localeCompare(a.briefingDate)));
    }, []);

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
                applyBriefingItems(items);
                setHistoryError("");
            }).catch(cause => { if (active) setHistoryError(getApiErrorMessage(cause, "브리핑 기록을 불러오지 못했습니다.")); });
        };
        refresh();
        const timer = window.setInterval(() => { refresh(); void refreshSessions().catch(() => {}); }, 60_000);
        return () => { active = false; window.clearInterval(timer); };
    }, [refreshSessions, applyBriefingItems]);

    // 설정 시각이 지나면 오늘의 새 브리핑이 올라오는지 더 촘촘히 확인한다(60초 주기만으로는 최대 1분 늦게 뜰 수 있어서).
    // 설정 시각+5초에 한 번 보고, 아직 없으면 5초 간격으로 최대 1분까지 더 확인하다가 새 브리핑이 오면 멈춘다.
    const currentSession = sessions.find(item => item.sessionId === currentSessionId) ?? null;
    useEffect(() => {
        if (!currentSession?.outletDomain || !currentSession.deliveryTime) return;
        const outletDomain = currentSession.outletDomain;
        const deliveryTime = currentSession.deliveryTime;
        let active = true;
        let attempts = 0;
        const MAX_ATTEMPTS = 12;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;

        function todayKst() {
            return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
        }

        function check() {
            getBriefingHistory().then(items => {
                if (!active) return;
                applyBriefingItems(items);
                setHistoryError("");
                const arrived = items.some(item => item.briefingDate === todayKst()
                    && item.outletDomain === outletDomain && (item.deliveryTime ?? null) === deliveryTime);
                if (arrived) return;
                attempts += 1;
                if (attempts < MAX_ATTEMPTS) retryTimer = setTimeout(check, 5_000);
            }).catch(() => {
                attempts += 1;
                if (active && attempts < MAX_ATTEMPTS) retryTimer = setTimeout(check, 5_000);
            });
        }

        const target = Date.parse(`${todayKst()}T${deliveryTime}+09:00`) + 5_000;
        const startDelay = Math.max(0, target - Date.now());
        const startTimer = setTimeout(check, startDelay);
        return () => { active = false; clearTimeout(startTimer); clearTimeout(retryTimer); };
    }, [currentSession?.outletDomain, currentSession?.deliveryTime, applyBriefingItems]);

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

    const updateSavedBriefing = async (date: string, shouldSave: boolean, briefing?: NewsBriefing) => {
        if (saving.current) throw new Error("다른 저장 작업이 진행 중입니다.");
        saving.current = true;
        setSavingDate(date);
        setSavingKey(briefing ? briefingKey(briefing) : null);
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
            setSavingKey(null);
        }
    };

    const selectSession = (id: number) => {
        setSelectedSessionId(id);
        setSelectedDate("");
        setJumpTarget(null);
        setOrphanBriefing(null);
        setView("chat");
    };

    const openSavedBriefing = async (date: string) => {
        let briefing = findLatestByDate(briefings, date);
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
            if (!target) {
                // 설정(채팅)이 삭제된 브리핑 — 채팅 없이 내용만 보여준다.
                setOrphanBriefing(briefing);
                setSelectedDate("");
                setJumpTarget(null);
                setView("chat");
                setSavedListOpen(false);
                setSavedError("");
                return;
            }
            setOrphanBriefing(null);
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

    function toggleSessionMenu(id: number, button: HTMLButtonElement) {
        if (openMenuId === id) { setOpenMenuId(null); return; }
        const rect = button.getBoundingClientRect();
        const width = 160;
        const height = 44;
        const above = window.innerHeight - rect.bottom < height + 12 && rect.top > height + 12;
        const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
        setMenuPosition({ top: above ? rect.top - height - 8 : rect.bottom + 8, left, arrowLeft: Math.max(12, Math.min(rect.left + rect.width / 2 - left - 5, width - 20)), above });
        setOpenMenuId(id);
    }

    useEffect(() => {
        if (openMenuId === null) return;
        const closeOnOutsideInteraction = (event: PointerEvent | FocusEvent) => {
            const target = event.target as Node;
            if (!openMenuRef.current?.contains(target) && !menuButtonRef.current?.contains(target)) setOpenMenuId(null);
        };
        const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenMenuId(null); };
        const closeOnScroll = () => setOpenMenuId(null);
        document.addEventListener("pointerdown", closeOnOutsideInteraction);
        document.addEventListener("focusin", closeOnOutsideInteraction);
        document.addEventListener("keydown", closeOnEscape);
        window.addEventListener("scroll", closeOnScroll, true);
        window.addEventListener("resize", closeOnScroll);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideInteraction);
            document.removeEventListener("focusin", closeOnOutsideInteraction);
            document.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("scroll", closeOnScroll, true);
            window.removeEventListener("resize", closeOnScroll);
        };
    }, [openMenuId]);

    const deletingSession = sessions.find(item => item.sessionId === deletingId) ?? null;
    const menuSession = sessions.find(item => item.sessionId === openMenuId) ?? null;

    async function removeSession(id: number) {
        if (deleteBusyId !== null) return;
        setDeleteBusyId(id);
        setDeleteError("");
        try {
            await deleteNewsChatSession(id);
            await refreshSessions();
            setDeletingId(null);
        } catch (cause) {
            setDeleteError(getApiErrorMessage(cause, "채팅을 삭제하지 못했습니다."));
        } finally {
            setDeleteBusyId(null);
        }
    }

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
            {deleteError && <p role="alert" className="px-3 pb-2 text-xs text-red-600">{deleteError}</p>}
            <div className="cq-planner-session-list flex max-h-48 overflow-auto">
                {sessions.map(item => {
                    const menuOpen = openMenuId === item.sessionId;
                    return <div key={item.sessionId} className={`flex w-full shrink-0 items-center gap-1 border-l-2 px-2 py-1.5 ${view === "chat" && selectedSessionId === item.sessionId ? "border-primary bg-primary/6" : "border-transparent hover:bg-surface-soft"}`}>
                        <button type="button" onClick={() => selectSession(item.sessionId)} aria-current={view === "chat" && selectedSessionId === item.sessionId ? "page" : undefined}
                            className={`min-w-0 flex-1 truncate px-2 py-1.5 text-left text-xs font-semibold ${view === "chat" && selectedSessionId === item.sessionId ? "text-primary" : "text-body"}`}>
                            {sessionLabel(item)}
                        </button>
                        <button type="button" ref={menuOpen ? menuButtonRef : null} onClick={event => toggleSessionMenu(item.sessionId, event.currentTarget)}
                            aria-label={`${sessionLabel(item)} 옵션 ${menuOpen ? "닫기" : "열기"}`} aria-expanded={menuOpen}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline bg-white text-muted hover:border-primary hover:text-primary"><MoreHorizontalIcon className="h-3.5 w-3.5" /></button>
                    </div>;
                })}
            </div>
            <button type="button" onClick={() => setView("settings")} aria-pressed={view === "settings"}
                className="flex h-12 shrink-0 items-center gap-2 border-t border-hairline px-5 text-xs font-bold text-muted hover:text-ink">
                <GearIcon className="h-3.5 w-3.5" />브리핑 설정
            </button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {view === "chat" && <div className="cq-planner-chat-row flex min-h-0 min-w-0 flex-1 flex-col">
                {orphanBriefing ? <OrphanBriefingView briefing={orphanBriefing} saved={savedDates.includes(orphanBriefing.briefingDate)}
                    busy={savingKey === briefingKey(orphanBriefing)} savedLoading={savedLoading}
                    onToggleSave={() => { void updateSavedBriefing(orphanBriefing.briefingDate, !savedDates.includes(orphanBriefing.briefingDate), orphanBriefing).catch(cause => setSavedError(getApiErrorMessage(cause, "브리핑 저장 상태를 변경하지 못했습니다."))); }}
                    onBack={() => { setOrphanBriefing(null); if (currentSessionId !== null) selectSession(currentSessionId); }} />
                    : selectedSession ? <NewsChat key={selectedSession.sessionId} session={selectedSession} briefings={visibleBriefings}
                    focusedBriefingDate={focusedDate} jumpTarget={jumpTarget} savedBriefingDates={savedDates}
                    savingKey={savingKey} savedLoading={savedLoading} onSave={briefing => updateSavedBriefing(briefing.briefingDate, true, briefing)}
                    onRemove={briefing => updateSavedBriefing(briefing.briefingDate, false, briefing)}
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
        {menuSession && menuPosition && createPortal(
            <div ref={openMenuRef} role="group" aria-label={`${sessionLabel(menuSession)} 채팅 옵션`} style={{ top: menuPosition.top, left: menuPosition.left }} className="fixed z-[60] w-40 rounded-lg border border-hairline bg-canvas p-1.5 shadow-xl">
                <span aria-hidden="true" style={{ left: menuPosition.arrowLeft }} className={`absolute h-2.5 w-2.5 rotate-45 border-hairline bg-canvas ${menuPosition.above ? "-bottom-1.5 border-b border-r" : "-top-1.5 border-l border-t"}`} />
                <button type="button" onClick={() => { setOpenMenuId(null); setDeletingId(menuSession.sessionId); setDeleteError(""); }} className="relative block h-9 w-full rounded-md px-3 text-left text-xs font-semibold text-red-600 hover:bg-red-50">삭제</button>
            </div>,
            document.body,
        )}
        {deletingSession && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget && deleteBusyId === null) setDeletingId(null); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="briefing-chat-delete-title" className="w-full max-w-sm rounded-xl border border-hairline bg-white p-6 shadow-2xl">
                <h2 id="briefing-chat-delete-title" className="text-lg font-bold text-ink">채팅을 삭제할까요?</h2>
                <p className="mt-3 text-sm leading-6 text-body"><strong className="text-ink">{sessionLabel(deletingSession)}</strong> 채팅과 대화 내용이 함께 삭제됩니다.</p>
                {deletingSession.sessionId === currentSessionId && <p className="mt-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-700">브리핑 설정도 함께 삭제되어 더 이상 브리핑을 받지 않습니다.</p>}
                {deleteError && <p role="alert" className="mt-3 text-sm text-red-600">{deleteError}</p>}
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" autoFocus onClick={() => setDeletingId(null)} disabled={deleteBusyId !== null} className="rounded-lg border border-hairline bg-white px-4 py-2 text-sm font-semibold text-body hover:bg-surface-soft disabled:opacity-50">취소</button>
                    <button type="button" onClick={() => void removeSession(deletingSession.sessionId)} disabled={deleteBusyId !== null} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{deleteBusyId === deletingSession.sessionId ? "삭제 중..." : "삭제"}</button>
                </div>
            </div>
        </div>}
    </div>;
}
