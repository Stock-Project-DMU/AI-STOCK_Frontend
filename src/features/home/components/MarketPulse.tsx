"use client";
import { useEffect, useState } from "react";
import { getMarketIndexes, type MarketIndex } from "@/lib/api/market";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";

export default function MarketPulse() {
    const [indexes, setIndexes] = useState<MarketIndex[]>([]);
    const [exchange, setExchange] = useState<{ price: number | null; changeRate: number | null } | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        void getMarketIndexes()
            .then(value => { if (active) setIndexes(value); })
            .catch(reason => { if (active) setError(getApiErrorMessage(reason, "시장 정보를 불러오지 못했습니다.")); });
        void apiRequest<{ price: number | null; changeRate: number | null }>("/api/market/exchange-rate", { auth: false })
            .then(value => { if (active) setExchange(value); })
            .catch(reason => { if (active) setError(previous => previous || getApiErrorMessage(reason, "환율을 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, []);
    const rows = [
        { name: "KOSPI", price: indexes.find(item => item.industryCode === "001")?.indexValue, rate: indexes.find(item => item.industryCode === "001")?.changeRate },
        { name: "KOSDAQ", price: indexes.find(item => item.industryCode === "301")?.indexValue, rate: indexes.find(item => item.industryCode === "301")?.changeRate },
        { name: "USD/KRW", price: exchange?.price, rate: exchange?.changeRate },
    ];
    return <div><div className="grid grid-cols-3 overflow-hidden rounded-lg border border-hairline bg-canvas">{rows.map(row =>
        <div key={row.name} className="border-r border-hairline px-3 py-3 last:border-0"><p className="text-xs font-bold text-muted">{row.name}</p><strong className="mt-1 block text-lg">{row.price?.toLocaleString("ko-KR", { minimumFractionDigits: 2 }) ?? "—"}</strong><span className={row.rate != null && row.rate < 0 ? "text-down text-xs" : "text-up text-xs"}>{row.rate == null ? "데이터 없음" : (row.rate >= 0 ? "+" : "") + row.rate.toFixed(2) + "%"}</span></div>)}</div>{error && <p role="status" className="mt-2 text-xs text-muted">{error}</p>}</div>;
}
