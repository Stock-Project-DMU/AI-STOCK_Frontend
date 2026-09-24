"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    return <aside className={`cq-wide-show hidden w-[280px] shrink-0 bg-canvas p-4 ${side === "left" ? "border-r border-hairline" : "border-l border-hairline"}`}>
        <h2 className="font-bold">시장 현황</h2>
        {error && <p role="alert" className="mt-4 text-xs text-red-500">{error}</p>}
        {indexes.map(index => <div key={index.industryCode} className="mt-3 rounded border border-hairline p-3 text-sm"><strong>{index.industryName}</strong><p className="mt-2">{index.indexValue?.toLocaleString() ?? "—"} · {index.changeRate ?? "—"}%</p></div>)}
        <h3 className="mt-6 text-sm font-bold">거래량 상위 종목</h3>
        {rankings.map((item, index) => <Link href={`/stock-detail?code=${item.stockCode}`} key={item.stockCode} className="mt-3 flex justify-between border-b border-hairline py-2 text-xs"><span>{index + 1}. {item.stockName}</span><span>{item.changeRate ?? "—"}%</span></Link>)}
        {!rankings.length && <p className="mt-3 text-xs text-muted">현재 표시할 시세가 없습니다.</p>}
    </aside>;
}
