"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { MARKET_REFRESH_INTERVAL_MS } from "@/lib/api/market";
import { getAccounts, getHoldings } from "@/lib/api/portfolio";
import { subscribeStock } from "@/lib/api/realtime";
import type { AccountInfoResponse, HoldingResponse, StockPriceResponse } from "@/lib/api/types";

export type LiveHolding = HoldingResponse & { profitRate: number };

export type LivePortfolio = {
    isLoading: boolean;
    error: string;
    accounts: AccountInfoResponse[];
    account: AccountInfoResponse | null;
    holdings: LiveHolding[];
    totalEvaluationAmount: number;
    totalAsset: number;
    accountProfitAmount: number;
    accountProfitRate: number;
    refresh: () => void;
};

const noop = () => {};

const empty: LivePortfolio = {
    isLoading: false,
    error: "",
    accounts: [],
    account: null,
    holdings: [],
    totalEvaluationAmount: 0,
    totalAsset: 0,
    accountProfitAmount: 0,
    accountProfitRate: 0,
    refresh: noop,
};

const LivePortfolioContext = createContext<LivePortfolio | null>(null);

// 사이드바 "내 투자", 계좌 정보, 수익률 화면이 같은 보유종목·평가손익 계산을 공유한다(요청마다 따로 조회/구독하지 않도록 트리 상위에서 한 번만 실행).
// 종목별 현재가는 subscribeStock으로 실시간 갱신하고, 보유 수량·평균가(구조)는 주기적으로 REST 재조회한다.
export default function LivePortfolioProvider({ children }: { children: ReactNode }) {
    const { authenticated } = useAuthGuard();
    const [accounts, setAccounts] = useState<AccountInfoResponse[]>([]);
    const [baseHoldings, setBaseHoldings] = useState<HoldingResponse[]>([]);
    const [livePrices, setLivePrices] = useState<Record<string, StockPriceResponse>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authenticated) return;

        let cancelled = false;

        const load = async (silent: boolean) => {
            if (!silent) setIsLoading(true);
            try {
                const accountList = await getAccounts();
                const primary = accountList[0] ?? null;
                if (cancelled) return;
                setAccounts(accountList);
                const holdings = primary ? await getHoldings(primary.accountId) : [];
                if (cancelled) return;
                setBaseHoldings(holdings);
                setError("");
            } catch (err) {
                if (!cancelled && !silent) setError(getApiErrorMessage(err, "투자 정보를 불러오지 못했습니다."));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        void load(false);
        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") void load(true);
        }, MARKET_REFRESH_INTERVAL_MS);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [authenticated]);

    // 충전처럼 계좌 상태를 즉시 바꾸는 액션 뒤에, 다음 10초 폴링을 기다리지 않고 조용히 한 번 다시 불러온다.
    const refresh = useCallback(() => {
        void (async () => {
            try {
                const accountList = await getAccounts();
                const primary = accountList[0] ?? null;
                setAccounts(accountList);
                setBaseHoldings(primary ? await getHoldings(primary.accountId) : []);
            } catch {
                // 조용한 갱신이므로 실패해도 기존에 표시 중인 값을 그대로 유지한다.
            }
        })();
    }, []);

    // authenticated가 false면 빈 문자열이 되어 아래 구독 effect의 cleanup이 실행되고, 로그아웃 후 재구독되지 않는다.
    const codesKey = useMemo(
        () => authenticated ? [...new Set(baseHoldings.map(holding => holding.stockCode))].sort().join(",") : "",
        [authenticated, baseHoldings],
    );

    useEffect(() => {
        if (!codesKey) return;
        const codes = codesKey.split(",");
        const unsubscribes = codes.map(code => subscribeStock(
            code,
            price => setLivePrices(current => ({ ...current, [code]: price })),
            () => {},
            () => {},
        ));
        return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    }, [codesKey]);

    const holdings = useMemo<LiveHolding[]>(() => baseHoldings.map(holding => {
        const currentPrice = livePrices[holding.stockCode]?.currentPrice ?? holding.currentPrice;
        const cost = holding.avgPrice * holding.quantity;
        const evaluationProfit = (currentPrice - holding.avgPrice) * holding.quantity;
        return { ...holding, currentPrice, evaluationProfit, profitRate: cost === 0 ? 0 : (evaluationProfit / cost) * 100 };
    }), [baseHoldings, livePrices]);

    const account = accounts[0] ?? null;
    const totalEvaluationAmount = holdings.reduce((sum, holding) => sum + holding.currentPrice * holding.quantity, 0);
    const totalAsset = account ? account.balance + account.frozenBalance + totalEvaluationAmount : 0;
    const accountProfitAmount = account ? totalAsset - account.baseBalance : 0;
    const accountProfitRate = account && account.baseBalance !== 0 ? (accountProfitAmount / account.baseBalance) * 100 : 0;

    const value: LivePortfolio = authenticated
        ? { isLoading, error, accounts, account, holdings, totalEvaluationAmount, totalAsset, accountProfitAmount, accountProfitRate, refresh }
        : empty;

    return <LivePortfolioContext.Provider value={value}>{children}</LivePortfolioContext.Provider>;
}

export function useLivePortfolio() {
    const context = useContext(LivePortfolioContext);
    if (!context) throw new Error("useLivePortfolio must be used within LivePortfolioProvider.");
    return context;
}
