"use client";
import { useState } from "react";
import DailyBriefing from "./DailyBriefing";
import NewsChat from "./NewsChat";

export default function AiMarketBriefing() {
    const [tab, setTab] = useState<"chat" | "daily">("chat");
    return <div className="market-theme market-grid min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-canvas px-5 py-3">
            <h1 className="font-bold">AI 맞춤 시황 브리핑</h1>
            <div className="flex gap-2" aria-label="브리핑 화면 선택">
                <button type="button" aria-pressed={tab === "chat"} onClick={() => setTab("chat")} className={`rounded-lg px-4 py-2 text-sm ${tab === "chat" ? "bg-primary text-white" : "border border-hairline"}`}>뉴스 검색 채팅</button>
                <button type="button" aria-pressed={tab === "daily"} onClick={() => setTab("daily")} className={`rounded-lg px-4 py-2 text-sm ${tab === "daily" ? "bg-primary text-white" : "border border-hairline"}`}>정기 브리핑</button>
            </div>
        </header>
        <div hidden={tab !== "chat"}><NewsChat /></div>
        {tab === "daily" && <DailyBriefing />}
    </div>;
}