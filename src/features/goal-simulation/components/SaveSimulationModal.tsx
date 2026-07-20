"use client";

import { useState } from "react";
import { SAVED_SIMULATIONS } from "../constants/simulationData";

type SaveSimulationModalProps = {
    onClose: () => void;
};

export default function SaveSimulationModal({ onClose }: SaveSimulationModalProps) {
    const [selected, setSelected] = useState<number[]>([3]);

    const toggle = (id: number) => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="dialog" aria-modal="true" aria-label="목표 도달 시뮬레이션 저장">
            <div className="w-full max-w-[840px] overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-7 py-5">
                    <h2 className="text-xl font-semibold text-gray-500">⚙ 저장</h2>
                    <button type="button" onClick={onClose} aria-label="닫기" className="text-2xl text-gray-400">×</button>
                </div>
                <div className="flex items-center gap-3 border-b px-7 py-4 text-sm font-semibold">⌁ 목표 도달 시뮬레이션 저장</div>
                <div className="min-h-[410px] px-8 py-7 sm:px-16">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold">목표 시뮬레이션 리스트</h3>
                        <span className="text-xs text-gray-400">{selected.length}개 선택　<button type="button" onClick={() => setSelected(SAVED_SIMULATIONS.map((item) => item.id))} className="text-red-500">전체 선택</button></span>
                    </div>
                    <div className="mt-5 space-y-2">
                        {SAVED_SIMULATIONS.map((item) => {
                            const checked = selected.includes(item.id);
                            return (
                                <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`flex w-full items-center gap-4 rounded-lg border px-3 py-3 text-left transition-colors ${checked ? "border-red-500" : "border-transparent hover:bg-gray-50"}`}>
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-red-500 text-white" : "border border-gray-300"}`}>{checked ? "✓" : ""}</span>
                                    <span><strong className="block text-sm">{item.title}</strong><small className="mt-1 block text-gray-400">{item.age}</small></span>
                                </button>
                            );
                        })}
                    </div>
                    <button type="button" onClick={onClose} className="mx-auto mt-10 block rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">확인</button>
                </div>
            </div>
        </div>
    );
}
