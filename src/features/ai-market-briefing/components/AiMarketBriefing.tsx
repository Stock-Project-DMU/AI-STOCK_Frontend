"use client";
import { useEffect, useState } from "react";
import DailyBriefing from "./DailyBriefing";
import NewsChat from "./NewsChat";
import MarketDashboard from "./MarketDashboard";
import { NewsIcon } from "@/components/icons/Icon";
import { getBriefingHistory, type NewsBriefing } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

export default function AiMarketBriefing() {
    const [tab, setTab] = useState<"chat" | "daily">("chat");
    const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
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
        const timer = tab === "daily" ? window.setInterval(refresh, 60_000) : null;
        return () => { active = false; if (timer !== null) window.clearInterval(timer); };
    }, [tab]);

    return <div className="cq-briefing-shell market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0 flex-col">
        <aside aria-label="AI 뉴스 시황 메뉴" className="cq-briefing-navigation flex shrink-0 gap-2 overflow-x-auto border-b border-hairline bg-canvas p-3">
            <button type="button" aria-pressed={tab === "daily"} onClick={() => setTab("daily")} className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-3 text-left text-sm font-bold ${tab === "daily" ? "bg-primary text-white" : "text-body hover:bg-surface-soft"}`}><NewsIcon className="h-4 w-4" />오늘의 브리핑</button>
            <button type="button" aria-pressed={tab === "chat"} onClick={() => setTab("chat")} className={`shrink-0 rounded-md px-4 py-3 text-left text-sm font-bold ${tab === "chat" ? "bg-primary text-white" : "text-body hover:bg-surface-soft"}`}>뉴스 검색 채팅</button>
            <p className="hidden px-3 pt-3 text-xs font-medium text-muted cq-briefing-history-label">지난 브리핑</p>
            {briefings.map(item => <button key={item.briefingDate} type="button" onClick={() => { setSelectedDate(item.briefingDate); setTab("daily"); }} aria-current={tab === "daily" && selectedDate === item.briefingDate ? "page" : undefined} className={`shrink-0 border-l-2 px-4 py-2 text-left text-xs ${tab === "daily" && selectedDate === item.briefingDate ? "border-primary bg-primary/6 font-semibold text-primary" : "border-transparent text-body hover:bg-surface-soft"}`}>{item.briefingDate} 시황 브리핑</button>)}
            {historyError && <p role="status" className="px-3 text-xs text-muted">{historyError}</p>}
        </aside>
        <div className="min-w-0 flex-1 bg-surface-soft">
            <div hidden={tab !== "chat"}><NewsChat /></div>
            {tab === "daily" && <DailyBriefing briefings={briefings} selectedDate={selectedDate} onSelectedDate={setSelectedDate} />}
        </div>
        <MarketDashboard />
    </div>;
}
