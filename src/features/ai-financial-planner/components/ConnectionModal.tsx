"use client";
import { useEffect, useState } from "react";
import { getGoalPlans, getBriefingHistory, getPlanningPreferences, savePlanningPreferences, type GoalPlan, type NewsBriefing, type PlanningPreferences } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
export default function ConnectionModal({ onClose }: { onClose: () => void }) {
    const [plans, setPlans] = useState<GoalPlan[]>([]);
    const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
    const [preferences, setPreferences] = useState<PlanningPreferences | null>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        Promise.all([getGoalPlans(), getBriefingHistory(), getPlanningPreferences()])
            .then(([plans, briefings, preferences]) => { setPlans(plans.filter(plan => plan.saved)); setBriefings(briefings.filter(briefing => preferences.savedBriefingDates.includes(briefing.briefingDate))); setPreferences(preferences); })
            .catch(error => setError(getApiErrorMessage(error, "연동 정보를 불러오지 못했습니다.")));
    }, []);
    async function save() {
        if (!preferences || busy) return;
        setBusy(true);
        try { await savePlanningPreferences(preferences); onClose(); }
        catch (error) { setError(getApiErrorMessage(error, "연동 설정 저장에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div role="dialog" aria-modal="true" aria-label="데이터 연동 설정" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"><div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-canvas p-6">
        <div className="flex justify-between"><h2 className="text-lg font-bold">데이터 연동 설정</h2><button onClick={onClose}>닫기</button></div>
        <p className="mt-2 text-sm text-muted">선택한 자료를 다음 AI 상담부터 참고합니다. 각 종류당 최대 10개까지 연결할 수 있습니다.</p>
        {error && <p role="alert" className="mt-3 text-red-500">{error}</p>}
        <h3 className="mt-5 font-bold">저장한 목표 시뮬레이션</h3>
        {!plans.length && <p className="mt-2 text-sm text-muted">저장한 목표가 없습니다.</p>}
        {preferences && plans.map(plan => <label key={plan.planId} className="mt-3 flex gap-3 text-sm"><input type="checkbox" checked={preferences.linkedGoalPlanIds.includes(plan.planId)} onChange={event => setPreferences({ ...preferences, linkedGoalPlanIds: event.target.checked ? [...preferences.linkedGoalPlanIds, plan.planId] : preferences.linkedGoalPlanIds.filter(id => id !== plan.planId) })} />{plan.settings.goal === "house" ? "내 집 마련" : "노후 준비"} · {plan.settings.years}년</label>)}
        <h3 className="mt-5 font-bold">저장한 뉴스 브리핑</h3>
        {!briefings.length && <p className="mt-2 text-sm text-muted">저장한 브리핑이 없습니다.</p>}
        {preferences && briefings.map(briefing => <label key={briefing.briefingDate} className="mt-3 flex gap-3 text-sm"><input type="checkbox" checked={preferences.linkedBriefingDates.includes(briefing.briefingDate)} onChange={event => setPreferences({ ...preferences, linkedBriefingDates: event.target.checked ? [...preferences.linkedBriefingDates, briefing.briefingDate] : preferences.linkedBriefingDates.filter(date => date !== briefing.briefingDate) })} />{briefing.briefingDate} · {briefing.outletName}</label>)}
        <button disabled={!preferences || busy} onClick={() => void save()} className="mt-6 rounded bg-primary px-5 py-2 text-white disabled:opacity-50">{busy ? "저장 중..." : "연동 저장"}</button>
    </div></div>;
}
