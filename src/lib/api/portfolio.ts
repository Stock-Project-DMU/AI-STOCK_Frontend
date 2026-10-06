import { apiRequest } from "./client";
import type {
    AccountInfoResponse,
    CreateOrderResponse,
    HoldingResponse,
    OrderHistoryResponse,
    ProfitResponse,
    RealizedReturnResponse,
} from "./types";

export function getAccounts() {
    return apiRequest<AccountInfoResponse[]>("/api/accounts");
}

export type AccountTransactionResponse = {
    transactionId: number;
    accountId: number;
    // AUTO_DEDUCTION: 관리자 계정이 본인 계좌를 직접 차감한 경우에만 내려옴(백엔드 확인됨).
    // DIVIDEND: 보유 종목 현금배당 입금(feature/dividend).
    type: "INITIAL_GRANT" | "AUTO_CHARGE" | "ADMIN_CHARGE" | "ADMIN_DEDUCTION" | "AUTO_DEDUCTION" | "ORDER_BUY" | "ORDER_SELL" | "ORDER_REFUND" | "INTEREST" | "TRADE_FEE" | "DIVIDEND";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string | null;
    relatedOrderId: number | null;
    createdAt: string;
};

export async function getAccountTransactions(accountId: number, signal?: AbortSignal) {
    const transactions: AccountTransactionResponse[] = [];
    let page = 0;
    while (true) {
        const result = await apiRequest<{ content: AccountTransactionResponse[]; last: boolean }>(
            `/api/accounts/${accountId}/transactions?page=${page}&size=100&sort=createdAt,desc&sort=transactionId,desc`,
            { signal },
        );
        transactions.push(...result.content);
        if (result.last || result.content.length === 0) return transactions;
        page += 1;
    }
}

export type ChargeRequestResponse = { requestId: number; accountId: number; amount: number; reason: string; status: "PENDING" | "APPROVED" | "REJECTED"; decisionReason: string | null; requestedAt: string; decidedAt: string | null };
export function requestCharge(accountId: number, amount: number, reason: string) {
    return apiRequest<ChargeRequestResponse>(`/api/accounts/${accountId}/charge-requests`, { method: "POST", body: JSON.stringify({ amount, reason }) });
}

// 셀프 충전(자동 승인)과 관리자 충전(요청·직접 지급)을 합친 전체 이력 — 최신순 배열, 페이지 없음.
export type ChargeHistoryResponse = {
    requestId: number;
    source: "SELF" | "ADMIN";
    status: "APPROVED" | "PENDING" | "REJECTED";
    amount: number;
    balanceAfter: number | null;
    reason: string | null;
    decisionReason: string | null;
    requestedAt: string;
    decidedAt: string | null;
};
export function getChargeHistory(accountId: number) {
    return apiRequest<ChargeHistoryResponse[]>(`/api/accounts/${accountId}/charge-history`);
}

export function getAccountProfit(accountId: number) {
    return apiRequest<ProfitResponse>(`/api/accounts/${accountId}/profit`);
}

export function getRealizedReturns(accountId: number) {
    return apiRequest<RealizedReturnResponse[]>(`/api/accounts/${accountId}/returns`);
}

export function chargeAccount(accountId: number, amount: number) {
    return apiRequest<AccountInfoResponse>(`/api/accounts/${accountId}/charge`, { method: "POST", body: JSON.stringify({ amount }) });
}

// 관리자 계좌에서 가상캐시를 직접 차감한다 (관리자 전용).
export function deductAccount(accountId: number, amount: number) {
    return apiRequest<AccountInfoResponse>(`/api/accounts/${accountId}/deduct`, { method: "POST", body: JSON.stringify({ amount }) });
}

export function getOrders(accountId: number) {
    return apiRequest<OrderHistoryResponse[]>(`/api/orders?accountId=${accountId}`);
}

export function getHoldings(accountId: number) {
    return apiRequest<HoldingResponse[]>(`/api/orders/holdings?accountId=${accountId}`);
}

export function createOrder(request: {
    accountId: number;
    stockCode: string;
    orderType: "BUY" | "SELL";
    quantity: number;
    priceType: "MARKET" | "LIMIT";
    orderPrice: number;
}) {
    return apiRequest<CreateOrderResponse>("/api/orders", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export function cancelOrder(orderId: number) {
    return apiRequest<null>(`/api/orders/${orderId}`, { method: "DELETE" });
}
