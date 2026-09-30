"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccounts, getAccountProfit } from "@/lib/api/portfolio";
import { getApiErrorMessage } from "@/lib/api/client";
import { MarketDashboardContent } from "@/features/ai-market-briefing/components/MarketDashboard";

type AssetTotals = { asset: number; profit: number; accountCount: number };

export default function FinancialSummary() {
    const [totals, setTotals] = useState<AssetTotals | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => {
        setLoading(true);
        setError("");
        setRefreshKey(key => key + 1);
    }, []);

    useEffect(() => {
        let active = true;
        getAccounts()
            .then(async accounts => {
                const profits = await Promise.all(accounts.map(account => getAccountProfit(account.accountId)));
                return profits.reduce<AssetTotals>(
                    (sum, item) => ({ asset: sum.asset + item.totalAsset, profit: sum.profit + item.profitAmount, accountCount: accounts.length }),
                    { asset: 0, profit: 0, accountCount: accounts.length },
                );
            })
            .then(result => {
                if (!active) return;
                setTotals(result);
                setUpdatedAt(new Date());
            })
            .catch(cause => { if (active) setError(getApiErrorMessage(cause, "자산을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [refreshKey]);

    useEffect(() => {
        const refreshWhenVisible = () => { if (document.visibilityState === "visible") refresh(); };
        window.addEventListener("focus", refreshWhenVisible);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        const timer = window.setInterval(refreshWhenVisible, 60_000);
        return () => {
            window.removeEventListener("focus", refreshWhenVisible);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
            window.clearInterval(timer);
        };
    }, [refresh]);

    return <aside className="cq-planner-summary shrink-0 overflow-y-auto border-l border-hairline bg-canvas p-4">
        <div className="flex items-start justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink"><span className="h-5 w-5 shrink-0 rounded-sm border-2 border-primary" />나의 자산 대시보드</h2>
            <button type="button" onClick={refresh} disabled={loading} className="shrink-0 rounded-md border border-hairline px-2 py-1 text-xs text-muted hover:text-primary disabled:opacity-50">{loading ? "갱신 중..." : "새로고침"}</button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        {updatedAt && <p className="mt-2 text-xs text-muted">마지막 갱신 {updatedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}{error ? " · 이전 조회 결과" : ""}</p>}
        <div className="always-dark relative mt-4 overflow-hidden rounded-lg p-5">
            <span className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-primary/15" />
            <p className="text-xs text-white/60">총 자산 합계{totals ? ` · 계좌 ${totals.accountCount}개` : ""}</p>
            <strong className="num mt-2 block text-2xl">{totals ? totals.asset.toLocaleString() + "원" : loading ? "조회 중..." : "—"}</strong>
            <p className="mt-5 text-xs text-white/60">누적 평가 손익</p>
            <strong className="num mt-2 block">{totals ? totals.profit.toLocaleString() + "원" : "—"}</strong>
        </div>
        {totals?.accountCount === 0 && <p className="mt-3 text-xs text-muted">등록된 계좌가 없습니다.</p>}
        <div className="mt-6 border-t border-hairline pt-5"><MarketDashboardContent /></div>
    </aside>;
}
