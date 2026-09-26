"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAccounts, getAccountProfit } from "@/lib/api/portfolio";
import { getApiErrorMessage } from "@/lib/api/client";
export default function FinancialSummary() {
    const [totals, setTotals] = useState<{ asset: number; profit: number } | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        getAccounts().then(accounts => Promise.all(accounts.map(account => getAccountProfit(account.accountId))))
            .then(profits => { if (active) setTotals(profits.reduce((sum, item) => ({ asset: sum.asset + item.totalAsset, profit: sum.profit + item.profitAmount }), { asset: 0, profit: 0 })); })
            .catch(error => { if (active) setError(getApiErrorMessage(error, "자산을 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, []);
    return <aside className="cq-planner-summary shrink-0 overflow-y-auto border-l border-hairline bg-canvas p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink"><span className="h-5 w-5 rounded-sm border-2 border-primary" />나의 자산 대시보드</h2>
        {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
        <div className="always-dark relative mt-4 overflow-hidden rounded-lg p-5"><span className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-primary/15" /><p className="text-xs text-white/60">총 자산 합계</p><strong className="num mt-2 block text-2xl">{totals ? totals.asset.toLocaleString() + "원" : "조회 중..."}</strong><p className="mt-5 text-xs text-white/60">누적 평가 손익</p><strong className="num mt-2 block">{totals ? totals.profit.toLocaleString() + "원" : "—"}</strong></div>
        <Link href="/my-page" className="mt-4 block rounded border border-hairline p-3 text-center text-sm">상세 자산 보기</Link>
    </aside>;
}
