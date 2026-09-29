"use client";

import { useEffect, useState } from "react";
import { deletePlanningSession, getPlanningConnectionOptions, getPlanningSessions, renamePlanningSession, type PlanningSession } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import { GearIcon } from "@/components/icons/Icon";
import type { PlannerView } from "../types";
import ConnectionModal from "./ConnectionModal";
import FinancialSummary from "./FinancialSummary";
import InvestmentSurvey from "./InvestmentSurvey";
import PlannerChat from "./PlannerChat";
import PlannerHistory from "./PlannerHistory";

export default function AiFinancialPlanner() {
    const [view, setView] = useState<PlannerView>("chat");
    const [connectionOpen, setConnectionOpen] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [sessions, setSessions] = useState<PlanningSession[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [draftKey, setDraftKey] = useState(0);
    const [savedCounts, setSavedCounts] = useState<{ goals: number; briefings: number } | null>(null);
    const [connectionRefreshKey, setConnectionRefreshKey] = useState(0);
    const [connectionMessage, setConnectionMessage] = useState("");
    const [connectionError, setConnectionError] = useState("");
    useEffect(() => {
        let active = true;
        getPlanningSessions().then(items => {
            if (!active) return;
            setSessions(items);
            const latest = [...items].sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt))[0];
            setSessionId(latest?.sessionId ?? null);
        })
            .catch(error => { if (active) setError(getApiErrorMessage(error, "상담 목록을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        let active = true;
        getPlanningConnectionOptions()
            .then(options => {
                if (!active) return;
                setSavedCounts({ goals: options.goals.length, briefings: options.briefings.length });
                setConnectionError("");
            })
            .catch(cause => { if (active) setConnectionError(getApiErrorMessage(cause, "연동 정보를 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, [connectionRefreshKey]);
    useEffect(() => {
        const refresh = () => { if (document.visibilityState === "visible") setConnectionRefreshKey(key => key + 1); };
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
            window.removeEventListener("focus", refresh);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, []);
    const refreshSessions = (id: number) => {
        setSessionId(id);
        getPlanningSessions().then(setSessions).catch(error => setError(getApiErrorMessage(error, "상담 목록 갱신에 실패했습니다.")));
    };
    const startChat = () => {
        setSessionId(null);
        setDraftKey(value => value + 1);
        setView("chat");
        setError("");
    };
    const renameSession = async (id: number, title: string) => {
        const updated = await renamePlanningSession(id, title);
        setSessions(items => items.map(item => item.sessionId === id ? updated : item));
    };
    const deleteSession = async (id: number) => {
        await deletePlanningSession(id);
        const remaining = sessions.filter(item => item.sessionId !== id);
        setSessions(remaining);
        if (sessionId === id) {
            setSessionId(remaining[0]?.sessionId ?? null);
            setDraftKey(value => value + 1);
        }
    };

    return (
        <div className="cq-medium-flex-row ai-chat-page market-theme market-grid flex min-h-[calc(100dvh-72px)] min-w-0 flex-col">
            {view === "chat" && <PlannerHistory loading={loading} sessions={sessions} selectedId={sessionId} onSelect={setSessionId} onNewChat={startChat} onNewDiagnosis={() => setView("survey")} onRename={renameSession} onDelete={deleteSession} />}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {error && <p role="alert" className="p-3 text-sm text-red-500">{error}</p>}
                {view === "chat" ? (
                    <div className="cq-planner-chat-row flex min-h-0 min-w-0 flex-1 flex-col">
                        {loading ? <p role="status" className="flex-1 p-6 text-sm text-muted">최근 상담을 불러오는 중입니다...</p> : <PlannerChat key={`${sessionId ?? "new"}-${draftKey}`} sessionId={sessionId} onSessionChange={refreshSessions} />}
                        <FinancialSummary />
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col"><button type="button" onClick={() => setView("chat")} className="self-start rounded-lg border border-hairline px-4 py-2 text-sm">상담으로 돌아가기</button><InvestmentSurvey onComplete={startChat} completeLabel="AI 상담 시작" /></div>
                )}

                {connectionMessage && <p role="status" className="border-t border-hairline bg-canvas px-5 py-2 text-xs text-primary">{connectionMessage}</p>}
                {connectionError && <p role="alert" className="border-t border-hairline bg-canvas px-5 py-2 text-xs text-red-600">{connectionError}</p>}
                <button onClick={() => setConnectionOpen(true)} className="flex min-h-12 shrink-0 items-center gap-2 border-t border-hairline bg-canvas px-5 text-xs font-bold text-muted hover:text-ink"><GearIcon className="h-3.5 w-3.5 shrink-0" /><span className="min-w-0 truncate">데이터 연동 설정{savedCounts && ` · 저장 목표 ${savedCounts.goals}건 · 저장 브리핑 ${savedCounts.briefings}건`}</span></button>
            </div>

            {connectionOpen && <ConnectionModal onClose={() => { setConnectionOpen(false); setConnectionRefreshKey(key => key + 1); }} onSaved={() => setConnectionMessage("연동 설정이 저장됐습니다. 다음 질문부터 선택한 자료가 반영됩니다.")} />}
        </div>
    );
}
