"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getApiErrorMessage } from "@/lib/api/client";
import { getInvestmentProfile } from "@/lib/api/user";
import InvestmentSurvey from "./InvestmentSurvey";

type SurveyStatus = "checking" | "required" | "ready" | "error";

export default function InvestmentSurveyGate({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<SurveyStatus>("checking");
    const [error, setError] = useState("");
    const [checkKey, setCheckKey] = useState(0);

    useEffect(() => {
        let active = true;
        getInvestmentProfile()
            .then(profile => {
                if (active) setStatus(profile?.surveyCompleted ? "ready" : "required");
            })
            .catch(cause => {
                if (!active) return;
                setError(getApiErrorMessage(cause, "투자 성향 확인에 실패했습니다."));
                setStatus("error");
            });
        return () => { active = false; };
    }, [checkKey]);

    if (status === "ready") return <>{children}</>;
    if (status === "required") return <InvestmentSurvey onComplete={() => setStatus("ready")} completeLabel="서비스 이용하기" />;
    if (status === "error") return (
        <div className="flex min-h-[calc(100dvh-72px)] flex-col items-center justify-center gap-3 p-6">
            <p role="alert" className="text-sm text-red-600">{error}</p>
            <button type="button" onClick={() => { setStatus("checking"); setCheckKey(key => key + 1); }} className="rounded-lg border border-hairline bg-canvas px-4 py-2 text-sm font-semibold text-body hover:text-primary">다시 확인</button>
        </div>
    );
    return <p role="status" className="min-h-[calc(100dvh-72px)] p-6 text-sm text-muted">투자 성향 설문 완료 여부를 확인하고 있습니다...</p>;
}
