"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, FavoriteButton } from "@/components/common/Button";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { addWatchlist, getWatchlist, removeWatchlist } from "@/lib/api/stock";

const STOCK_DATA = [
    { code: "005930", name: "삼성전자", changeRate: "+1.05%", currentPrice: "191,700", tradingValue: "6.7억원" },
    { code: "066570", name: "LG전자", changeRate: "-0.85%", currentPrice: "120,500", tradingValue: "3.2억원" },
    { code: "000660", name: "SK하이닉스", changeRate: "+0.50%", currentPrice: "95,300", tradingValue: "4.1억원" },
    { code: "005380", name: "현대자동차", changeRate: "+2.10%", currentPrice: "220,000", tradingValue: "5.5억원" },
    { code: "035720", name: "카카오", changeRate: "-1.20%", currentPrice: "85,400", tradingValue: "2.8억원" },
    { code: "035420", name: "NAVER", changeRate: "+0.75%", currentPrice: "310,000", tradingValue: "7.3억원" },
    { code: "068270", name: "셀트리온", changeRate: "-0.60%", currentPrice: "250,000", tradingValue: "3.9억원" },
    { code: "012330", name: "현대모비스", changeRate: "+1.80%", currentPrice: "280,000", tradingValue: "4.5억원" },
    { code: "051910", name: "LG화학", changeRate: "-0.95%", currentPrice: "700,000", tradingValue: "6.1억원" },
    { code: "207940", name: "삼성바이오로직스", changeRate: "+0.40%", currentPrice: "900,000", tradingValue: "5.2억원" },
] as const;

type SortKey = "현재가" | "급상승" | "급하락" | "거래량" | "거래대금";

export default function StockTable() {
    const [sortKey, setSortKey] = useState<SortKey>("현재가");
    const [favoriteCodes, setFavoriteCodes] = useState<Set<string>>(new Set());
    const [pendingCode, setPendingCode] = useState("");
    const [watchlistError, setWatchlistError] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) return;

        let active = true;
        getWatchlist()
            .then((watchlist) => {
                if (active) setFavoriteCodes(new Set(watchlist.map((item) => item.stockCode)));
            })
            .catch((error) => {
                if (active) setWatchlistError(getApiErrorMessage(error, "관심 종목을 불러오지 못했습니다."));
            });

        return () => {
            active = false;
        };
    }, []);

    async function handleFavorite(stockCode: string, nextFavorite: boolean) {
        if (!isAuthenticated()) {
            setWatchlistError("로그인 후 관심 종목을 등록할 수 있습니다.");
            return;
        }

        setPendingCode(stockCode);
        setWatchlistError("");
        try {
            if (nextFavorite) await addWatchlist(stockCode);
            else await removeWatchlist(stockCode);

            setFavoriteCodes((current) => {
                const next = new Set(current);
                if (nextFavorite) next.add(stockCode);
                else next.delete(stockCode);
                return next;
            });
        } catch (error) {
            setWatchlistError(getApiErrorMessage(error, "관심 종목 변경에 실패했습니다."));
        } finally {
            setPendingCode("");
        }
    }
    const rows = useMemo(() => {
        if (sortKey === "급상승") return [...STOCK_DATA].sort((a, b) => Number.parseFloat(b.changeRate) - Number.parseFloat(a.changeRate));
        if (sortKey === "급하락") return [...STOCK_DATA].sort((a, b) => Number.parseFloat(a.changeRate) - Number.parseFloat(b.changeRate));
        return STOCK_DATA;
    }, [sortKey]);

    return (
        <section className="overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_4px_12px_rgba(10,11,13,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
                <h2 className="text-base font-bold text-ink">주요 종목</h2>
                <div className="flex flex-wrap gap-1.5">
                    {(["현재가", "급상승", "급하락", "거래량", "거래대금"] as SortKey[]).map((label) => (
                        <Button
                            key={label}
                            variant={sortKey === label ? "primary" : "secondary"}
                            size="sm"
                            className="!h-7 !px-3 !text-[12px]"
                            onClick={() => setSortKey(label)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {watchlistError && <p className="border-b border-hairline bg-red-500/5 px-4 py-2 text-[12px] text-up">{watchlistError}</p>}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-[13px]">
                    <thead>
                        <tr className="border-b border-hairline bg-surface-soft text-[12px] font-bold tracking-wider text-muted">
                            <th className="w-12 px-3 py-2 text-center">관심</th>
                            <th className="px-3 py-2 text-left">종목</th>
                            <th className="px-3 py-2 text-right">등락률</th>
                            <th className="px-3 py-2 text-right">현재가</th>
                            <th className="px-3 py-2 text-right">거래대금</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((stock) => {
                            const rising = stock.changeRate.startsWith("+");
                            return (
                                <tr key={stock.code} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft">
                                    <td className="px-3 py-2 text-center"><FavoriteButton size="sm" favorite={favoriteCodes.has(stock.code)} disabled={pendingCode === stock.code} onToggle={(nextFavorite) => void handleFavorite(stock.code, nextFavorite)} /></td>
                                    <td className="px-3 py-2">
                                        <Link href={stock.name === "삼성전자" ? "/stock-detail" : "/home"} className="group inline-flex flex-col">
                                            <strong className="font-bold text-ink group-hover:text-primary">{stock.name}</strong>
                                            <span className="mt-0.5 text-[12px] text-muted">{stock.code} · KRX</span>
                                        </Link>
                                    </td>
                                    <td className={`num px-3 py-2 text-right font-bold ${rising ? "text-up" : "text-down"}`}>{stock.changeRate}</td>
                                    <td className="num px-3 py-2 text-right font-semibold text-ink">{stock.currentPrice}<span className="ml-1 text-[12px] font-normal text-muted">KRW</span></td>
                                    <td className="num px-3 py-2 text-right text-body">{stock.tradingValue}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
