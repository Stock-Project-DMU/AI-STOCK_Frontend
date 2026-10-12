import { apiRequest } from "./client";

// 두 API 모두 로그인 사용자 전용이다(백엔드 DividendController). 종목 상세의 배당 일정은
// 더 이상 이 모듈을 쓰지 않고 /api/market/stocks/{code}/research?section=dividend의
// content.schedules로 내려온다(로그인 불필요) — src/features/stock-detail/types.ts의 DividendSchedule 참고.
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

export function getMyDividends(signal?: AbortSignal) {
    return apiRequest<DividendEntitlementResponse[]>("/api/dividends/my", { signal });
}

export function getUpcomingDividends(signal?: AbortSignal) {
    return apiRequest<UpcomingDividendResponse[]>("/api/dividends/upcoming", { signal });
}
