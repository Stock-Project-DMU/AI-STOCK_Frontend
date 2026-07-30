"use client";

import { useState } from "react";
import type { BriefingKind } from "../types";
import BriefingFeed from "./BriefingFeed";
import BriefingHistory from "./BriefingHistory";
import MarketDashboard from "./MarketDashboard";
import SaveBriefingModal from "./SaveBriefingModal";

export default function AiMarketBriefing() {
    const [showDetail, setShowDetail] = useState(false);
    const [saveOpen, setSaveOpen] = useState(false);

    const available: BriefingKind[] = showDetail ? ["summary", "semiconductor"] : ["summary"];

    return (
        <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0">
            <BriefingHistory onSelectToday={() => setShowDetail(false)} />
            <div className="flex min-w-0 flex-1">
                <BriefingFeed showDetail={showDetail} onShowDetail={() => setShowDetail(true)} onSave={() => setSaveOpen(true)} />
                <MarketDashboard />
            </div>
            {saveOpen && <SaveBriefingModal available={available} onClose={() => setSaveOpen(false)} />}
        </div>
    );
}
