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
        <div className="market-theme market-grid min-h-[calc(100vh-4rem)] min-w-0 bg-[var(--market-bg)] text-[var(--market-text)]">
            <StockHeader />

            <nav className="border-b border-hairline bg-canvas px-4 sm:px-6">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between">
                    <div className="flex">
                        <MainTab active={tab === "chart"} onClick={() => setTab("chart")}>차트 · 호가</MainTab>
                        <MainTab active={tab === "information"} onClick={() => setTab("information")}>종목 리서치</MainTab>
                    </div>
                    <div className="hidden items-center gap-3 text-[11px] text-muted md:flex">
                        <span>원화</span>
                        <span>실시간</span>
                        <span className="rounded-pill border border-hairline px-3 py-1 text-body">알림 설정</span>
                    </div>
                </div>
            </nav>

            {tab === "chart" ? (
                <div className="mx-auto grid max-w-[1540px] gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-4 xl:p-4">
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
            className={`relative px-4 py-3 text-sm font-bold transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
        >
            {children}
            {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
        </button>
    );
}
