export type StockMainTab = "chart" | "information";
export type OrderTab = "buy" | "sell" | "pending";
export type InformationTab =
    | "overview"
    | "finance"
    | "earnings"
    | "dividend"
    | "peers"
    | "analysts";

// 탭 공통 응답 — content가 null이면 notice만 보여주고, isSimulated면 모의 데이터 배지를 붙인다.
export type StockResearchEnvelope<T> = {
    sourceName: string | null;
    sourceDetail: string | null;
    sourceUrl: string | null;
    isSimulated: boolean;
    notice: string | null;
    content: T | null;
};

// 최근 사업보고서 기준 실데이터 재무 지표 — 개요 탭 "재무 지표" 카드, 재무제표 탭 연도별 항목과 공용.
export type StockFinancialIndicators = {
    bizYear: number;
    isFinancialCompany: boolean; // true면 매출 관련 항목이 null
    revenue: number | null;
    grossProfit: number | null;
    operatingProfit: number | null;
    profitBeforeTax: number | null;
    netIncome: number | null;
    eps: number | null; // 원/주
    currentAssets: number | null;
    currentLiabilities: number | null;
    cashAndEquivalents: number | null;
    totalAssets: number | null;
    totalLiabilities: number | null;
    issuedCapital: number | null;
    retainedEarnings: number | null;
    totalEquity: number | null;
    operatingCashFlow: number | null;
    investingCashFlow: number | null;
    financingCashFlow: number | null;
    operatingMargin: number | null; // %
    netMargin: number | null;
    roe: number | null;
    roa: number | null;
    debtRatio: number | null;
    currentRatio: number | null;
};

export type StockOverviewContent = {
    company: {
        corpName: string;
        corpNameEng: string | null;
        ceoName: string;
        establishedDate: string;
        settlementMonth: string;
        homepageUrl: string | null;
        irUrl: string | null;
        phoneNumber: string | null;
        address: string;
        jurirNo: string | null;
        bizrNo: string | null;
        indutyCode: string | null; // 업종코드
    } | null; // ETF면 null
    financial: StockFinancialIndicators | null; // 실데이터(DART) — ETF면 null
    listingShares: number | null; // 상장주식수 — 실데이터
    // 아래부터는 모의 시세 기반 — "모의" 배지 필요
    market: string;
    marketCap: number;
    per: number | null;
    pbr: number | null;
    high52w: number;
    high52wDate: string;
    low52w: number;
    low52wDate: string;
    foreignExhaustionRate: number | null;
};

export type StockFinanceYear = StockFinancialIndicators;
export type StockFinanceContent = StockFinanceYear[]; // 최신순

export type StockEarningsContent = {
    bizYear: number;
    reportCode: string;
    isFinancialCompany: boolean; // true면 매출 값이 null
    revenue: number | null;
    operatingProfit: number;
    netIncome: number;
    previousRevenue: number | null;
    previousOperatingProfit: number;
    previousNetIncome: number;
    revenueGrowthRate: number | null;
    operatingProfitGrowthRate: number | null;
    netIncomeGrowthRate: number | null;
};

export type DividendIndicator = {
    label: string; // 괄호 안에 단위 포함
    stockKind: string | null; // 보통주/우선주 구분 없는 연결 지표는 null

    currentValue: number | null;
    previousValue: number | null;
    beforePreviousValue: number | null;
};
export type DividendSchedule = {
    dividendScheduleId: number;
    fiscalYear: string;
    period: string;
    dividendKind: "ANNUAL" | "QUARTERLY" | string;
    dpsCash: number | null;
    recordDate: string;
    exDividendDate: string;
    payDate: string | null;
};
export type StockDividendContent = {
    annual: { indicators: DividendIndicator[] } | null;
    schedules: DividendSchedule[];
};

export type StockPeerItem = {
    rank: number;
    stockCode: string;
    stockName: string;
    marketCap: number;
    extraInfo: string | number | null; // 비중
    per: number | null;
    pbr: number | null;
};
export type StockPeersContent = {
    rank: number; // 현재 보고 있는 종목의 순위 — 이 rank와 같은 행을 강조
    totalCount: number;
    items: StockPeerItem[];
};

export type StockAnalystOpinion = {
    date: string;
    securitiesFirm: string;
    opinionBefore: string | null;
    opinionAfter: string;
    targetPriceBefore: number | null;
    targetPriceAfter: number | null;
};
export type StockAnalystsContent = StockAnalystOpinion[];
