"use client";

import { useState } from "react";
import type { BriefingKind } from "../types";

type SaveBriefingModalProps = {
    available: BriefingKind[];
    onClose: () => void;
};

const labels: Record<BriefingKind, string> = {
    summary: "주요 시황 뉴스 5개 요약",
    semiconductor: "반도체 섹터 종합",
};

export default function SaveBriefingModal({ available, onClose }: SaveBriefingModalProps) {
    const [selected, setSelected] = useState<BriefingKind[]>([]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="dialog" aria-modal="true" aria-label="뉴스 시황 저장">
            <div className="w-full max-w-[840px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-7 py-5"><h2 className="text-xl font-semibold text-gray-500">뉴스 시황 저장</h2><button onClick={onClose} aria-label="닫기" className="text-2xl text-gray-400">×</button></div>
                <div className="flex items-center gap-3 border-b px-7 py-4 text-sm font-semibold"><span className="h-6 w-6 border border-gray-500"/>뉴스 시황 저장</div>
                <div className="min-h-[410px] px-16 py-7">
                    <div className="flex items-center justify-between"><h3 className="font-bold">뉴스 요약 리스트</h3><span className="text-xs text-gray-400">{selected.length}개 선택　<button onClick={() => setSelected(available)} className="text-red-500">전체 선택</button></span></div>
                    <div className="mt-5 space-y-2">
                        {available.map(kind => { const checked = selected.includes(kind); return <button key={kind} onClick={() => setSelected(current => checked ? current.filter(item => item !== kind) : [...current, kind])} className="flex w-full items-center gap-4 rounded-lg px-2 py-3 text-left hover:bg-gray-50"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-red-500 text-white" : "border border-gray-300"}`}>{checked ? "✓" : ""}</span><span><strong className="block text-sm">{labels[kind]}</strong><small className="mt-1 block text-gray-400">한국경제 · 2시간 전</small></span></button>; })}
                    </div>
                    <button onClick={onClose} className="mx-auto mt-20 block rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">확인</button>
                </div>
            </div>
        </div>
    );
}
