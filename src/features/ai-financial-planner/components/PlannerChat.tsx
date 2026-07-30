"use client";

import { FormEvent, useState } from "react";
import { SparkleIcon, SendIcon } from "@/components/icons/Icon";
import type { ChatMessage } from "../types";

const initialMessages: ChatMessage[] = [
    { id: 1, role: "assistant", text: "안녕하세요, 김진우님! 현재 연동된 자산 현황을 바탕으로 분석을 마쳤습니다.\n\n현재 공격적 투자 성향에 비해 현금 비중이 다소 높은 편입니다. 시장 변동성을 활용한 추가 매수 전략이나 배당 성장주 포트폴리오 구성을 추천해 드릴까요?" },
    { id: 2, role: "user", text: "조정했을 때 수익률을 알려줘." },
    { id: 3, role: "assistant", text: "현재 자산 구성과 최적화 제안 리포트입니다. 추천 전환인 '글로벌 성장주 + 국내 배당주 혼합형'으로 변경 시 연 6.8% 수준의 기대 수익률을 확보할 수 있습니다.", portfolio: true },
];

export default function PlannerChat() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const value = input.trim();
        if (!value) return;
        setMessages(current => [
            ...current,
            { id: Date.now(), role: "user", text: value },
            { id: Date.now() + 1, role: "assistant", text: "질문을 확인했습니다. 현재 자산 배분, 투자 기간과 위험 감수 수준을 함께 반영해 맞춤 분석을 준비할게요." },
        ]);
        setInput("");
    };

    return (
        <section className="flex min-w-0 flex-1 flex-col bg-surface-soft">
            <div className="flex h-14 items-center border-b border-hairline bg-canvas px-6 font-bold text-ink">
                <span className="theme-accent-bg mr-3 flex h-8 w-8 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>
                AI 재무설계사 밀착 진단
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
                {messages.map(message => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[630px] ${message.role === "user" ? "chat-user-bubble rounded-lg rounded-tr-sm px-5 py-3.5 text-sm font-medium leading-6" : "flex gap-3"}`}>
                            {message.role === "assistant" && (
                                <span className="theme-accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>
                            )}
                            <div className={message.role === "assistant" ? "rounded-lg border border-hairline bg-canvas px-5 py-4 text-sm leading-6 text-body" : ""}>
                                <p className="whitespace-pre-line">{message.text}</p>
                                {message.portfolio && <PortfolioAllocation />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={submit} className="border-t border-hairline bg-canvas px-6 pt-3 pb-3">
                <div className="mx-auto flex max-w-[900px] rounded-md bg-surface-soft p-2">
                    <input value={input} onChange={event => setInput(event.target.value)} placeholder="AI에게 재무 질문을 입력하세요..." className="min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted-soft" />
                    <button aria-label="메시지 보내기" className="theme-accent-bg flex h-9 w-9 items-center justify-center rounded-md"><SendIcon className="h-4 w-4" /></button>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-soft">AI의 조언은 투자 참고용이며 최종 결정은 본인의 책임입니다.</p>
            </form>
        </section>
    );
}

function PortfolioAllocation() {
    const rows: [string, string, string, string, string][] = [
        ["주식 (Equity)", "45% →", "60%", "bg-primary", "w-3/5"],
        ["채권/안전 (Bonds)", "20% →", "25%", "bg-primary/45", "w-1/4"],
        ["현금 (Cash)", "35% →", "15%", "bg-muted-soft", "w-[15%]"],
    ];
    return (
        <div className="mt-4 rounded-md bg-surface-strong p-4">
            <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>포트폴리오 비중 (현재 vs 추천)</span>
                <span className="rounded-sm bg-surface-soft px-2 py-1 text-up">+1.4% 기대수익 상승</span>
            </div>
            <div className="mt-4 space-y-3">
                {rows.map(([name, from, to, color, width]) => (
                    <div key={name}>
                        <div className="flex justify-between text-xs text-ink">
                            <span>{name}</span>
                            <span className="text-muted">{from} <b className="text-primary">{to}</b></span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-hairline-soft">
                            <div className={`h-full ${width} ${color}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
