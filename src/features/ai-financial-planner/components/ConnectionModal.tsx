"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { GearIcon, CloseIcon, CheckIcon, TrendUpIcon, NewsIcon } from "@/components/icons/Icon";

type ConnectionModalProps = { onClose: () => void };

const news = [
    "미 연준, 금리 동결 결정... 시장 '안도 랠리'",
    "삼성전자, AI 반도체 투자 10조 확대 발표",
    "코스피 2,800선 돌파... 외국인 순매수 전환",
    "한국은행 '물가 안정세 지속' 전망 발표",
];

const goals = [
    "공격적인 배당관련 투자 시뮬레이션",
    "내집마련 투자 시뮬레이션",
    "노후대비 연금 시뮬레이션",
    "공격적인 노후대비 연금 시뮬레이션",
];

export default function ConnectionModal({ onClose }: ConnectionModalProps) {
    const [tab, setTab] = useState<"news" | "goals">("news");
    const [selected, setSelected] = useState<number[]>(tab === "news" ? [2, 3] : [2]);
    const items = tab === "news" ? news : goals;

    const changeTab = (next: "news" | "goals") => {
        setTab(next);
        setSelected(next === "news" ? [2, 3] : [2]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-label="설정 및 연동">
            <div className="w-full max-w-[820px] overflow-hidden rounded-lg border border-hairline bg-canvas shadow-2xl">
                <div className="flex items-center justify-between border-b border-hairline-soft px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><GearIcon className="h-4 w-4 text-muted" /> 설정 및 연동</h2>
                    <button onClick={onClose} aria-label="닫기" className="rounded-md p-1.5 text-muted hover:bg-surface-strong hover:text-ink"><CloseIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex border-b border-hairline-soft text-sm">
                    <button onClick={() => changeTab("goals")} className={`flex items-center gap-1.5 px-7 py-3.5 transition-colors ${tab === "goals" ? "border-b-2 border-primary font-bold text-ink" : "text-muted hover:text-ink"}`}><TrendUpIcon className="h-4 w-4" /> 목표 도달 시뮬레이션 연동</button>
                    <button onClick={() => changeTab("news")} className={`flex items-center gap-1.5 px-7 py-3.5 transition-colors ${tab === "news" ? "border-b-2 border-primary font-bold text-ink" : "text-muted hover:text-ink"}`}><NewsIcon className="h-4 w-4" /> 뉴스 시황 연동</button>
                </div>
                <div className="px-6 py-6 sm:px-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-ink">{tab === "news" ? "뉴스 요약 리스트" : "목표 시뮬레이션 리스트"}</h3>
                        <span className="text-xs text-muted">
                            {selected.length}개 선택
                            <button onClick={() => setSelected(items.map((_, index) => index))} className="font-semibold text-primary hover:text-primary-active">전체 선택</button>
                        </span>
                    </div>
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const checked = selected.includes(index);
                            return (
                                <button
                                    key={item}
                                    onClick={() => setSelected((current) => (checked ? current.filter((value) => value !== index) : [...current, index]))}
                                    className={`flex w-full items-center gap-4 rounded-md border px-4 py-3 text-left transition-colors ${checked ? "border-primary bg-primary/5" : "border-hairline hover:bg-surface-soft"}`}
                                >
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-primary text-white" : "border border-hairline"}`}>{checked ? <CheckIcon className="h-3 w-3" /> : null}</span>
                                    <span>
                                        <strong className="block text-sm text-ink">{item}</strong>
                                        <small className="mt-1 block text-muted">{tab === "news" ? "한국경제 · 5시간 전" : "6시간 전"}</small>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-7 flex justify-center">
                        <Button variant="primary" size="lg" onClick={onClose} className="px-10">확인</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
