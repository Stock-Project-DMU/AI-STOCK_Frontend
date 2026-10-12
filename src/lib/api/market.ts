import { apiRequest } from "./client";
export type MarketRanking = { rank: number; stockCode: string; stockName: string; price: number | null; changeAmount: number | null; changeRate: number | null; volume: number | null; extraInfo: string | null };
export type HistoricalPrice = { date: string; open: number; high: number; low: number; close: number; volume: number; changeRate: number | null };
export type MarketIndex = { industryCode: string; industryName: string; indexValue: number | null; changeRate: number | null };
export type MarketNews = { title: string; description: string; link: string; pubDate: string; outlet: string };
export type StockSearchSuggestion = { stockCode: string; stockName: string };
export const getStockSearchSuggestions = (query: string, signal?: AbortSignal) =>
    apiRequest<StockSearchSuggestion[]>(`/api/market/search/suggestions?query=${encodeURIComponent(query)}`, { signal, auth: false });
export const getMarketRankings = (sort = "volume", signal?: AbortSignal) => apiRequest<MarketRanking[]>(`/api/market/rankings?sort=${encodeURIComponent(sort)}`, { signal, auth: false });
// 홈 주요 종목 무한 스크롤용 — 상위 10건 제한 없이 등록 종목 전체를 한 번에 받는다(백엔드 mock 모드 기준, real 모드는 최대 10건).
export const getAllMarketRankings = (sort: string, signal?: AbortSignal) => apiRequest<MarketRanking[]>(`/api/market/rankings?sort=${encodeURIComponent(sort)}&all=true`, { signal, auth: false });
// 종목 상세 차트 — dwmcode(1=일봉/2=주봉/3=월봉)와 봉 개수(count, 최대 60)를 명시해 요청한다.
export type ChartDwmcode = 1 | 2 | 3;
export const getStockHistory = (code: string, dwmcode: ChartDwmcode, count: number) => apiRequest<HistoricalPrice[]>(`/api/market/stocks/${encodeURIComponent(code)}/history?dwmcode=${dwmcode}&count=${count}`, { auth: false });
export const getStockResearch = <T>(code: string, section: string) => apiRequest<T>(`/api/market/stocks/${encodeURIComponent(code)}/research?section=${encodeURIComponent(section)}`, { auth: false });
export const getMarketIndexes = () => apiRequest<MarketIndex[]>("/api/market/indexes", { auth: false });
export const getMarketNews = (query: string, signal?: AbortSignal) => apiRequest<{ results: MarketNews[] }>(`/api/market/news?query=${encodeURIComponent(query)}`, { signal, auth: false });

export type MarketStatus = {
    state: "PRE_OPEN" | "OPEN" | "CLOSED" | "HOLIDAY";
    isOpen: boolean;
    now: string;
    lastTradingDay: string;
    nextOpen: string | null;
    holidayName: string | null;
    openTime: string;
    closeTime: string;
};
export const getMarketStatus = (signal?: AbortSignal) => apiRequest<MarketStatus>("/api/market/status", { signal, auth: false });
export function marketStatusLabel(status: MarketStatus) {
    if (status.state === "HOLIDAY") return status.holidayName ? `휴장(${status.holidayName})` : "휴장";
    if (status.state === "PRE_OPEN") return "장 시작 전";
    if (status.state === "OPEN") return "장중";
    return "장 마감";
}
// 장 상태는 자주 바뀌지 않지만 09:00/15:30 경계를 넘길 때 페이지를 새로고침하지 않아도 반영되도록 이 주기로 재조회한다.
export const MARKET_STATUS_REFRESH_INTERVAL_MS = 30_000;

// 홈 주요 종목·우측 사이드바 시세 자동 갱신 주기. 백엔드 순위 조회가 10초 캐시라 그보다 짧게 잡아도 값이 바뀌지 않는다.
export const MARKET_REFRESH_INTERVAL_MS = 10_000;
