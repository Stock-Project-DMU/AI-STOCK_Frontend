"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { getAccounts, getHoldings } from "@/lib/api/portfolio";
import { MARKET_REFRESH_INTERVAL_MS } from "@/lib/api/market";
import { addWatchlist, removeWatchlist, WATCHLIST_CHANGED, RECENT_VIEWED_CHANGED, getRecentViewed, getStockPrice, getWatchlist } from "@/lib/api/stock";
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
    holdings: [],
    balances: [],
    watchlist: [],
    recent: [],
    isLoading: false,
    error: "",
};

const formatRate = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

export function useSidebarPortfolio() {
    const [data, setData] = useState(initialData);
    const { authenticated, requireLogin } = useAuthGuard();
    const [revision, setRevision] = useState(0);
    const [favoriteCodes, setFavoriteCodes] = useState<Set<string>>(new Set());
    const [pendingCodes, setPendingCodes] = useState<Set<string>>(new Set());
    const inFlight = useRef(new Set<string>());
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        const changed = () => setRevision(value => value + 1);
        window.addEventListener(WATCHLIST_CHANGED, changed);
        window.addEventListener(RECENT_VIEWED_CHANGED, changed);
        return () => {
            window.removeEventListener(WATCHLIST_CHANGED, changed);
            window.removeEventListener(RECENT_VIEWED_CHANGED, changed);
        };
    }, []);

    async function onFavorite(stockCode: string, favorite: boolean) {
        if (!requireLogin() || inFlight.current.has(stockCode)) return;
        inFlight.current.add(stockCode);
        setPendingCodes(new Set(inFlight.current));
        setActionError("");
        try {
            if (favorite) await addWatchlist(stockCode);
            else await removeWatchlist(stockCode);
            setFavoriteCodes(current => {
                const next = new Set(current);
                if (favorite) next.add(stockCode); else next.delete(stockCode);
                return next;
            });
            if (!favorite) setData(current => ({ ...current, watchlist: current.watchlist.filter(item => item.meta !== stockCode) }));
        } catch (error) {
            setActionError(getApiErrorMessage(error, "관심 종목 변경에 실패했습니다."));
        } finally {
            inFlight.current.delete(stockCode);
            setPendingCodes(new Set(inFlight.current));
        }
    }

    useEffect(() => {
        if (!authenticated) return;

        let cancelled = false;

        // silent: 주기적 시세 갱신용 — 로딩 표시·중간 목록 교체 없이 값만 바꾸고, 실패해도 기존 화면을 유지한다.
        const load = async (silent: boolean) => {
            if (!silent) setData((current) => ({ ...current, isLoading: true, error: "" }));

            try {
                const [accounts, watchlistRows, recentRows] = await Promise.all([
                    getAccounts(),
                    getWatchlist(),
                    getRecentViewed(),
                ]);
                const primaryAccount = accounts[0];
                if (cancelled) return;
                setFavoriteCodes(new Set(watchlistRows.map(item => item.stockCode)));
                // Show saved lists immediately; slow quote requests should not hide navigation.
                if (!silent) setData(current => {
                    const known = new Map([...current.watchlist, ...current.recent].map(item => [item.meta, item]));
                    const toSavedItem = (item: { stockCode: string; stockName: string }): SidebarStockItem => ({
                        name: item.stockName || item.stockCode,
                        meta: item.stockCode,
                        priceValue: known.get(item.stockCode)?.priceValue ?? 0,
                        rate: known.get(item.stockCode)?.rate ?? "시세 없음",
                    });
                    return { ...current, watchlist: watchlistRows.map(toSavedItem), recent: recentRows.map(toSavedItem), isLoading: false };
                });
                const holdingRows = primaryAccount ? await getHoldings(primaryAccount.accountId) : [];

                const stockCodes = [...new Set([...watchlistRows, ...recentRows].map((item) => item.stockCode))];
                const prices = await Promise.allSettled(stockCodes.map((code) => getStockPrice(code)));
                const priceMap = new Map(prices.flatMap((result, index) => result.status === "fulfilled" ? [[stockCodes[index], result.value] as const] : []));
                // 시세 조회가 일시적으로 실패한 종목은 직전에 표시하던 가격을 유지한다(주기 갱신 중 깜빡임 방지).
                const toStockItem = (known: Map<string, SidebarStockItem>) => (item: { stockCode: string; stockName: string }): SidebarStockItem => {
                    const price = priceMap.get(item.stockCode);
                    const previous = known.get(item.stockCode);
                    if (!price && previous) return { ...previous, name: item.stockName || previous.name };
                    return {
                        name: item.stockName || price?.stockName || item.stockCode,
                        meta: item.stockCode,
                        priceValue: price?.currentPrice ?? 0,
                        rate: price ? formatRate(price.changeRate) : "시세 없음",
                    };
                };

                if (cancelled) return;

                setData(current => {
                    const known = new Map([...current.watchlist, ...current.recent].map(item => [item.meta, item]));
                    return {
                        holdings: holdingRows.map((holding) => {
                            const cost = holding.avgPrice * holding.quantity;
                            return {
                                stockCode: holding.stockCode,
                                name: holding.stockName || holding.stockCode,
                                quantity: holding.quantity,
                                amountValue: holding.currentPrice * holding.quantity,
                                profitValue: holding.evaluationProfit,
                                rate: formatRate(cost === 0 ? 0 : (holding.evaluationProfit / cost) * 100),
                            };
                        }),
                        balances: accounts.map((account) => account.balance),
                        watchlist: watchlistRows.map(toStockItem(known)),
                        recent: recentRows.map(toStockItem(known)),
                        isLoading: false,
                        error: "",
                    };
                });
            } catch (error) {
                if (!cancelled && !silent) {
                    setData((current) => ({
                        ...current,
                        isLoading: false,
                        error: getApiErrorMessage(error, "투자 정보를 불러오지 못했습니다."),
                    }));
                }
            }
        };

        void load(false);
        // 내 투자(평가액)·관심·최근 본 종목 가격을 화면이 보이는 동안 주기적으로 갱신한다.
        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") void load(true);
        }, MARKET_REFRESH_INTERVAL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [authenticated, revision]);

    return { ...(authenticated ? data : initialData), actionError: authenticated ? actionError : "", favoriteCodes: authenticated ? favoriteCodes : new Set<string>(), pendingCodes, onFavorite };
}
