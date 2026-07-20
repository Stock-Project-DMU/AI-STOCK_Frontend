"use client";

import { useState } from "react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="dialog" aria-modal="true" aria-label="설정 및 연동">
            <div className="w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-500">⚙ 설정 및 연동</h2>
                    <button onClick={onClose} aria-label="닫기" className="text-2xl text-gray-400">×</button>
                </div>
                <div className="flex border-b text-sm">
                    <button onClick={() => changeTab("goals")} className={`px-7 py-4 ${tab === "goals" ? "font-bold text-black" : "text-gray-500"}`}>〽 목표 도달 시뮬레이션 연동</button>
                    <button onClick={() => changeTab("news")} className={`px-7 py-4 ${tab === "news" ? "font-bold text-black" : "text-gray-500"}`}>▣ 뉴스 시황 연동</button>
                </div>
                <div className="px-14 py-7">
                    <div className="mb-5 flex justify-between"><h3 className="font-bold">{tab === "news" ? "뉴스 요약 리스트" : "목표 시뮬레이션 리스트"}</h3><span className="text-xs text-gray-400">{selected.length}개 선택　 <button onClick={() => setSelected(items.map((_, index) => index))} className="text-red-500">전체 선택</button></span></div>
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const checked = selected.includes(index);
                            return <button key={item} onClick={() => setSelected(current => checked ? current.filter(value => value !== index) : [...current, index])} className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left ${checked ? "border-2 border-red-500" : "border-transparent"}`}>
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-red-500 text-white" : "border border-gray-300"}`}>{checked ? "✓" : ""}</span>
                                <span><strong className="block text-sm">{item}</strong><small className="mt-1 block text-gray-400">{tab === "news" ? "한국경제 · 5시간 전" : "6시간 전"}</small></span>
                            </button>;
                        })}
                    </div>
                    <button onClick={onClose} className="mx-auto mt-7 block rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">확인</button>
                </div>
            </div>
        </div>
    );
}
