"use client";

import { FormEvent, useState } from "react";
import type { BriefingKind, BriefingMessage } from "../types";
import { NewsSummary, SemiconductorBriefing } from "./BriefingContent";

type BriefingChatProps = {
    messages: BriefingMessage[];
    onAddMessage: (message: BriefingMessage) => void;
    onSave: (kind: BriefingKind) => void;
    onShowSemiconductor: () => void;
};

export default function BriefingChat({ messages, onAddMessage, onSave, onShowSemiconductor }: BriefingChatProps) {
    const [input, setInput] = useState("");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const value = input.trim();
        if (!value) return;
        onAddMessage({ id: Date.now(), role: "user", text: value });
        if (value.includes("반도체")) onShowSemiconductor();
        else onAddMessage({ id: Date.now() + 1, role: "assistant", text: "요청하신 시황을 분석하고 있습니다. 주요 지수와 실시간 뉴스 흐름을 함께 반영해 드릴게요." });
        setInput("");
    };

    return <section className="flex min-w-0 flex-1 flex-col bg-[#f2f4f6]"><div className="flex h-16 items-center border-b border-gray-200 bg-white px-6 font-bold"><span className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">▱</span>AI 맞춤 시황 브리핑</div><div className="flex-1 space-y-7 overflow-y-auto p-6 lg:p-8">{messages.map(message => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[680px] ${message.role === "user" ? "rounded-2xl rounded-tr-sm bg-[#171717] px-6 py-4 text-sm text-white" : "flex gap-3"}`}>{message.role === "assistant" && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#171717] text-white">◇</span>}<div className={message.role === "assistant" ? "w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm leading-7 text-gray-700" : ""}><p>{message.text}</p>{message.kind === "summary" && <NewsSummary onSemiconductor={onShowSemiconductor}/>} {message.kind === "semiconductor" && <SemiconductorBriefing/>}{message.kind && <button onClick={() => onSave(message.kind!)} className="mt-4 rounded-lg bg-black px-8 py-2.5 text-xs font-bold text-white">저장</button>}</div></div></div>)}</div><form onSubmit={submit} className="border-t border-gray-200 bg-white px-6 pb-4 pt-4"><div className="mx-auto flex max-w-[900px] rounded-xl bg-[#f2f4f6] p-2"><input value={input} onChange={event => setInput(event.target.value)} placeholder="AI에게 시황 질문을 입력하세요..." className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"/><button aria-label="메시지 보내기" className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">➤</button></div></form></section>;
}
