"use client";

import { useEffect, useState } from "react";
import { isAuthenticated, getApiErrorMessage } from "@/lib/api/client";
import { getAccounts, getHoldings, getOrders } from "@/lib/api/portfolio";
import { getStockHoga, getStockPrice, recordRecentView } from "@/lib/api/stock";
import type {
    AccountInfoResponse,
    HogaResponse,
    HoldingResponse,
    OrderHistoryResponse,
    StockPriceResponse,
} from "@/lib/api/types";
import type { StockMainTab } from "../types";
import StockChart from "./StockChart";
import StockHeader from "./StockHeader";
import StockInformation from "./StockInformation";
import TradePanel from "./TradePanel";

export default function StockDetailPage() {
    const [tab, setTab] = useState<StockMainTab>("chart");
    const [stock, setStock] = useState<StockPriceResponse | null>(null);
    const [hoga, setHoga] = useState<HogaResponse | null>(null);
    const [account, setAccount] = useState<AccountInfoResponse | null>(null);
    const [orders, setOrders] = useState<OrderHistoryResponse[] | null>(null);
    const [holdings, setHoldings] = useState<HoldingResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const stockCode = "005930";

    useEffect(() => {
        if (!isAuthenticated()) return;

        let active = true;

        async function loadStockDetail() {
            setIsLoading(true);
            setError("");

            try {
                const [stockResult, hogaResult, accountResult] = await Promise.allSettled([
                    getStockPrice(stockCode),
                    getStockHoga(stockCode),
                    getAccounts(),
                ]);

                if (!active) return;

                if (stockResult.status === "fulfilled") {
                    setStock(stockResult.value);
                    void recordRecentView(stockCode).catch(() => undefined);
                }
                if (hogaResult.status === "fulfilled") setHoga(hogaResult.value);

                if (accountResult.status === "fulfilled" && accountResult.value.length > 0) {
                    const selectedAccount = accountResult.value[0];
                    setAccount(selectedAccount);

                    const [ordersResult, holdingsResult] = await Promise.allSettled([
                        getOrders(selectedAccount.accountId),
                        getHoldings(selectedAccount.accountId),
                    ]);

                    if (!active) return;
                    if (ordersResult.status === "fulfilled") setOrders(ordersResult.value);
                    if (holdingsResult.status === "fulfilled") setHoldings(holdingsResult.value);
                }

                const firstFailure = [stockResult, hogaResult, accountResult].find(
                    (result) => result.status === "rejected",
                );
                if (firstFailure?.status === "rejected") {
                    setError(getApiErrorMessage(firstFailure.reason, "종목 정보를 불러오지 못했습니다."));
                }
            } catch (requestError) {
                if (active) {
                    setError(getApiErrorMessage(requestError, "종목 정보를 불러오지 못했습니다."));
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        void loadStockDetail();
        return () => {
            active = false;
        };
    }, []);

    async function refreshTradingData() {
        if (!account) return;
        const [nextOrders, nextHoldings] = await Promise.all([
            getOrders(account.accountId),
            getHoldings(account.accountId),
        ]);
        setOrders(nextOrders);
        setHoldings(nextHoldings);
    }

    return (
        <div className="market-theme market-grid min-h-[calc(100vh-4rem)] min-w-0 bg-[var(--market-bg)] text-[var(--market-text)]">
            <StockHeader stock={stock} />

            {(isLoading || error) && (
                <div className="border-b border-hairline bg-canvas px-4 py-2 text-center text-xs">
                    {isLoading ? (
                        <span className="text-muted">종목 정보를 불러오는 중입니다.</span>
                    ) : (
                        <span className="text-up">{error}</span>
                    )}
                </div>
            )}

            <nav className="border-b border-hairline bg-canvas px-4 sm:px-6">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between">
                    <div className="flex">
                        <MainTab active={tab === "chart"} onClick={() => setTab("chart")}>차트 · 호가</MainTab>
                        <MainTab active={tab === "information"} onClick={() => setTab("information")}>종목 리서치</MainTab>
                    </div>
                    <div className="hidden items-center gap-3 text-[12px] text-muted md:flex">
                        <span>원화</span>
                        <span>실시간</span>
                        <span className="rounded-pill border border-hairline px-3 py-1 text-body">알림 설정</span>
                    </div>
                </div>
            </nav>

            {tab === "chart" ? (
                <div className="mx-auto grid max-w-[1540px] gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-4 xl:p-4">
                    <StockChart stock={stock} hoga={hoga} />
                    <TradePanel
                        stock={stock}
                        account={account}
                        orders={orders}
                        holdings={holdings}
                        onTradingDataChanged={refreshTradingData}
                    />
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
