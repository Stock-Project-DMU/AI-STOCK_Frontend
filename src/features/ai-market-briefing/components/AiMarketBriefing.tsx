"use client";

import { useEffect, useState } from "react";
import { GearIcon, NewsIcon } from "@/components/icons/Icon";
import { getBriefingHistory, type NewsBriefing } from "@/lib/api/ai";
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

    useEffect(() => {
        let active = true;
        const refresh = () => {
            getBriefingHistory().then(items => {
                if (!active) return;
                setBriefings(items);
                setSelectedDate(current => items.some(item => item.briefingDate === current) ? current : items[0]?.briefingDate ?? "");
                setHistoryError("");
            }).catch(error => { if (active) setHistoryError(getApiErrorMessage(error, "브리핑 기록을 불러오지 못했습니다.")); });
        };
        refresh();
        const timer = window.setInterval(refresh, 60_000);
        return () => { active = false; window.clearInterval(timer); };
    }, []);

    const jumpToBriefing = (date: string) => {
        if (!date) return;
        setSelectedDate(date);
        setJumpTarget({ date });
        setView("chat");
    };

    return <div className="cq-medium-flex-row ai-chat-page market-theme market-grid flex min-h-[calc(100dvh-72px)] min-w-0 flex-col">
        <aside aria-label="AI 뉴스 시황 메뉴" className="cq-planner-history flex shrink-0 flex-col border-b border-hairline bg-canvas">
            <div className="p-3">
                <button type="button" onClick={() => jumpToBriefing(briefings[0]?.briefingDate ?? "")} disabled={!briefings.length} aria-label="최신 브리핑 위치로 이동" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><NewsIcon className="h-4 w-4" />최신 브리핑</button>
            </div>
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
            {view === "settings" && <div className="min-h-0 min-w-0 flex-1 overflow-y-auto"><DailyBriefing briefings={briefings} selectedDate={selectedDate} onSelectedDate={setSelectedDate} /></div>}
        </div>
    </div>;
}
