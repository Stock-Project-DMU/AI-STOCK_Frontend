export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type LoginResponse = AuthTokens & {
    userId: number;
    name: string;
    email: string;
};

export type SignupResponse = {
    userId: number;
    loginId: string;
    role: "USER" | "ADMIN";
};

export type UserInfoResponse = {
    userId: number;
    loginId: string;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    status: "ACTIVE" | "SUSPENDED" | "WITHDRAWN";
};

export type InvestmentProfileResponse = {
    investmentTendency: number;
    fundTendency: number;
    investmentLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
};

export type AccountInfoResponse = {
    accountId: number;
    accountName: string;
    accountNumber: string;
    balance: number;
    frozenBalance: number;
    baseBalance: number;
    chargeCount: number;
    status: "ACTIVE" | "SUSPENDED";
};

export type ProfitResponse = {
    totalAsset: number;
    profitAmount: number;
    profitRate: number;
};

export type OrderHistoryResponse = {
    orderId: number;
    stockCode: string;
    stockName: string;
    orderType: "BUY" | "SELL";
    priceType: "MARKET" | "LIMIT";
    orderPrice: number;
    execPrice: number | null;
    quantity: number;
    status: "PENDING" | "EXECUTED" | "CANCELLED";
    orderedAt: string;
    executedAt: string | null;
};

export type HoldingResponse = {
    stockCode: string;
    stockName: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    evaluationProfit: number;
};

export type CreateOrderResponse = {
    orderId: number;
    stockCode: string;
    execPrice: number | null;
    quantity: number;
    status: "PENDING" | "EXECUTED" | "CANCELLED";
};

export type StockPriceResponse = {
    stockCode: string;
    stockName: string | null;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    direction: "UP" | "DOWN" | "FLAT";
    volume: number;
};

export type HogaResponse = {
    stockCode: string;
    askPrices: number[];
    askVolumes: number[];
    bidPrices: number[];
    bidVolumes: number[];
};

export type WatchlistResponse = {
    stockCode: string;
    stockName: string;
    addedAt: string;
};

export type RecentViewedResponse = {
    stockCode: string;
    stockName: string;
    viewedAt: string;
};
