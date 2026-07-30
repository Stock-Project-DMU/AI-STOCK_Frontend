"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { CloseIcon, CheckIcon } from "@/components/icons/Icon";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-label="뉴스 시황 저장">
            <div className="w-full max-w-[820px] overflow-hidden rounded-lg border border-hairline bg-canvas shadow-2xl">
                <div className="flex items-center justify-between border-b border-hairline-soft px-6 py-4">
                    <h2 className="text-lg font-semibold text-ink">뉴스 시황 저장</h2>
                    <button onClick={onClose} aria-label="닫기" className="rounded-md p-1.5 text-muted hover:bg-surface-strong hover:text-ink"><CloseIcon className="h-5 w-5" /></button>
                </div>
                <div className="flex items-center gap-3 border-b border-hairline-soft px-6 py-3.5 text-sm font-semibold text-ink">
                    <span className="h-6 w-6 rounded-sm border border-hairline" />
                    뉴스 시황 저장
                </div>
                <div className="min-h-[400px] px-6 py-6 sm:px-14">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-ink">뉴스 요약 리스트</h3>
                        <span className="text-xs text-muted">
                            {selected.length}개 선택
                            <button onClick={() => setSelected(available)} className="ml-2 font-semibold text-primary hover:text-primary-active">전체 선택</button>
                        </span>
                    </div>
                    <div className="mt-4 space-y-2">
                        {available.map((kind) => {
                            const checked = selected.includes(kind);
                            return (
                                <button
                                    key={kind}
                                    onClick={() => setSelected((current) => (checked ? current.filter((item) => item !== kind) : [...current, kind]))}
                                    className={`flex w-full items-center gap-4 rounded-md border px-3 py-3 text-left transition-colors ${checked ? "border-primary bg-primary/5" : "border-transparent hover:bg-surface-soft"}`}
                                >
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked ? "bg-primary text-white" : "border border-hairline"}`}>{checked ? <CheckIcon className="h-3 w-3" /> : null}</span>
                                    <span>
                                        <strong className="block text-sm text-ink">{labels[kind]}</strong>
                                        <small className="mt-1 block text-muted">한국경제 · 2시간 전</small>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-16 flex justify-center">
                        <Button variant="primary" size="lg" onClick={onClose} className="px-10">확인</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
