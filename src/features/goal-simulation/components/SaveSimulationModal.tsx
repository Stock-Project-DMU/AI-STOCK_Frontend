"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { CloseIcon, CheckIcon } from "@/components/icons/Icon";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-label="목표 도달 시뮬레이션 저장">
            <div className="w-full max-w-[820px] overflow-hidden rounded-lg border border-hairline bg-canvas shadow-2xl">
                <div className="flex items-center justify-between border-b border-hairline-soft px-6 py-4">
                    <h2 className="text-lg font-semibold text-ink">⚙ 저장</h2>
                    <button type="button" onClick={onClose} aria-label="닫기" className="rounded-md p-1.5 text-muted hover:bg-surface-strong hover:text-ink"><CloseIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex items-center gap-3 border-b border-hairline-soft px-6 py-3.5 text-sm font-semibold text-ink">⌁ 목표 도달 시뮬레이션 저장</div>
                <div className="min-h-[400px] px-6 py-6 sm:px-14">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-ink">목표 시뮬레이션 리스트</h3>
                        <span className="text-xs text-muted">
                            {selected.length}개 선택
                            <button type="button" onClick={() => setSelected(SAVED_SIMULATIONS.map((item) => item.id))} className="ml-2 font-semibold text-primary hover:text-primary-active">전체 선택</button>
                        </span>
                    </div>
                    <div className="mt-4 space-y-2">
                        {SAVED_SIMULATIONS.map((item) => {
                            const checked = selected.includes(item.id);
                            return (
                                <button key={item.id} type="button" onClick={() => toggle(item.id)} className={`flex w-full items-center gap-4 rounded-md border px-3 py-3 text-left transition-colors ${checked ? "border-primary bg-primary/5" : "border-transparent hover:bg-surface-soft"}`}>
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-primary text-white" : "border border-hairline"}`}>{checked ? <CheckIcon className="h-3 w-3" /> : null}</span>
                                    <span>
                                        <strong className="block text-sm text-ink">{item.title}</strong>
                                        <small className="mt-1 block text-muted">{item.age}</small>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Button variant="primary" size="lg" onClick={onClose} className="px-10">확인</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
