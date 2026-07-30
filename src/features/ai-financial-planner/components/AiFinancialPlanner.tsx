"use client";

import { useState } from "react";
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

    return (
        <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0">
            {view === "chat" && <PlannerHistory onNewDiagnosis={() => setView("survey")} />}

            <div className="flex min-w-0 flex-1 flex-col">
                {view === "chat" ? (
                    <div className="flex min-h-[900px] min-w-0 flex-1">
                        <PlannerChat />
                        <FinancialSummary />
                    </div>
                ) : (
                    <InvestmentSurvey onComplete={() => setView("chat")} />
                )}

                <button onClick={() => setConnectionOpen(true)} className="flex h-12 items-center gap-2 border-t border-hairline bg-canvas px-5 text-xs font-bold text-muted hover:text-ink"><GearIcon className="h-3.5 w-3.5" /> 데이터 연동 설정</button>
            </div>

            {connectionOpen && <ConnectionModal onClose={() => setConnectionOpen(false)} />}
        </div>
    );
}
