"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccounts, getAccountProfit } from "@/lib/api/portfolio";
import { getApiErrorMessage } from "@/lib/api/client";
import type { AccountInfoResponse, ProfitResponse } from "@/lib/api/types";

type AccountOverview = { account: AccountInfoResponse; profit: ProfitResponse | null };

function won(value: number): string {
    return `${value.toLocaleString("ko-KR")}원`;
}

export default function FinancialSummary() {
    const [overview, setOverview] = useState<AccountOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stale, setStale] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => {
        setLoading(true);
        setError("");
        setRefreshKey(key => key + 1);
    }, []);

    useEffect(() => {
        let active = true;
        async function loadAccount() {
            try {
                const accounts = await getAccounts();
                const account = accounts[0];
                if (!account) {
                    if (active) {
                        setOverview(null);
                        setStale(false);
                        setUpdatedAt(new Date());
                    }
                    return;
                }

                let profit: ProfitResponse | null = null;
                let profitError = "";
                try {
                    profit = await getAccountProfit(account.accountId);
                } catch (cause) {
                    profitError = getApiErrorMessage(cause, "평가 정보를 불러오지 못했습니다.");
                }

                if (active) {
                    setOverview({ account, profit });
                    setError(profitError);
                    setStale(false);
                    setUpdatedAt(new Date());
                }
            } catch (cause) {
                if (active) {
                    setError(getApiErrorMessage(cause, "계좌 정보를 불러오지 못했습니다."));
                    setStale(true);
                }
            } finally {
                if (active) setLoading(false);
            }
        }
        void loadAccount();
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

    const account = overview?.account;
    const profit = overview?.profit;

    return <aside className="cq-planner-summary shrink-0 overflow-y-auto border-l border-hairline bg-canvas p-4">
        <div className="flex items-start justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink"><span className="h-5 w-5 shrink-0 rounded-sm border-2 border-primary" />내 계좌 정보</h2>
            <button type="button" onClick={refresh} disabled={loading} className="shrink-0 rounded-md border border-hairline px-2 py-1 text-xs text-muted hover:text-primary disabled:opacity-50">{loading ? "갱신 중..." : "새로고침"}</button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}{stale && account ? " · 이전 조회 결과를 표시합니다." : account && !profit ? " · 계좌 정보만 표시합니다." : ""}</p>}
        {updatedAt && <p className="mt-2 text-xs text-muted">마지막 갱신 {updatedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>}
        {loading && !account && <p role="status" className="mt-5 text-sm text-muted">계좌 정보를 불러오는 중입니다.</p>}
        {!loading && !account && !error && <p className="mt-5 text-sm text-muted">표시할 계좌가 없습니다.</p>}
        {account && <article className="mt-4 overflow-hidden rounded-xl border border-hairline bg-white">
            <div className="theme-accent-soft p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-muted">{account.accountName}</p>
                        <p className="num mt-1 break-all text-sm font-bold text-ink">{account.accountNumber}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${account.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>{account.status === "ACTIVE" ? "정상" : "정지"}</span>
                </div>
                <p className="mt-5 text-xs font-semibold text-muted">주문 가능 금액</p>
                <strong className="num mt-1 block text-xl font-bold text-ink">{won(account.balance)}</strong>
            </div>
            <dl className="divide-y divide-hairline px-4 text-sm">
                <div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">총 평가 자산</dt><dd className="num text-right font-bold">{profit ? won(profit.totalAsset) : "—"}</dd></div>
                <div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">평가 손익</dt><dd className={`num text-right font-bold ${profit && profit.profitAmount > 0 ? "text-up" : profit && profit.profitAmount < 0 ? "text-down" : ""}`}>{profit ? won(profit.profitAmount) : "—"}</dd></div>
                <div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">주문 동결 금액</dt><dd className="num text-right font-bold">{won(account.frozenBalance)}</dd></div>
            </dl>
        </article>}
    </aside>;
}
