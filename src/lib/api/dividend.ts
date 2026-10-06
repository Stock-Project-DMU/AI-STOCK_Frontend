import { apiRequest } from "./client";

// 세 API 모두 로그인 사용자 전용이다(백엔드 DividendController).
export type DividendScheduleResponse = {
    dividendScheduleId: number;
    stockCode: string;
    stockName: string | null;
    fiscalYear: string;
    period: string;
    dividendKind: "ANNUAL" | "QUARTERLY" | string;
    dpsCash: number | null;
    recordDate: string;
    exDividendDate: string;
    payDate: string | null;
    dividendYield: number | null;
};

export type DividendEntitlementResponse = {
    dividendEntitlementId: number;
    stockCode: string;
    stockName: string | null;
    fiscalYear: string;
    period: string;
    quantity: number;
    dpsCash: number;
    totalAmount: number;
    paidAt: string;
};

// isEntitled=true면 배당락이 지나 확정된 권리, false면 보유 중인 종목의 다가오는 배당(예상치)이다.
export type UpcomingDividendResponse = {
    dividendScheduleId: number;
    stockCode: string;
    stockName: string | null;
    fiscalYear: string;
    period: string;
    exDividendDate: string;
    payDate: string;
    isPayDateEstimated: boolean;
    dpsCash: number | null;
    quantity: number;
    expectedAmount: number | null;
    isEntitled: boolean;
};

export function getDividendSchedules(stockCode: string, signal?: AbortSignal) {
    return apiRequest<DividendScheduleResponse[]>(`/api/dividends/schedule?stockCode=${encodeURIComponent(stockCode)}`, { signal });
}

export function getMyDividends(signal?: AbortSignal) {
    return apiRequest<DividendEntitlementResponse[]>("/api/dividends/my", { signal });
}

export function getUpcomingDividends(signal?: AbortSignal) {
    return apiRequest<UpcomingDividendResponse[]>("/api/dividends/upcoming", { signal });
}
