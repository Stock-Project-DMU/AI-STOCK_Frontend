"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendUpIcon } from "@/components/icons/Icon";
import { getMarketIndexes, getMarketRankings, type MarketIndex, type MarketRanking } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
export default function MarketDashboard({ side = "right" }: { side?: "left" | "right" }) {
    const [indexes, setIndexes] = useState<MarketIndex[]>([]);
    const [rankings, setRankings] = useState<MarketRanking[]>([]);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        Promise.allSettled([getMarketIndexes(), getMarketRankings()]).then(([indexes, rankings]) => {
            if (!active) return;
            if (indexes.status === "fulfilled") setIndexes(indexes.value);
            if (rankings.status === "fulfilled") setRankings(rankings.value.slice(0, 10));
            const failed = [indexes, rankings].find(result => result.status === "rejected");
            if (failed?.status === "rejected") setError(getApiErrorMessage(failed.reason, "시장 정보를 불러오지 못했습니다."));
        });
        return () => { active = false; };
    }, []);
    return <aside className={`cq-market-dashboard shrink-0 bg-canvas p-4 ${side === "left" ? "border-r border-hairline" : "border-l border-hairline"}`}>
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink"><TrendUpIcon className="h-3.5 w-3.5" />시장 현황</h2>
        {error && <p role="alert" className="mt-4 text-xs text-red-500">{error}</p>}
        <div className="mt-4 overflow-hidden rounded-md border border-hairline border-t-2 border-t-primary">{indexes.map(index => <div key={index.industryCode} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-hairline-soft px-3 py-2.5 text-[12px] last:border-0"><strong className="text-ink">{index.industryName}</strong><span className="num text-right font-semibold text-ink">{index.indexValue?.toLocaleString() ?? "—"} · <span className={index.changeRate != null && index.changeRate < 0 ? "text-down" : "text-up"}>{index.changeRate == null ? "—" : `${index.changeRate > 0 ? "+" : ""}${index.changeRate}%`}</span></span></div>)}</div>
        <div className="mt-4 rounded-md border border-hairline p-4"><h3 className="text-sm font-bold text-ink">거래량 상위 종목</h3><ol className="mt-3">{rankings.map((item, index) => <li key={item.stockCode}><Link href={`/stock-detail?code=${item.stockCode}`} className="grid grid-cols-[18px_minmax(0,1fr)_auto] gap-1 border-b border-hairline-soft py-2 text-xs last:border-0 hover:text-primary"><strong className={index < 3 ? "text-primary" : "text-muted"}>{index + 1}</strong><span className="truncate">{item.stockName}</span><span>{item.changeRate == null ? "—" : `${item.changeRate}%`}</span></Link></li>)}</ol></div>
        {!rankings.length && <p className="mt-3 text-xs text-muted">현재 표시할 시세가 없습니다.</p>}
    </aside>;
}
