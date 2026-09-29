"use client";

import { useEffect, useRef, useState } from "react";
import { GearIcon, NewsIcon } from "@/components/icons/Icon";
import { getBriefingByDate, getBriefingHistory, getPlanningPreferences, savePlanningPreferences, type NewsBriefing, type PlanningPreferences } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import DailyBriefing from "./DailyBriefing";
import MarketDashboard from "./MarketDashboard";
import NewsChat from "./NewsChat";

export default function AiMarketBriefing() {
    const [view, setView] = useState<"chat" | "settings">("chat");
    const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [jumpTarget, setJumpTarget] = useState<{ date: string } | null>(null);
    const [historyError, setHistoryError] = useState("");
    const [preferences, setPreferences] = useState<PlanningPreferences | null>(null);
    const [savedLoading, setSavedLoading] = useState(true);
    const [savedError, setSavedError] = useState("");
    const [savingDate, setSavingDate] = useState<string | null>(null);
    const saving = useRef(false);
    const extraBriefings = useRef<NewsBriefing[]>([]);

    useEffect(() => {
        let active = true;
        const refresh = () => {
            getBriefingHistory().then(items => {
                if (!active) return;
                const byDate = new Map(extraBriefings.current.map(item => [item.briefingDate, item]));
                items.forEach(item => byDate.set(item.briefingDate, item));
                const merged = [...byDate.values()].sort((a, b) => b.briefingDate.localeCompare(a.briefingDate));
                setBriefings(merged);
                setSelectedDate(current => merged.some(item => item.briefingDate === current) ? current : merged[0]?.briefingDate ?? "");
                setHistoryError("");
            }).catch(error => { if (active) setHistoryError(getApiErrorMessage(error, "브리핑 기록을 불러오지 못했습니다.")); });
        };
        refresh();
        const timer = window.setInterval(refresh, 60_000);
        return () => { active = false; window.clearInterval(timer); };
    }, []);

    useEffect(() => {
        let active = true;
        getPlanningPreferences().then(items => { if (active) setPreferences(items); })
            .catch(error => { if (active) setSavedError(getApiErrorMessage(error, "저장한 브리핑을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setSavedLoading(false); });
        return () => { active = false; };
    }, []);

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

    const jumpToBriefing = (date: string) => {
        if (!date) return;
        setSelectedDate(date);
        setJumpTarget({ date });
        setView("chat");
    };

    const openSavedBriefing = async (date: string) => {
        if (!briefings.some(item => item.briefingDate === date)) {
            try {
                const item = await getBriefingByDate(date);
                extraBriefings.current = [...extraBriefings.current.filter(briefing => briefing.briefingDate !== date), item];
                setBriefings(current => [...current.filter(briefing => briefing.briefingDate !== date), item].sort((a, b) => b.briefingDate.localeCompare(a.briefingDate)));
            } catch (error) {
                setSavedError(getApiErrorMessage(error, "저장한 브리핑을 불러오지 못했습니다."));
                return;
            }
        }
        jumpToBriefing(date);
    };

    return <div className="cq-medium-flex-row ai-chat-page market-theme market-grid flex min-h-[calc(100dvh-72px)] min-w-0 flex-col">
        <aside aria-label="AI 뉴스 시황 메뉴" className="cq-planner-history flex shrink-0 flex-col border-b border-hairline bg-canvas">
            <div className="p-3">
                <button type="button" onClick={() => jumpToBriefing(briefings[0]?.briefingDate ?? "")} disabled={!briefings.length} aria-label="최신 브리핑 위치로 이동" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><NewsIcon className="h-4 w-4" />최신 브리핑</button>
            </div>
            <section aria-label="저장한 브리핑" className="shrink-0 border-b border-hairline">
                <h2 className="px-5 pb-2 pt-3 text-xs font-bold text-muted">저장한 브리핑{!savedLoading && ` ${savedDates.length}건`}</h2>
                {savedLoading && <p role="status" className="px-5 pb-3 text-xs text-muted">저장 목록을 불러오는 중입니다...</p>}
                {savedError && <p role="alert" className="px-5 pb-3 text-xs text-red-600">{savedError}</p>}
                {!savedLoading && !savedError && !savedDates.length && <p className="px-5 pb-3 text-xs text-muted">저장한 브리핑이 없습니다.</p>}
                {!!savedDates.length && <div className="cq-medium-flex-col flex max-h-40 gap-2 overflow-auto px-3 pb-3">
                    {savedDates.map(date => {
                        const briefing = briefings.find(item => item.briefingDate === date);
                        return <div key={date} className="flex w-full shrink-0 items-center rounded-md border border-hairline bg-surface-soft">
                            <button type="button" onClick={() => void openSavedBriefing(date)} aria-label={`${date} 저장한 브리핑으로 이동`} className="min-w-0 flex-1 px-2 py-2 text-left text-xs hover:text-primary"><span className="block font-semibold">{date}</span><span className="mt-1 block truncate text-muted">{briefing?.outletName ?? "브리핑 보기"}</span></button>
                            <button type="button" onClick={() => void updateSavedBriefing(date, false).catch(error => setSavedError(getApiErrorMessage(error, "저장 목록에서 삭제하지 못했습니다.")))} disabled={savingDate !== null} aria-label={`${date} 저장한 브리핑 삭제 및 재무설계사 연동 해제`} className="shrink-0 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">삭제</button>
                        </div>;
                    })}
                </div>}
            </section>
            <p className="cq-medium-show hidden px-6 pb-2 text-xs font-medium text-muted">지난 브리핑</p>
            {historyError && <p role="alert" className="px-3 pb-2 text-xs text-red-600">{historyError}</p>}
            <div className="cq-planner-session-list flex max-h-48 overflow-auto">
                {briefings.map(item => <button key={item.briefingDate} type="button" onClick={() => jumpToBriefing(item.briefingDate)} aria-label={`${item.briefingDate} 브리핑 위치로 이동`} aria-current={view === "chat" && selectedDate === item.briefingDate ? "location" : undefined} className={`w-full shrink-0 border-l-2 px-4 py-3 text-left text-xs ${view === "chat" && selectedDate === item.briefingDate ? "border-primary bg-primary/6 font-semibold text-primary" : "border-transparent text-body hover:bg-surface-soft"}`}><span className="block font-semibold">{item.briefingDate}</span><span className="mt-1 block truncate text-muted">{item.content.startsWith("[화면 확인용 샘플]") ? "샘플 · " : ""}{item.outletName} 시황 브리핑</span></button>)}
            </div>
            {!briefings.length && !historyError && <p className="cq-medium-show hidden px-6 py-3 text-xs text-muted">아직 생성된 브리핑이 없습니다.</p>}
            <button type="button" onClick={() => setView("settings")} aria-pressed={view === "settings"} className="flex h-12 shrink-0 items-center gap-2 border-t border-hairline px-5 text-xs font-bold text-muted hover:text-ink"><GearIcon className="h-3.5 w-3.5" />브리핑 설정 · 저장</button>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={`cq-planner-chat-row min-h-0 min-w-0 flex-1 flex-col ${view === "chat" ? "flex" : "hidden"}`}>
                <NewsChat briefings={briefings} focusedBriefingDate={selectedDate} jumpTarget={jumpTarget} />
                <MarketDashboard />
            </div>
            {view === "settings" && <div className="min-h-0 min-w-0 flex-1 overflow-y-auto"><DailyBriefing briefings={briefings} selectedDate={selectedDate} onSelectedDate={setSelectedDate} savedBriefingDates={savedDates} savedLoading={savedLoading} savingDate={savingDate} onSave={date => updateSavedBriefing(date, true)} onRemove={date => updateSavedBriefing(date, false)} /></div>}
        </div>
    </div>;
}
