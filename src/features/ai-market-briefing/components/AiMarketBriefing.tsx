"use client";

import { useState } from "react";
import type { BriefingKind, BriefingMessage } from "../types";
import BriefingChat from "./BriefingChat";
import BriefingHistory from "./BriefingHistory";
import MarketDashboard from "./MarketDashboard";
import SaveBriefingModal from "./SaveBriefingModal";

const initialMessages: BriefingMessage[] = [
    { id: 1, role: "user", text: "오늘 주요 뉴스 브리핑해줘." },
    { id: 2, role: "assistant", text: "오늘 주요 시황 뉴스를 5개 요약해 드립니다.", kind: "summary" },
];

export default function AiMarketBriefing() {
    const [messages, setMessages] = useState(initialMessages);
    const [saveOpen, setSaveOpen] = useState(false);
    const [available, setAvailable] = useState<BriefingKind[]>(["summary"]);

    const showSemiconductor = () => {
        if (messages.some(message => message.kind === "semiconductor")) return;
        setMessages(current => [...current, { id: Date.now(), role: "user", text: "반도체 섹터 좀 더 자세히 알려줘." }, { id: Date.now() + 1, role: "assistant", text: "반도체 섹터 심층 브리핑입니다.", kind: "semiconductor" }]);
        setAvailable(["semiconductor", "summary"]);
    };

    const reset = () => {
        setMessages(initialMessages);
        setAvailable(["summary"]);
    };

    return <div className="flex min-h-[calc(100vh-4rem)] min-w-0 bg-[#f2f4f6]"><BriefingHistory onNewBriefing={reset}/><div className="flex min-w-0 flex-1"><BriefingChat messages={messages} onAddMessage={message => setMessages(current => [...current, message])} onSave={() => setSaveOpen(true)} onShowSemiconductor={showSemiconductor}/><MarketDashboard/></div>{saveOpen && <SaveBriefingModal available={available} onClose={() => setSaveOpen(false)}/>}</div>;
}
