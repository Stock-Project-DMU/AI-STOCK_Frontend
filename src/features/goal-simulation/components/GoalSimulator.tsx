"use client";

import { useState } from "react";
import MarketDashboard from "@/features/ai-market-briefing/components/MarketDashboard";
import type { SimulationSettings } from "../types";
import GrowthChart from "./GrowthChart";
import SaveSimulationModal from "./SaveSimulationModal";
import SimulationControls from "./SimulationControls";
import SimulationResults from "./SimulationResults";

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

    const runSimulation = () => {
        if (!settings.goal) return;
        setResultSettings({ ...settings });
    };

    return (
        <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0">
            <MarketDashboard side="left" />

            <div className="min-w-0 flex-1 px-4 py-8 sm:px-7 lg:px-10">
                <section className="mx-auto max-w-[1220px] rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,.24)] sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="border-l-4 border-red-500 pl-3">
                            <p className="theme-accent-text text-[10px] font-black tracking-[0.15em]">GOAL ENGINE · DEMO</p>
                            <h1 className="mt-1 text-xl font-black">목표 도달 시뮬레이션</h1>
                            <p className="mt-1 text-xs text-gray-400">
                                {resultSettings?.aggressive
                                    ? "기본 시나리오와 공격적 투자 시나리오를 비교합니다."
                                    : resultSettings?.goal === "retirement"
                                      ? "노후 자금 마련 목표로 시뮬레이션을 실행한 결과입니다."
                                      : resultSettings?.goal === "house"
                                        ? "내 집 마련 목표로 시뮬레이션을 실행한 결과입니다."
                                        : "목표를 설정하고 시뮬레이션을 실행하세요. 자산 성장 추이를 확인할 수 있습니다."}
                            </p>
                        </div>
                        <button type="button" onClick={() => setSaveOpen(true)} className="rounded-lg bg-black px-7 py-3 text-sm font-bold text-white hover:bg-gray-800">저장</button>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
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
                        <div className="mt-5 grid gap-4 lg:grid-cols-3">
                            {["예상 자산이 여기에 표시됩니다", "AI 인사이트가 여기에 표시됩니다", "전략 팁이 여기에 표시됩니다"].map((text) => (
                                <div key={text} className="flex min-h-32 items-center justify-center rounded-2xl border border-gray-800 text-center text-sm text-gray-300">▤<br />{text}</div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {saveOpen && <SaveSimulationModal onClose={() => setSaveOpen(false)} />}
        </div>
    );
}
