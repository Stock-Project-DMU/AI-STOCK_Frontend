"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
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
import NotificationPanel from "./NotificationPanel";
import TradePanel from "./TradePanel";
import { subscribeStock } from "@/lib/api/realtime";

export default function StockDetailPage({ stockCode }: { stockCode: string }) {
    const { authenticated } = useAuthGuard();
    const [tab, setTab] = useState<StockMainTab>("chart");
    const [stock, setStock] = useState<StockPriceResponse | null>(null);
    const [hoga, setHoga] = useState<HogaResponse | null>(null);
    const [account, setAccount] = useState<AccountInfoResponse | null>(null);
    const [orders, setOrders] = useState<OrderHistoryResponse[] | null>(null);
    const [holdings, setHoldings] = useState<HoldingResponse[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [recentError, setRecentError] = useState("");
    const [liveStatus, setLiveStatus] = useState("");
    const [ticks, setTicks] = useState<(StockPriceResponse & { receivedAt: string })[]>([]);
    useEffect(() => subscribeStock(stockCode, price => {
        setStock(price);
        setTicks(current => [{ ...price, receivedAt: new Date().toLocaleTimeString("ko-KR") }, ...current].slice(0, 30));
    }, setHoga, setLiveStatus), [stockCode, authenticated]);
    useEffect(() => {
        let active = true;

        async function loadStockDetail() {
            setIsLoading(true);
            setError("");
            setRecentError("");

            try {
                const [stockResult, hogaResult, accountResult] = await Promise.allSettled([
                    getStockPrice(stockCode),
                    getStockHoga(stockCode),
                    authenticated ? getAccounts() : Promise.resolve([]),
                ]);

                if (!active) return;

                if (stockResult.status === "fulfilled") {
                    setStock(stockResult.value);
                    if (authenticated) void recordRecentView(stockCode).catch(requestError => {
                        if (active) setRecentError(getApiErrorMessage(requestError, "최근 본 종목을 저장하지 못했습니다."));
                    });
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
                } else {
                    setAccount(null); setOrders(null); setHoldings(null);
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
    }, [stockCode, authenticated]);

    async function refreshTradingData() {
        if (!account) return;
        const [nextOrders, nextHoldings, nextAccounts] = await Promise.all([
            getOrders(account.accountId),
            getHoldings(account.accountId),
            getAccounts(),
        ]);
        setOrders(nextOrders);
        setHoldings(nextHoldings);
        setAccount(nextAccounts.find(item => item.accountId === account.accountId) ?? null);
    }

    return (
        <div className="market-theme market-grid min-h-[calc(100vh-4rem)] min-w-0 bg-[var(--market-bg)] text-[var(--market-text)]">
            <StockHeader stock={stock} />
            {liveStatus && <p role="status" className="px-4 py-1 text-xs text-muted">{liveStatus}</p>}
            {recentError && <p role="alert" className="px-4 py-2 text-xs text-up">최근 본 종목 저장 실패: {recentError}</p>}

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
                        {authenticated && <NotificationPanel />}
                    </div>
                </div>
            </nav>

            {tab === "chart" ? (
                <div className="mx-auto grid max-w-[1540px] gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-4 xl:p-4">
                    <StockChart stockCode={stockCode} stock={stock} hoga={hoga} ticks={ticks} />
                    <TradePanel key={stockCode}
                        stock={stock?.stockCode === stockCode ? stock : null}
                        account={account}
                        orders={orders}
                        holdings={holdings}
                        onTradingDataChanged={refreshTradingData}
                    />
                </div>
            ) : (
                <StockInformation stockCode={stockCode} />
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
