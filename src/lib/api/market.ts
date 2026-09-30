import { apiRequest } from "./client";
export type MarketRanking = { rank: number; stockCode: string; stockName: string; price: number | null; changeAmount: number | null; changeRate: number | null; volume: number | null; extraInfo: string | null };
export type HistoricalPrice = { date: string; open: number; high: number; low: number; close: number; volume: number; changeRate: number | null };
export type MarketIndex = { industryCode: string; industryName: string; indexValue: number | null; changeRate: number | null };
export type MarketNews = { title: string; description: string; link: string; pubDate: string; outlet: string };
export type StockSearchSuggestion = { stockCode: string; stockName: string };
export const getStockSearchSuggestions = (query: string, signal?: AbortSignal) =>
    apiRequest<StockSearchSuggestion[]>(`/api/market/search/suggestions?query=${encodeURIComponent(query)}`, { signal, auth: false });
export const getMarketRankings = (sort = "volume", signal?: AbortSignal) => apiRequest<MarketRanking[]>(`/api/market/rankings?sort=${encodeURIComponent(sort)}`, { signal, auth: false });
export const getStockHistory = (code: string, months: number) => apiRequest<HistoricalPrice[]>(`/api/market/stocks/${encodeURIComponent(code)}/history?months=${months}`, { auth: false });
export const getStockResearch = (code: string, section: string) => apiRequest<unknown>(`/api/market/stocks/${encodeURIComponent(code)}/${section === "overview" ? "detail" : "research?section=" + encodeURIComponent(section)}`, { auth: false });
export const getMarketIndexes = () => apiRequest<MarketIndex[]>("/api/market/indexes", { auth: false });
export const getMarketNews = (query: string, signal?: AbortSignal) => apiRequest<{ results: MarketNews[] }>(`/api/market/news?query=${encodeURIComponent(query)}`, { signal, auth: false });

// 홈 주요 종목·우측 사이드바 시세 자동 갱신 주기. 백엔드 순위 조회가 10초 캐시라 그보다 짧게 잡아도 값이 바뀌지 않는다.
export const MARKET_REFRESH_INTERVAL_MS = 10_000;
