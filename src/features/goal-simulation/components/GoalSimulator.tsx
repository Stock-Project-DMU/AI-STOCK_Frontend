"use client";

import { useState } from "react";
import MarketDashboard from "@/features/ai-market-briefing/components/MarketDashboard";
import { Button } from "@/components/common/Button";
import type { SimulationSettings } from "../types";
import GrowthChart from "./GrowthChart";
import SaveSimulationModal from "./SaveSimulationModal";
import SimulationControls from "./SimulationControls";
import SimulationResults from "./SimulationResults";
import { createGoalPlan, type GoalPlan } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

const initialSettings: SimulationSettings = {
    goal: null,
    monthlyPayment: 500_000,
    years: 10,
    annualReturn: 5,
    aggressive: false,
};

export default function GoalSimulator() {
    const [settings, setSettings] = useState(initialSettings);
    const [resultSettings, setResultSettings] = useState<SimulationSettings | null>(null);
    const [saveOpen, setSaveOpen] = useState(false);
    const [result, setResult] = useState<GoalPlan | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const runSimulation = async () => {
        if (!settings.goal || busy) return;
        setBusy(true); setError("");
        try {
            const plan = await createGoalPlan(settings);
            setResult(plan);
            setResultSettings(plan.settings);
        } catch (error) { setError(getApiErrorMessage(error, "시뮬레이션 실행에 실패했습니다.")); }
        finally { setBusy(false); }
    };

    return (
        <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0">
            <MarketDashboard side="left" />

            <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-[1220px] rounded-lg border border-hairline bg-canvas p-5 shadow-[0_4px_12px_rgba(0,0,0,.04)] sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="border-l-4 border-primary pl-3">
                            <h1 className="text-xl font-bold text-ink">목표 도달 시뮬레이션</h1>
                            <p className="mt-1 text-xs text-muted">
                                {resultSettings?.aggressive
                                    ? "기본 시나리오와 공격적 투자 시나리오를 비교합니다."
                                    : resultSettings?.goal === "retirement"
                                      ? "노후 자금 마련 목표로 시뮬레이션을 실행한 결과입니다."
                                      : resultSettings?.goal === "house"
                                        ? "내 집 마련 목표로 시뮬레이션을 실행한 결과입니다."
                                        : "목표를 설정하고 시뮬레이션을 실행하세요. 자산 성장 추이를 확인할 수 있습니다."}
                            </p>
                        </div>
                        <Button variant="primary" size="md" onClick={() => setSaveOpen(true)}>저장</Button>
                    </div>

                    {busy && <p role="status" className="mt-3 text-sm">시뮬레이션 계산 중...</p>}
                    {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
                    {result && <p className="mt-3 text-sm">예상 자산: {result.futureValue.toLocaleString("ko-KR")}원</p>}
                    <div className="mt-5 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <SimulationControls settings={settings} onChange={setSettings} onRun={runSimulation} />
                        <GrowthChart
                            monthlyPayment={resultSettings?.monthlyPayment ?? settings.monthlyPayment}
                            years={resultSettings?.years ?? settings.years}
                            annualReturn={resultSettings?.annualReturn ?? settings.annualReturn}
                            aggressive={resultSettings?.aggressive ?? false}
                            hasResult={resultSettings !== null}
                        />
                    </div>

                    {resultSettings ? (
                        <SimulationResults settings={resultSettings} />
                    ) : (
                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                            {["예상 자산이 여기에 표시됩니다", "계산 해설이 여기에 표시됩니다", "계산 가정이 여기에 표시됩니다"].map((text) => (
                                <div key={text} className="flex min-h-32 items-center justify-center rounded-lg border border-hairline bg-surface-soft text-center text-sm text-muted">▤<br />{text}</div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {saveOpen && <SaveSimulationModal onSelect={plan => { setResult(plan); setSettings(plan.settings); setResultSettings(plan.settings); setSaveOpen(false); }} onClose={() => setSaveOpen(false)} />}
        </div>
    );
}
