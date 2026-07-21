"use client";

import { useState } from "react";
import type { StockMainTab } from "../types";
import StockChart from "./StockChart";
import StockHeader from "./StockHeader";
import StockInformation from "./StockInformation";
import TradePanel from "./TradePanel";

export default function StockDetailPage() {
    const [tab, setTab] = useState<StockMainTab>("chart");

    return (
        <div className="market-theme market-grid min-h-[calc(100vh-4rem)] min-w-0 bg-[#050c16] text-slate-100">
            <StockHeader />

            <nav className="border-b border-slate-800 bg-[#081321] px-5 sm:px-8">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between">
                    <div className="flex">
                        <MainTab active={tab === "chart"} onClick={() => setTab("chart")}>차트 · 호가</MainTab>
                        <MainTab active={tab === "information"} onClick={() => setTab("information")}>종목 리서치</MainTab>
                    </div>
                    <div className="hidden items-center gap-4 text-[11px] text-slate-500 md:flex">
                        <span>원화</span>
                        <span>실시간</span>
                        <span className="rounded-full border border-slate-700 px-3 py-1">알림 설정</span>
                    </div>
                </div>
            </nav>

            {tab === "chart" ? (
                <div className="mx-auto grid max-w-[1540px] gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_330px] xl:p-6">
                    <StockChart />
                    <TradePanel />
                </div>
            ) : (
                <StockInformation />
            )}
        </div>
    );
}

function MainTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-5 py-4 text-sm font-bold transition-colors ${active ? "text-white" : "text-slate-500 hover:text-slate-200"}`}
        >
            {children}
            {active && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-red-500" />}
        </button>
    );
}
