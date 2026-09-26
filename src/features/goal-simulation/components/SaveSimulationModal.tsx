"use client";

import { useEffect, useState } from "react";
import {
    deleteGoalPlan,
    getGoalPlans,
    saveGoalPlan,
    updateGoalPlan,
    type GoalPlan,
} from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
import { formatWon } from "../utils/simulation";
import type { GoalType, SimulationSettings } from "../types";

type SaveSimulationModalProps = {
    onClose: () => void;
    onSelect: (plan: GoalPlan) => void;
    onUpdate: (plan: GoalPlan) => void;
};

const formatInteger = (value: number) => Math.round(value).toLocaleString("ko-KR");

function getPlanTitle(plan: GoalPlan) {
    const goal = plan.settings.goal === "house" ? "내 집 마련" : "노후 준비";
    return `${goal} 시뮬레이션${plan.settings.aggressive ? " · 공격적 투자" : ""}`;
}

function isValidSettings(settings: SimulationSettings) {
    return Boolean(settings.goal)
        && Number.isInteger(settings.monthlyPayment)
        && settings.monthlyPayment >= 100_000
        && settings.monthlyPayment <= 5_000_000
        && Number.isInteger(settings.years)
        && settings.years >= 1
        && settings.years <= 50
        && settings.annualReturn >= 0
        && settings.annualReturn <= 12;
}

export default function SaveSimulationModal({ onClose, onSelect, onUpdate }: SaveSimulationModalProps) {
    const [plans, setPlans] = useState<GoalPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyPlanId, setBusyPlanId] = useState<number | null>(null);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [draft, setDraft] = useState<SimulationSettings | null>(null);
    const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        getGoalPlans()
            .then((items) => { if (active) setPlans(items); })
            .catch((loadError) => { if (active) setError(getApiErrorMessage(loadError, "기록을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    function startEditing(plan: GoalPlan) {
        setError("");
        setDeletePlanId(null);
        setEditingPlanId(plan.planId);
        setDraft({ ...plan.settings, goal: plan.settings.goal ?? "house" });
    }

    function cancelEditing() {
        setEditingPlanId(null);
        setDraft(null);
    }

    async function saveBookmark(plan: GoalPlan) {
        if (busyPlanId !== null) return;
        setBusyPlanId(plan.planId);
        setError("");
        try {
            const updated = await saveGoalPlan(plan.planId);
            setPlans((items) => items.map((item) => item.planId === updated.planId ? updated : item));
        } catch (saveError) {
            setError(getApiErrorMessage(saveError, "저장에 실패했습니다."));
        } finally {
            setBusyPlanId(null);
        }
    }

    async function submitEdit(plan: GoalPlan) {
        if (!draft || !isValidSettings(draft) || busyPlanId !== null) return;
        setBusyPlanId(plan.planId);
        setError("");
        try {
            const updated = await updateGoalPlan(plan.planId, draft);
            setPlans((items) => items.map((item) => item.planId === updated.planId ? updated : item));
            onUpdate(updated);
            cancelEditing();
        } catch (updateError) {
            setError(getApiErrorMessage(updateError, "수정 내용을 저장하지 못했습니다."));
        } finally {
            setBusyPlanId(null);
        }
    }

    async function confirmDelete(plan: GoalPlan) {
        if (busyPlanId !== null) return;
        setBusyPlanId(plan.planId);
        setError("");
        try {
            await deleteGoalPlan(plan.planId);
            setPlans((items) => items.filter((item) => item.planId !== plan.planId));
            if (editingPlanId === plan.planId) cancelEditing();
            setDeletePlanId(null);
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError, "기록을 삭제하지 못했습니다."));
        } finally {
            setBusyPlanId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
            <section role="dialog" aria-modal="true" aria-labelledby="goal-plan-history-title" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-hairline bg-canvas p-5 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
                    <div>
                        <h2 id="goal-plan-history-title" className="text-lg font-bold text-ink">시뮬레이션 기록</h2>
                        <p className="mt-1 text-sm text-muted">기록을 선택해 불러오거나 설정을 수정할 수 있습니다.</p>
                    </div>
                    <button type="button" onClick={onClose} className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-soft hover:text-ink">닫기</button>
                </div>

                {error && <p role="alert" className="mt-3 rounded-md bg-red-500/5 px-3 py-2 text-sm text-red-600">{error}</p>}
                {loading && <p role="status" className="my-6 text-center text-sm text-muted">기록을 불러오는 중...</p>}
                {!loading && !plans.length && <p className="my-8 text-center text-sm text-muted">시뮬레이션 기록이 없습니다. 목표를 설정하고 실행해 주세요.</p>}

                <div className="mt-2 space-y-3">
                    {plans.map((plan) => {
                        const title = getPlanTitle(plan);
                        const editing = editingPlanId === plan.planId && draft !== null;
                        const confirmingDelete = deletePlanId === plan.planId;

                        return (
                            <article key={plan.planId} className="rounded-lg border border-hairline bg-white p-3 sm:p-4">
                                {editing ? (
                                    <div>
                                        <h3 className="text-sm font-bold text-ink">시뮬레이션 수정</h3>
                                        <PlanEditor settings={draft} onChange={setDraft} />
                                        <div className="mt-4 flex justify-end gap-2">
                                            <button type="button" onClick={cancelEditing} disabled={busyPlanId !== null} className="rounded-md border border-hairline px-3 py-2 text-sm font-semibold text-body hover:bg-surface-soft disabled:opacity-50">취소</button>
                                            <button type="button" onClick={() => void submitEdit(plan)} disabled={busyPlanId !== null || !isValidSettings(draft)} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50">{busyPlanId === plan.planId ? "저장 중..." : "변경 저장"}</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <button type="button" onClick={() => onSelect(plan)} className="min-w-0 flex-1 text-left">
                                                <span className="flex flex-wrap items-center gap-2">
                                                    <strong className="text-sm font-bold text-ink">{title}</strong>
                                                    {plan.saved && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">저장됨</span>}
                                                </span>
                                                <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-body">
                                                    <span>{plan.settings.years}년</span>
                                                    <span>월 {formatInteger(plan.settings.monthlyPayment)}원</span>
                                                    <span>예상 자산 {formatWon(plan.settings.aggressive ? plan.aggressiveFutureValue : plan.futureValue)}</span>
                                                </span>
                                                <span className="mt-1.5 block text-xs text-muted">기록 일시 · {formatDateTime(plan.createdAt)}</span>
                                            </button>
                                            <div className="flex shrink-0 flex-wrap gap-2">
                                                <button type="button" onClick={() => startEditing(plan)} disabled={busyPlanId !== null} className="rounded-md border border-hairline px-3 py-2 text-sm font-semibold text-body hover:border-primary hover:text-primary disabled:opacity-50">수정</button>
                                                <button type="button" onClick={() => void saveBookmark(plan)} disabled={busyPlanId !== null || plan.saved} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50">{busyPlanId === plan.planId ? "처리 중..." : plan.saved ? "저장됨" : "저장"}</button>
                                                <button type="button" onClick={() => { setDeletePlanId(plan.planId); setError(""); }} disabled={busyPlanId !== null} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">삭제</button>
                                            </div>
                                        </div>
                                        {confirmingDelete && (
                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md bg-red-500/5 px-3 py-2.5">
                                                <p className="text-sm text-body">이 시뮬레이션 기록을 삭제할까요?</p>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setDeletePlanId(null)} disabled={busyPlanId !== null} className="rounded-md border border-hairline px-3 py-1.5 text-sm font-semibold text-body disabled:opacity-50">취소</button>
                                                    <button type="button" onClick={() => void confirmDelete(plan)} disabled={busyPlanId !== null} className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{busyPlanId === plan.planId ? "삭제 중..." : "삭제 확인"}</button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

function PlanEditor({ settings, onChange }: { settings: SimulationSettings; onChange: (settings: SimulationSettings) => void }) {
    const fieldClass = "mt-1 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

    return (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-body">
                목표
                <select value={settings.goal ?? "house"} onChange={(event) => onChange({ ...settings, goal: event.target.value as GoalType })} className={fieldClass}>
                    <option value="house">내 집 마련</option>
                    <option value="retirement">노후 자금 마련</option>
                </select>
            </label>
            <label className="text-xs font-semibold text-body">
                월 납입 금액
                <input type="number" min={100_000} max={5_000_000} step={100_000} value={settings.monthlyPayment} onChange={(event) => onChange({ ...settings, monthlyPayment: Number(event.target.value) })} className={fieldClass} />
            </label>
            <label className="text-xs font-semibold text-body">
                목표 기간 (년)
                <input type="number" min={1} max={50} step={1} value={settings.years} onChange={(event) => onChange({ ...settings, years: Number(event.target.value) })} className={fieldClass} />
            </label>
            <label className="text-xs font-semibold text-body">
                기대 수익률 (연, %)
                <input type="number" min={0} max={12} step={0.5} value={settings.annualReturn} onChange={(event) => onChange({ ...settings, annualReturn: Number(event.target.value) })} className={fieldClass} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-body sm:col-span-2">
                <input type="checkbox" checked={settings.aggressive} onChange={(event) => onChange({ ...settings, aggressive: event.target.checked })} className="h-4 w-4 accent-primary" />
                공격적 투자 시나리오
            </label>
        </div>
    );
}
