"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { getAccounts, getHoldings } from "@/lib/api/portfolio";
import { getRecentViewed, getStockPrice, getWatchlist } from "@/lib/api/stock";
import { HOLDINGS, KRW_BALANCES, RECENT_STOCKS, WATCHLIST } from "./sidebarData";
import type { Holding, SidebarStockItem } from "./types";

type SidebarPortfolioData = {
    holdings: Holding[];
    balances: number[];
    watchlist: SidebarStockItem[];
    recent: SidebarStockItem[];
    isLoading: boolean;
    error: string;
};

const initialData: SidebarPortfolioData = {
    holdings: HOLDINGS,
    balances: KRW_BALANCES,
    watchlist: WATCHLIST,
    recent: RECENT_STOCKS,
    isLoading: false,
    error: "",
};

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export function useSidebarPortfolio() {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        if (!isAuthenticated()) return;

        let cancelled = false;

        const load = async () => {
            setData((current) => ({ ...current, isLoading: true, error: "" }));

            try {
                const [accounts, watchlistRows, recentRows] = await Promise.all([
                    getAccounts(),
                    getWatchlist(),
                    getRecentViewed(),
                ]);
                const primaryAccount = accounts[0];
                const holdingRows = primaryAccount ? await getHoldings(primaryAccount.accountId) : [];

                const stockCodes = [...new Set([...watchlistRows, ...recentRows].map((item) => item.stockCode))];
                const prices = await Promise.allSettled(stockCodes.map((code) => getStockPrice(code)));
                const priceMap = new Map(prices.flatMap((result, index) => result.status === "fulfilled" ? [[stockCodes[index], result.value] as const] : []));
                const toStockItem = (item: { stockCode: string; stockName: string }): SidebarStockItem => {
                    const price = priceMap.get(item.stockCode);
                    return {
                        name: item.stockName || price?.stockName || item.stockCode,
                        meta: item.stockCode,
                        priceValue: price?.currentPrice ?? 0,
                        rate: price ? formatRate(price.changeRate) : "시세 없음",
                    };
                };

                if (cancelled) return;

                setData({
                    holdings: holdingRows.map((holding) => {
                        const cost = holding.avgPrice * holding.quantity;
                        return {
                            name: holding.stockName || holding.stockCode,
                            quantity: holding.quantity,
                            amountValue: holding.currentPrice * holding.quantity,
                            profitValue: holding.evaluationProfit,
                            rate: formatRate(cost === 0 ? 0 : (holding.evaluationProfit / cost) * 100),
                        };
                    }),
                    balances: accounts.map((account) => account.balance),
                    watchlist: watchlistRows.map(toStockItem),
                    recent: recentRows.map(toStockItem),
                    isLoading: false,
                    error: "",
                });
            } catch (error) {
                if (!cancelled) {
                    setData((current) => ({
                        ...current,
                        isLoading: false,
                        error: getApiErrorMessage(error, "투자 정보를 불러오지 못했습니다."),
                    }));
                }
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return data;
}
