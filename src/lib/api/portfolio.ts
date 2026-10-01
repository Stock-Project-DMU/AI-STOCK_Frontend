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
    type: "INITIAL_GRANT" | "AUTO_CHARGE" | "ADMIN_CHARGE" | "ADMIN_DEDUCTION" | "ORDER_BUY" | "ORDER_SELL" | "ORDER_REFUND";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string | null;
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
export function getChargeRequests(accountId: number) {
    return apiRequest<{ content: ChargeRequestResponse[] }>(`/api/accounts/${accountId}/charge-requests?size=100`);
}
export function requestCharge(accountId: number, amount: number, reason: string) {
    return apiRequest<ChargeRequestResponse>(`/api/accounts/${accountId}/charge-requests`, { method: "POST", body: JSON.stringify({ amount, reason }) });
}

export function getAccountProfit(accountId: number) {
    return apiRequest<ProfitResponse>(`/api/accounts/${accountId}/profit`);
}

export function getRealizedReturns(accountId: number) {
    return apiRequest<RealizedReturnResponse[]>(`/api/accounts/${accountId}/returns`);
}

export function chargeAccount(accountId: number) {
    return apiRequest<AccountInfoResponse>(`/api/accounts/${accountId}/charge`, { method: "POST" });
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
