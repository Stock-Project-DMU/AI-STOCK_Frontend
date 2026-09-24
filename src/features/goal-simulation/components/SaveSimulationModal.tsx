"use client";
import { useEffect, useState } from "react";
import { getGoalPlans, saveGoalPlan, type GoalPlan } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
export default function SaveSimulationModal({ onClose, onSelect }: { onClose: () => void; onSelect: (plan: GoalPlan) => void }) {
    const [plans, setPlans] = useState<GoalPlan[]>([]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => { getGoalPlans().then(setPlans).catch(error => setError(getApiErrorMessage(error, "목록 조회에 실패했습니다."))); }, []);
    async function save(plan: GoalPlan) {
        if (busy) return;
        setBusy(true);
        try { const saved = await saveGoalPlan(plan.planId); setPlans(items => items.map(item => item.planId === saved.planId ? saved : item)); }
        catch (error) { setError(getApiErrorMessage(error, "저장에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label="시뮬레이션 저장">
        <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-canvas p-6">
            <div className="flex justify-between"><h2 className="text-lg font-bold">시뮬레이션 기록</h2><button onClick={onClose}>닫기</button></div>
            {error && <p role="alert" className="mt-3 text-red-500">{error}</p>}
            {!plans.length && <p className="my-6 text-sm text-muted">시뮬레이션을 먼저 실행해 주세요.</p>}
            {plans.map(plan => <div key={plan.planId} className="mt-3 flex items-center gap-3 rounded border border-hairline p-3">
                <button className="flex-1 text-left text-sm" onClick={() => onSelect(plan)}>{plan.settings.goal === "house" ? "내 집 마련" : "노후 준비"} · {plan.settings.years}년 · 월 {plan.settings.monthlyPayment.toLocaleString()}원<br /><small>{formatDateTime(plan.createdAt)}</small></button>
                <button disabled={busy || plan.saved} onClick={() => void save(plan)} className="rounded bg-primary px-3 py-2 text-sm text-white disabled:opacity-50">{plan.saved ? "저장됨" : "저장"}</button>
            </div>)}
        </div>
    </div>;
}
