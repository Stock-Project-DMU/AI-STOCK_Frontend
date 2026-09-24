"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FavoriteButton } from "@/components/common/Button";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { addWatchlist, getWatchlist, removeWatchlist, WATCHLIST_CHANGED } from "@/lib/api/stock";
import { HOME_STOCK_PAGE_SIZE } from "../constants/stockData";
import { getMarketRankings, type MarketRanking } from "@/lib/api/market";

type SortKey = "현재가" | "상승순" | "하락순" | "거래량" | "거래대금";

export default function StockTable() {
    const router = useRouter();
    const tableRef = useRef<HTMLElement>(null);
    const { authenticated, requireLogin } = useAuthGuard();
    const [sortKey, setSortKey] = useState<SortKey>("현재가");
    const [currentPage, setCurrentPage] = useState(1);
    const [favoriteCodes, setFavoriteCodes] = useState<Set<string>>(new Set());
    const [pendingCode, setPendingCode] = useState("");
    const [watchlistError, setWatchlistError] = useState("");
    const [marketRows, setMarketRows] = useState<MarketRanking[]>([]);
    const [marketError, setMarketError] = useState("");
    const [loadingMarket, setLoadingMarket] = useState(false);
    useEffect(() => {
        const changed = (event: Event) => {
            const { stockCode, favorite } = (event as CustomEvent<{ stockCode: string; favorite: boolean }>).detail;
            setFavoriteCodes(current => {
                const next = new Set(current);
                if (favorite) next.add(stockCode); else next.delete(stockCode);
                return next;
            });
        };
        window.addEventListener(WATCHLIST_CHANGED, changed);
        return () => window.removeEventListener(WATCHLIST_CHANGED, changed);
    }, []);
    useEffect(() => {
        let active = true;
        async function load() {
            setLoadingMarket(true); setMarketError("");
            try {
                const items = await getMarketRankings(sortKey === "거래대금" ? "value" : sortKey === "거래량" ? "volume" : "market-cap");
                if (active) setMarketRows(items);
            } catch (error) { if (active) { setMarketRows([]); setMarketError(getApiErrorMessage(error, "시세를 불러오지 못했습니다.")); } }
            finally { if (active) setLoadingMarket(false); }
        }
        void load(); return () => { active = false; };
    }, [sortKey, authenticated]);

    useEffect(() => {
        if (!authenticated) return;

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
    }, [authenticated]);

    async function handleFavorite(stockCode: string, nextFavorite: boolean) {
        if (!requireLogin() || pendingCode) return;

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
        const items = marketRows.map(item => ({ code: item.stockCode, name: item.stockName,
            changeRate: item.changeRate == null ? "—" : (item.changeRate >= 0 ? "+" : "") + item.changeRate.toFixed(2) + "%",
            currentPrice: item.price?.toLocaleString("ko-KR") ?? "—", tradingValue: item.extraInfo ?? "—" }));
        if (sortKey === "상승순") return items.sort((a, b) => Number.parseFloat(b.changeRate) - Number.parseFloat(a.changeRate));
        if (sortKey === "하락순") return items.sort((a, b) => Number.parseFloat(a.changeRate) - Number.parseFloat(b.changeRate));
        return items;
    }, [sortKey, marketRows]);
    const totalPages = Math.max(1, Math.ceil(rows.length / HOME_STOCK_PAGE_SIZE));
    const pageStart = (currentPage - 1) * HOME_STOCK_PAGE_SIZE;
    const visibleRows = rows.slice(pageStart, pageStart + HOME_STOCK_PAGE_SIZE);

    function changePage(page: number) {
        setCurrentPage(page);
        tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
        <section ref={tableRef} className="scroll-mt-20 min-w-0 overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_4px_12px_rgba(10,11,13,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
                <h2 className="text-base font-bold text-ink">주요 종목 <small className="font-normal text-muted">제공 상위 10종목 내 정렬</small></h2>
                <div className="flex flex-wrap gap-1.5">
                    {(["현재가", "상승순", "하락순", "거래량", "거래대금"] as SortKey[]).map((label) => (
                        <Button
                            key={label}
                            variant={sortKey === label ? "primary" : "secondary"}
                            size="sm"
                            className="!h-7 !px-3 !text-[12px]"
                            onClick={() => {
                                setSortKey(label);
                                setCurrentPage(1);
                            }}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {watchlistError && <p role="alert" className="border-b border-hairline bg-red-500/5 px-4 py-2 text-[12px] text-up">{watchlistError}</p>}
            {loadingMarket && <p role="status" className="p-4 text-sm">시세를 불러오는 중...</p>}
            {marketError && <p role="alert" className="p-4 text-sm text-red-500">{marketError}</p>}
            {!loadingMarket && !marketError && !rows.length && <p className="p-4 text-sm">표시할 시세가 없습니다.</p>}

            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-[13px]">
                    <thead>
                        <tr className="border-b border-hairline bg-surface-soft text-[12px] font-bold tracking-wider text-muted">
                            <th className="w-14 px-2 py-2 text-center">번호</th>
                            <th className="w-12 px-2 py-2 text-center">관심</th>
                            <th className="px-2 py-2 text-left">종목</th>
                            <th className="px-2 py-2 text-right">등락률</th>
                            <th className="px-2 py-2 text-right">현재가</th>
                            <th className="px-2 py-2 text-right">시장 정보</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.map((stock, rowIndex) => {
                            const rising = stock.changeRate.startsWith("+");
                            const detailHref = `/stock-detail?code=${stock.code}`;
                            return (
                                <tr
                                    key={stock.code}
                                    role="link"
                                    tabIndex={0}
                                    aria-label={`${stock.name} 상세 보기`}
                                    onClick={() => router.push(detailHref)}
                                    onKeyDown={(event) => {
                                        if (event.target !== event.currentTarget) return;
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            router.push(detailHref);
                                        }
                                    }}
                                    className="cursor-pointer border-b border-hairline-soft transition-colors last:border-0 hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
                                >
                                    <td className="num px-2 py-2 text-center text-muted">{pageStart + rowIndex + 1}</td>
                                    <td className="px-2 py-2 text-center" onClick={(event) => event.stopPropagation()}><FavoriteButton size="sm" favorite={authenticated && favoriteCodes.has(stock.code)} disabled={!!pendingCode} onToggle={(nextFavorite) => void handleFavorite(stock.code, nextFavorite)} /></td>
                                    <td className="px-2 py-2">
                                        <div className="group inline-flex flex-col">
                                            <strong className="font-bold text-ink group-hover:text-primary">{stock.name}</strong>
                                            <span className="mt-0.5 text-[12px] text-muted">{stock.code} · KRX</span>
                                        </div>
                                    </td>
                                    <td className={`num px-2 py-2 text-right font-bold ${rising ? "text-up" : "text-down"}`}>{stock.changeRate}</td>
                                    <td className="num px-2 py-2 text-right font-semibold text-ink">{stock.currentPrice}<span className="ml-1 text-[12px] font-normal text-muted">KRW</span></td>
                                    <td className="num px-2 py-2 text-right text-body">{stock.tradingValue}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline px-4 py-3 sm:flex-row">
                <p className="text-[12px] text-muted">
                    총 {rows.length}개 중 {rows.length ? pageStart + 1 : 0}-{Math.min(pageStart + HOME_STOCK_PAGE_SIZE, rows.length)}개
                </p>
                <nav aria-label="종목 목록 페이지" className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => changePage(page)}
                            aria-label={`${page}페이지`}
                            aria-current={currentPage === page ? "page" : undefined}
                            className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold transition-colors ${
                                currentPage === page
                                    ? "bg-primary text-white"
                                    : "text-muted hover:bg-surface-soft hover:text-ink"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </nav>
            </div>
        </section>
    );
}
