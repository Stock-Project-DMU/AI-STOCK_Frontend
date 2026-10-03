"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FavoriteButton } from "@/components/common/Button";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";
import { getApiErrorMessage } from "@/lib/api/client";
import { addWatchlist, getWatchlist, removeWatchlist, WATCHLIST_CHANGED } from "@/lib/api/stock";
import { HOME_STOCK_PAGE_SIZE } from "../constants/stockData";
import { getAllMarketRankings, MARKET_REFRESH_INTERVAL_MS, type MarketRanking } from "@/lib/api/market";

type SortKey = "현재가" | "상승순" | "하락순" | "거래량" | "거래대금";

// 정렬은 현재 목록 재정렬이 아니라 백엔드 순위(all=true)를 받아온다. all=true 순위는 시장 전체가 아니라 등록 종목
// (stocks.json, 105개) 범위의 순위라, 시가총액 비중 등도 등록 종목 합계 기준이다(real/mock 공통, 2026-10-02).
const RANKING_SORT: Record<SortKey, string> = {
    현재가: "market-cap",
    상승순: "rise",
    하락순: "fall",
    거래량: "volume",
    거래대금: "value",
};

// 정렬 버튼 툴팁 — 같은 종목이라도 시장 전체 순위(AI 상담·사이드바)와 숫자가 다를 수 있어 기준을 알려준다.
const RANKING_TOOLTIP: Record<SortKey, string> = {
    현재가: "등록 종목 기준 시가총액 순입니다. 시가총액 비중은 시장 전체가 아니라 등록 종목 합계 대비 비중입니다.",
    상승순: "등록 종목 중 오늘 상승한 종목을 상승률 순으로 보여줍니다.",
    하락순: "등록 종목 중 오늘 하락한 종목을 하락률 순으로 보여줍니다.",
    거래량: "등록 종목 기준 오늘 누적 거래량 순입니다.",
    거래대금: "등록 종목 기준 오늘 누적 거래대금 순입니다.",
};

export default function StockTable() {
    const router = useRouter();
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { authenticated, requireLogin } = useAuthGuard();
    const [sortKey, setSortKey] = useState<SortKey>("현재가");
    const [visibleCount, setVisibleCount] = useState(HOME_STOCK_PAGE_SIZE);
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
                const items = await getAllMarketRankings(RANKING_SORT[sortKey]);
                if (active) setMarketRows(items);
            } catch (error) { if (active) { setMarketRows([]); setMarketError(getApiErrorMessage(error, "시세를 불러오지 못했습니다.")); } }
            finally { if (active) setLoadingMarket(false); }
        }
        // 화면이 보이는 동안 주기적으로 조용히 다시 불러와 새로고침 없이 시세가 바뀌게 한다.
        // 일시적인 실패는 기존 목록을 그대로 두고 다음 주기에 다시 시도한다.
        // 전체 목록을 요청 1회로 통째로 교체하므로, 스크롤로 펼쳐 둔 개수(visibleCount)는 그대로 유지된다.
        async function refresh() {
            if (document.visibilityState !== "visible") return;
            try {
                const items = await getAllMarketRankings(RANKING_SORT[sortKey]);
                if (active) { setMarketRows(items); setMarketError(""); }
            } catch { /* 다음 주기에 재시도 */ }
        }
        void load();
        const timer = window.setInterval(() => void refresh(), MARKET_REFRESH_INTERVAL_MS);
        return () => { active = false; window.clearInterval(timer); };
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
        return marketRows.map(item => ({ code: item.stockCode, name: item.stockName,
            changeRate: item.changeRate == null ? "—" : (item.changeRate >= 0 ? "+" : "") + item.changeRate.toFixed(2) + "%",
            currentPrice: item.price?.toLocaleString("ko-KR") ?? "—" }));
    }, [marketRows]);
    const visibleRows = rows.slice(0, visibleCount);
    const hasMore = visibleCount < rows.length;

    // 목록 하단 감시 요소가 화면에 들어오면 이미 받아 둔 전체 목록에서 15개씩 더 보여준다(추가 네트워크 요청 없음).
    // visibleCount가 바뀔 때마다 다시 관찰해, 추가한 뒤에도 감시 요소가 계속 보이면(화면이 큰 경우) 이어서 더 펼친다.
    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target || !hasMore) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setVisibleCount((count) => count + HOME_STOCK_PAGE_SIZE);
            }
        }, { rootMargin: "200px 0px" });
        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, visibleCount]);

    return (
        <section className="home-stock-table scroll-mt-20 min-w-0 overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_4px_12px_rgba(10,11,13,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
                <h2 className="text-base font-bold text-ink">주요 종목</h2>
                <div className="flex flex-wrap gap-1.5">
                    {(["현재가", "상승순", "하락순", "거래량", "거래대금"] as SortKey[]).map((label) => (
                        <Button
                            key={label}
                            variant={sortKey === label ? "primary" : "secondary"}
                            size="sm"
                            className="!h-7 !px-3 !text-[12px]"
                            title={RANKING_TOOLTIP[label]}
                            onClick={() => {
                                setSortKey(label);
                                setVisibleCount(HOME_STOCK_PAGE_SIZE);
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

            <div className="min-w-0">
                <table className="w-full table-fixed border-collapse text-[13px]">
                    <thead>
                        <tr className="border-b border-hairline bg-surface-soft text-[12px] font-bold tracking-wider text-muted">
                            <th className="home-stock-rank-column w-9 px-1 py-2 text-center">번호</th>
                            <th className="w-10 px-1 py-2 text-center">관심</th>
                            <th className="min-w-0 px-1.5 py-2 text-left">종목</th>
                            <th className="w-20 px-1 py-2 text-right">등락률</th>
                            <th className="w-36 py-2 pl-1 pr-5 text-right">현재가</th>
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
                                    <td className="home-stock-rank-column num px-1 py-2 text-center text-muted">{rowIndex + 1}</td>
                                    <td className="px-1 py-2 text-center" onClick={(event) => event.stopPropagation()}><FavoriteButton size="sm" favorite={authenticated && favoriteCodes.has(stock.code)} disabled={!!pendingCode} onToggle={(nextFavorite) => void handleFavorite(stock.code, nextFavorite)} /></td>
                                    <td className="min-w-0 px-1.5 py-2">
                                        <div className="group block min-w-0">
                                            <strong title={stock.name} className="block truncate font-bold text-ink group-hover:text-primary"><span className="home-stock-rank-inline hidden">{rowIndex + 1}. </span>{stock.name}</strong>
                                            <span className="mt-0.5 block truncate text-[12px] text-muted">{stock.code} · KRX</span>
                                        </div>
                                    </td>
                                    <td className={`num truncate px-1 py-2 text-right font-bold ${rising ? "text-up" : "text-down"}`}>{stock.changeRate}</td>
                                    <td className="num whitespace-nowrap py-2 pl-1 pr-5 text-right font-semibold text-ink">{stock.currentPrice}<span className="ml-1 text-[12px] font-normal text-muted">KRW</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 무한 스크롤 감시 요소 — 화면에 들어오면 다음 15개를 펼친다. */}
            {hasMore && <div ref={loadMoreRef} aria-hidden="true" className="h-px" />}

            <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline px-4 py-3 sm:flex-row">
                <p role="status" className="text-[12px] text-muted">
                    총 {rows.length}개 중 {visibleRows.length}개 표시
                </p>
                {!!rows.length && (
                    <p className="text-[12px] text-muted">{hasMore ? "아래로 스크롤하면 더 보여드립니다" : "모든 종목을 표시했습니다"}</p>
                )}
            </div>
        </section>
    );
}
