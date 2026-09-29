"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons/Icon";
import type { NewsBriefing } from "@/lib/api/ai";

type SavedBriefingsModalProps = {
    dates: string[];
    briefings: NewsBriefing[];
    loading: boolean;
    error: string;
    savingDate: string | null;
    onSelect: (date: string) => void;
    onDelete: (date: string) => void;
    onClose: () => void;
};

export default function SavedBriefingsModal({ dates, briefings, loading, error, savingDate, onSelect, onDelete, onClose }: SavedBriefingsModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, []);

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        }
        if (event.key !== "Tab" || !dialogRef.current) return;
        const buttons = [...dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
        if (!buttons.length) return;
        if (event.shiftKey && document.activeElement === buttons[0]) {
            event.preventDefault();
            buttons[buttons.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
            event.preventDefault();
            buttons[0].focus();
        }
    };

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="saved-briefings-title" onKeyDown={onKeyDown} className="flex max-h-[85dvh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-hairline px-5 py-4">
                <div>
                    <h2 id="saved-briefings-title" className="text-lg font-bold text-ink">저장한 브리핑</h2>
                    {!loading && <p className="mt-1 text-sm text-muted">{dates.length}건 저장됨</p>}
                </div>
                <button ref={closeRef} type="button" onClick={onClose} aria-label="저장한 브리핑 닫기" className="rounded-md p-2 text-muted hover:bg-surface-soft hover:text-ink"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                <p className="mb-4 text-xs text-muted">삭제하면 저장 목록과 재무설계사 연동에서 해제됩니다. 브리핑 원본은 유지됩니다.</p>
                {loading && <p role="status" className="text-sm text-muted">저장 목록을 불러오는 중입니다...</p>}
                {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
                {!loading && !error && !dates.length && <p className="py-8 text-center text-sm text-muted">저장한 브리핑이 없습니다.</p>}
                {!!dates.length && <div className="space-y-2">
                    {dates.map(date => {
                        const briefing = briefings.find(item => item.briefingDate === date);
                        return <div key={date} className="flex min-w-0 items-center gap-3 rounded-lg border border-hairline bg-surface-soft p-3">
                            <button type="button" onClick={() => onSelect(date)} aria-label={`${date} 저장한 브리핑으로 이동`} className="min-w-0 flex-1 text-left hover:text-primary">
                                <span className="block text-sm font-semibold">{date}</span>
                                <span className="mt-1 block truncate text-xs text-muted">{briefing?.outletName ?? "브리핑 보기"} 시황 브리핑</span>
                            </button>
                            <button type="button" onClick={() => onDelete(date)} disabled={savingDate !== null} aria-label={`${date} 저장한 브리핑 삭제 및 재무설계사 연동 해제`} className="shrink-0 rounded-md border border-red-200 bg-canvas px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">{savingDate === date ? "삭제 중..." : "삭제"}</button>
                        </div>;
                    })}
                </div>}
            </div>
        </div>
    </div>;
}
