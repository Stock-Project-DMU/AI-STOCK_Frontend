"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CloseIcon } from "@/components/icons/Icon";
import { getPlanningConnectionOptions, getPlanningPreferences, savePlanningPreferences, type PlanningConnectionOptions, type PlanningPreferences } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatCompactWon, formatMonths, formatYearMonth } from "@/features/goal-simulation/utils/simulation";

type ConnectionModalProps = {
    onClose: () => void;
    onSaved: () => void;
};

const PAGE_SIZE = 5;
const MAX_CONNECTIONS = 5;
const MAX_GOALS = 2;

// 목표 연동 항목 — 목표 도달 시뮬레이션에서 저장한 결과(simulation)와 예전 적립식 목표(goalPlan)는 ID 체계가 달라 종류를 함께 둔다.
type GoalItem = { kind: "simulation" | "goalPlan"; id: number; label: string };

function buildGoalItems(options: PlanningConnectionOptions): GoalItem[] {
    const simulations = options.simulations.map<GoalItem>(simulation => ({
        kind: "simulation",
        id: simulation.simulationId,
        label: `${simulation.goalText} · 목표 ${formatCompactWon(simulation.targetAmount)}원`
            + (simulation.periodMonths !== null ? ` · 기한 ${formatMonths(simulation.periodMonths)}` : "")
            + (simulation.rebalancedReachDate ? ` · 리밸런싱 도달 ${formatYearMonth(simulation.rebalancedReachDate)}` : ""),
    }));
    const goalPlans = options.goals.map<GoalItem>(goal => ({
        kind: "goalPlan",
        id: goal.planId,
        label: `(이전 목표) ${goal.goal === "house" ? "내 집 마련" : "노후 준비"} · 월 ${goal.monthlyPayment.toLocaleString()}원 · ${goal.years}년`,
    }));
    return [...simulations, ...goalPlans];
}

function linkedGoalCount(preferences: PlanningPreferences) {
    return preferences.linkedGoalPlanIds.length + preferences.linkedSimulationIds.length;
}

function isGoalLinked(preferences: PlanningPreferences, item: GoalItem) {
    return item.kind === "simulation" ? preferences.linkedSimulationIds.includes(item.id) : preferences.linkedGoalPlanIds.includes(item.id);
}

function PaginationControls({ page, total, onPage, label }: { page: number; total: number; onPage: (page: number) => void; label: string }) {
    const pageCount = Math.ceil(total / PAGE_SIZE);
    if (pageCount <= 1) return null;
    return <nav aria-label={`${label} 페이지`} className="mt-3 flex items-center justify-end gap-3 text-xs text-muted">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 0} className="rounded-md border border-hairline px-3 py-1.5 disabled:opacity-40">이전</button>
        <span>{page + 1} / {pageCount}</span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page + 1 >= pageCount} className="rounded-md border border-hairline px-3 py-1.5 disabled:opacity-40">다음</button>
    </nav>;
}

export default function ConnectionModal({ onClose, onSaved }: ConnectionModalProps) {
    const [options, setOptions] = useState<PlanningConnectionOptions | null>(null);
    const [preferences, setPreferences] = useState<PlanningPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [loadKey, setLoadKey] = useState(0);
    const [goalPage, setGoalPage] = useState(0);
    const [briefingPage, setBriefingPage] = useState(0);
    const closeButton = useRef<HTMLButtonElement>(null);
    const goalItems = options ? buildGoalItems(options) : null;

    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButton.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, []);

    useEffect(() => {
        let active = true;
        Promise.all([getPlanningConnectionOptions(), getPlanningPreferences()])
            .then(([available, current]) => {
                if (!active) return;
                const goalIds = new Set(available.goals.map(goal => goal.planId));
                const simulationIds = new Set(available.simulations.map(simulation => simulation.simulationId));
                const briefingDates = new Set(available.briefings.map(briefing => briefing.briefingDate));
                setOptions(available);
                setGoalPage(0);
                setBriefingPage(0);
                setPreferences({
                    savedBriefingDates: current.savedBriefingDates.filter(date => briefingDates.has(date)),
                    linkedBriefingDates: current.linkedBriefingDates.filter(date => briefingDates.has(date)),
                    linkedGoalPlanIds: current.linkedGoalPlanIds.filter(id => goalIds.has(id)),
                    linkedSimulationIds: (current.linkedSimulationIds ?? []).filter(id => simulationIds.has(id)),
                });
            })
            .catch(cause => { if (active) setError(getApiErrorMessage(cause, "연동 자료를 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [loadKey]);

    const toggleGoal = (item: GoalItem) => {
        if (!preferences) return;
        const selected = isGoalLinked(preferences, item);
        if (!selected && linkedGoalCount(preferences) >= MAX_GOALS) {
            setError("목표 시뮬레이션은 최대 2개까지 연동할 수 있습니다.");
            return;
        }
        if (!selected && linkedGoalCount(preferences) + preferences.linkedBriefingDates.length >= MAX_CONNECTIONS) {
            setError("목표와 브리핑을 합쳐 최대 5개까지 연동할 수 있습니다.");
            return;
        }
        setError("");
        const toggle = (ids: number[]) => selected ? ids.filter(id => id !== item.id) : [...ids, item.id];
        setPreferences(item.kind === "simulation"
            ? { ...preferences, linkedSimulationIds: toggle(preferences.linkedSimulationIds) }
            : { ...preferences, linkedGoalPlanIds: toggle(preferences.linkedGoalPlanIds) });
    };

    const toggleBriefing = (date: string) => {
        if (!preferences) return;
        const selected = preferences.linkedBriefingDates.includes(date);
        if (!selected && linkedGoalCount(preferences) + preferences.linkedBriefingDates.length >= MAX_CONNECTIONS) {
            setError("목표와 브리핑을 합쳐 최대 5개까지 연동할 수 있습니다.");
            return;
        }
        setError("");
        setPreferences({ ...preferences, linkedBriefingDates: selected ? preferences.linkedBriefingDates.filter(item => item !== date) : [...preferences.linkedBriefingDates, date] });
    };

    const save = async () => {
        if (!preferences || busy) return;
        if (linkedGoalCount(preferences) > MAX_GOALS
            || linkedGoalCount(preferences) + preferences.linkedBriefingDates.length > MAX_CONNECTIONS) {
            setError("연동은 전체 최대 5개이며, 목표는 최대 2개까지 선택할 수 있습니다.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const [latest, available] = await Promise.all([getPlanningPreferences(), getPlanningConnectionOptions()]);
            const validGoalIds = new Set(available.goals.map(goal => goal.planId));
            const validSimulationIds = new Set(available.simulations.map(simulation => simulation.simulationId));
            const validBriefingDates = new Set(available.briefings.map(briefing => briefing.briefingDate));
            await savePlanningPreferences({
                ...latest,
                savedBriefingDates: latest.savedBriefingDates.filter(date => validBriefingDates.has(date)),
                linkedBriefingDates: preferences.linkedBriefingDates.filter(date => validBriefingDates.has(date)),
                linkedGoalPlanIds: preferences.linkedGoalPlanIds.filter(id => validGoalIds.has(id)),
                linkedSimulationIds: preferences.linkedSimulationIds.filter(id => validSimulationIds.has(id)),
            });
            onSaved();
            onClose();
        } catch (cause) {
            setError(getApiErrorMessage(cause, "연동 설정을 저장하지 못했습니다."));
        } finally {
            setBusy(false);
        }
    };

    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="connection-title" onKeyDown={event => { if (event.key === "Escape" && !busy) onClose(); }} className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
                <div>
                    <h2 id="connection-title" className="text-lg font-bold text-ink">데이터 연동 설정</h2>
                    <p className="mt-1 text-sm text-muted">선택한 자료는 다음 AI 상담부터 참고합니다. 전체 최대 5개, 목표는 최대 2개까지 연동할 수 있습니다.</p>
                </div>
                <button ref={closeButton} type="button" onClick={onClose} disabled={busy} aria-label="데이터 연동 설정 닫기" className="shrink-0 rounded-md p-2 text-muted hover:bg-surface-soft hover:text-ink disabled:opacity-50"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
                <p className="text-xs text-muted">투자 성향과 대표 보유 종목은 상담에 자동 반영됩니다. 아래에서 저장한 목표와 브리핑을 추가로 연결할 수 있습니다.</p>
                {preferences && <p className="mt-2 text-sm font-semibold text-primary">현재 연동 {linkedGoalCount(preferences) + preferences.linkedBriefingDates.length}/{MAX_CONNECTIONS}건</p>}
                {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
                {loading && <p role="status" className="mt-5 text-sm text-muted">연동 자료를 불러오는 중입니다...</p>}
                {!loading && !options && <button type="button" onClick={() => { setLoading(true); setError(""); setLoadKey(key => key + 1); }} className="mt-4 rounded-lg border border-hairline px-4 py-2 text-sm font-semibold">다시 시도</button>}
                {options && preferences && goalItems && <>
                    <section className="mt-6">
                        <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-ink">저장한 목표 시뮬레이션 · {goalItems.length}건</h3><span className="text-xs text-muted">{linkedGoalCount(preferences)}/{MAX_GOALS} 연동</span></div>
                        {!goalItems.length && <p className="mt-3 text-sm text-muted">저장한 목표가 없습니다. <Link href="/goal-simulation" className="font-semibold text-primary underline">목표 시뮬레이션으로 이동</Link></p>}
                        <div className="mt-3 space-y-2">{goalItems.slice(goalPage * PAGE_SIZE, (goalPage + 1) * PAGE_SIZE).map(item => <label key={`${item.kind}-${item.id}`} className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline p-3 text-sm hover:bg-surface-soft">
                            <input type="checkbox" checked={isGoalLinked(preferences, item)} onChange={() => toggleGoal(item)} disabled={busy} className="accent-primary" />
                            <span className="min-w-0 break-words">{item.label}</span>
                        </label>)}</div>
                        <PaginationControls page={goalPage} total={goalItems.length} onPage={setGoalPage} label="목표 시뮬레이션" />
                    </section>
                    <section className="mt-7">
                        <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-ink">저장한 뉴스 브리핑 · {options.briefings.length}건</h3><span className="text-xs text-muted">{preferences.linkedBriefingDates.length}/{MAX_CONNECTIONS} 연동</span></div>
                        {!options.briefings.length && <p className="mt-3 text-sm text-muted">저장한 브리핑이 없습니다. <Link href="/ai-market-briefing" className="font-semibold text-primary underline">시황 브리핑으로 이동</Link></p>}
                        <div className="mt-3 space-y-2">{options.briefings.slice(briefingPage * PAGE_SIZE, (briefingPage + 1) * PAGE_SIZE).map(briefing => <label key={briefing.briefingDate} className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline p-3 text-sm hover:bg-surface-soft">
                            <input type="checkbox" checked={preferences.linkedBriefingDates.includes(briefing.briefingDate)} onChange={() => toggleBriefing(briefing.briefingDate)} disabled={busy} className="accent-primary" />
                            <span className="min-w-0">{briefing.briefingDate} · {briefing.outletName}</span>
                        </label>)}</div>
                        <PaginationControls page={briefingPage} total={options.briefings.length} onPage={setBriefingPage} label="뉴스 브리핑" />
                    </section>
                </>}
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-hairline px-5 py-4 sm:px-6">
                <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-hairline px-4 py-2 text-sm font-semibold text-body disabled:opacity-50">취소</button>
                <button type="button" onClick={() => void save()} disabled={!preferences || busy || loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "저장 중..." : "연동 저장"}</button>
            </div>
        </div>
    </div>;
}
