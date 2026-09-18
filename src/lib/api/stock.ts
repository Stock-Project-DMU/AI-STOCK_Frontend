import { apiRequest, ApiError } from "./client";
import type { HogaResponse, RecentViewedResponse, StockPriceResponse, WatchlistResponse } from "./types";

export async function getStockPrice(stockCode: string): Promise<StockPriceResponse> {
    try {
        return await apiRequest<StockPriceResponse>(`/api/stocks/${stockCode}`, { auth: false });
    } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 503) throw error;
        // 실시간 구독자가 없어 캐시가 비어 있어도 REST 현재가 조회는 가능하다.
        const detail = await apiRequest<Omit<StockPriceResponse, "direction">>(`/api/market/stocks/${stockCode}/detail`, { auth: false });
        return { ...detail, direction: detail.changeAmount > 0 ? "UP" : detail.changeAmount < 0 ? "DOWN" : "FLAT" };
    }
}

export function getStockHoga(stockCode: string) {
    return apiRequest<HogaResponse>(`/api/stocks/${stockCode}/hoga`, { auth: false });
}

export function getWatchlist() {
    return apiRequest<WatchlistResponse[]>("/api/watchlist");
}

export const WATCHLIST_CHANGED = "aistock:watchlist-changed";

export async function addWatchlist(stockCode: string) {
    const result = await apiRequest<null>("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ stockCode }),
    });
    window.dispatchEvent(new CustomEvent(WATCHLIST_CHANGED, { detail: { stockCode, favorite: true } }));
    return result;
}

export async function removeWatchlist(stockCode: string) {
    const result = await apiRequest<null>(`/api/watchlist/${stockCode}`, { method: "DELETE" });
    window.dispatchEvent(new CustomEvent(WATCHLIST_CHANGED, { detail: { stockCode, favorite: false } }));
    return result;
}

export function getRecentViewed() {
    return apiRequest<RecentViewedResponse[]>("/api/recent-viewed");
}

export const RECENT_VIEWED_CHANGED = "aistock:recent-viewed-changed";

export async function recordRecentView(stockCode: string) {
    const result = await apiRequest<null>("/api/recent-viewed", {
        method: "POST",
        body: JSON.stringify({ stockCode }),
    });
    window.dispatchEvent(new Event(RECENT_VIEWED_CHANGED));
    return result;
}
