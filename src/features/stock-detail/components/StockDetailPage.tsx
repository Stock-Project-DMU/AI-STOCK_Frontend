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
        <div className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#f2f4f6]">
            <StockHeader />
            <nav className="border-b bg-white px-5 sm:px-8">
                <button type="button" onClick={() => setTab("chart")} className={`border-b-2 px-4 py-3 text-sm ${tab === "chart" ? "border-red-500 font-bold" : "border-transparent text-gray-400"}`}>차트 · 호가</button>
                <button type="button" onClick={() => setTab("information")} className={`border-b-2 px-4 py-3 text-sm ${tab === "information" ? "border-red-500 font-bold" : "border-transparent text-gray-400"}`}>종목정보</button>
            </nav>

            {tab === "chart" ? (
                <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <StockChart />
                    <TradePanel />
                </div>
            ) : (
                <StockInformation />
            )}
        </div>
    );
}
