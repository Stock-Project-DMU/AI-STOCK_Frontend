import { apiRequest } from "./client";
import type {
    AccountInfoResponse,
    CreateOrderResponse,
    HoldingResponse,
    OrderHistoryResponse,
    ProfitResponse,
} from "./types";

export function getAccounts() {
    return apiRequest<AccountInfoResponse[]>("/api/accounts");
}

export function getAccountProfit(accountId: number) {
    return apiRequest<ProfitResponse>(`/api/accounts/${accountId}/profit`);
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
