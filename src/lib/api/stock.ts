import { apiRequest } from "./client";
import type { HogaResponse, RecentViewedResponse, StockPriceResponse, WatchlistResponse } from "./types";

export function getStockPrice(stockCode: string) {
    return apiRequest<StockPriceResponse>(`/api/stocks/${stockCode}`);
}

export function getStockHoga(stockCode: string) {
    return apiRequest<HogaResponse>(`/api/stocks/${stockCode}/hoga`);
}

export function getWatchlist() {
    return apiRequest<WatchlistResponse[]>("/api/watchlist");
}

export function addWatchlist(stockCode: string) {
    return apiRequest<null>("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ stockCode }),
    });
}

export function removeWatchlist(stockCode: string) {
    return apiRequest<null>(`/api/watchlist/${stockCode}`, { method: "DELETE" });
}

export function getRecentViewed() {
    return apiRequest<RecentViewedResponse[]>("/api/recent-viewed");
}

export function recordRecentView(stockCode: string) {
    return apiRequest<null>("/api/recent-viewed", {
        method: "POST",
        body: JSON.stringify({ stockCode }),
    });
}
