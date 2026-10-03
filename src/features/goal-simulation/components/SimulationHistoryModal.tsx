"use client";

import { useEffect, useState } from "react";
import { deleteSimulation, getSimulation, getSimulations, type SimulationResult, type SimulationSummary } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
import { formatCompactWon, formatMonths, formatYearMonth } from "../utils/simulation";

type SimulationHistoryModalProps = {
    onClose: () => void;
    onSelect: (result: SimulationResult) => void;
    // 화면에 띄워둔 결과를 삭제하면 부모가 화면을 비울 수 있게 알려준다
    onDeleted: (simulationId: number) => void;
};

export default function SimulationHistoryModal({ onClose, onSelect, onDeleted }: SimulationHistoryModalProps) {
    const [items, setItems] = useState<SimulationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        getSimulations()
            .then((list) => { if (active) setItems(list); })
            .catch((loadError) => { if (active) setError(getApiErrorMessage(loadError, "저장 목록을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    async function select(item: SimulationSummary) {
        if (busyId !== null) return;
        setBusyId(item.simulationId);
        setError("");
        try {
            onSelect(await getSimulation(item.simulationId));
        } catch (loadError) {
            setError(getApiErrorMessage(loadError, "시뮬레이션을 불러오지 못했습니다."));
        } finally {
            setBusyId(null);
        }
    }

    async function confirmDelete(item: SimulationSummary) {
        if (busyId !== null) return;
        setBusyId(item.simulationId);
        setError("");
        try {
            await deleteSimulation(item.simulationId);
            setItems((list) => list.filter((entry) => entry.simulationId !== item.simulationId));
            setDeleteId(null);
            onDeleted(item.simulationId);
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "시뮬레이션을 삭제하지 못했습니다."));
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="simulation-history-title"
                onClick={(event) => event.stopPropagation()}
                className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-hairline bg-canvas p-5 shadow-2xl sm:p-6"
            >
                <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
                    <div>
                        <h2 id="simulation-history-title" className="text-lg font-bold text-ink">저장한 시뮬레이션</h2>
                        <p className="mt-1 text-sm text-muted">항목을 선택하면 저장 당시 결과를 다시 볼 수 있습니다.</p>
                    </div>
                    <button type="button" onClick={onClose} className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-soft hover:text-ink">닫기</button>
                </div>

                {error && <p role="alert" className="mt-3 rounded-md bg-red-500/5 px-3 py-2 text-sm text-red-600">{error}</p>}
                {loading && <p role="status" className="my-6 text-center text-sm text-muted">저장 목록을 불러오는 중...</p>}
                {!loading && !items.length && !error && (
                    <p className="my-8 text-center text-sm text-muted">저장한 시뮬레이션이 없습니다. 실행 결과에서 저장 버튼을 눌러 보관하세요.</p>
                )}

                <ul className="mt-2 space-y-3">
                    {items.map((item) => (
                        <li key={item.simulationId} className="rounded-lg border border-hairline bg-white p-3 sm:p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <button type="button" onClick={() => void select(item)} disabled={busyId !== null} className="min-w-0 flex-1 text-left disabled:opacity-60">
                                    <strong className="block truncate text-sm font-bold text-ink">{item.goalText}</strong>
                                    <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-body">
                                        <span>목표 {formatCompactWon(item.targetAmount)}원</span>
                                        {item.periodMonths !== null && <span>기한 {formatMonths(item.periodMonths)}</span>}
                                        <span>현재 유지 {item.currentReachDate ? formatYearMonth(item.currentReachDate) : "도달 어려움"}</span>
                                        <span className="text-primary">리밸런싱 {item.rebalancedReachDate ? formatYearMonth(item.rebalancedReachDate) : "도달 어려움"}</span>
                                    </span>
                                    <span className="mt-1.5 block text-xs text-muted">
                                        저장 일시 · {formatDateTime(item.createdAt)}
                                        {busyId === item.simulationId && deleteId !== item.simulationId && " · 불러오는 중..."}
                                    </span>
                                </button>
                                <button type="button" onClick={() => { setDeleteId(item.simulationId); setError(""); }} disabled={busyId !== null} className="shrink-0 self-start rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 sm:self-center">삭제</button>
                            </div>
                            {deleteId === item.simulationId && (
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md bg-red-500/5 px-3 py-2.5">
                                    <p className="text-sm text-body">이 시뮬레이션을 삭제할까요?</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setDeleteId(null)} disabled={busyId !== null} className="rounded-md border border-hairline px-3 py-1.5 text-sm font-semibold text-body disabled:opacity-50">취소</button>
                                        <button type="button" onClick={() => void confirmDelete(item)} disabled={busyId !== null} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{busyId === item.simulationId ? "삭제 중..." : "삭제 확인"}</button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
