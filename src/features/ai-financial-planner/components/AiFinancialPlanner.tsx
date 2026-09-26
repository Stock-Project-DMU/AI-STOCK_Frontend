"use client";

import { useEffect, useState } from "react";
import { getPlanningSessions, type PlanningSession } from "@/lib/api/ai";
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

    return (
        <div className="cq-medium-flex-row market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0 flex-col">
            {view === "chat" && <PlannerHistory loading={loading} sessions={sessions} selectedId={sessionId} onSelect={setSessionId} onNewChat={startChat} onNewDiagnosis={() => setView("survey")} />}

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

                <button onClick={() => setConnectionOpen(true)} className="flex h-12 shrink-0 items-center gap-2 border-t border-hairline bg-canvas px-5 text-xs font-bold text-muted hover:text-ink"><GearIcon className="h-3.5 w-3.5" /> 데이터 연동 설정</button>
            </div>

            {connectionOpen && <ConnectionModal onClose={() => setConnectionOpen(false)} />}
        </div>
    );
}
