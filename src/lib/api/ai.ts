import { ApiError, apiRequest, getApiErrorMessage } from "./client";
export type PlanningSession = { sessionId: number; title: string | null; status: string; createdAt: string; updatedAt: string };
export type PlanningMessage = { messageId: number; role: "USER" | "AI" | "ASSISTANT" | "MODEL"; content: string; createdAt: string };
export const getPlanningSessions = () => apiRequest<PlanningSession[]>("/api/ai/planning/sessions");
export const createPlanningSession = () => apiRequest<PlanningSession>("/api/ai/planning/sessions", { method: "POST" });
export const renamePlanningSession = (id: number, title: string) => apiRequest<PlanningSession>(`/api/ai/planning/sessions/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
export const deletePlanningSession = (id: number) => apiRequest<null>(`/api/ai/planning/sessions/${id}`, { method: "DELETE" });
export const getPlanningMessages = (id: number) => apiRequest<PlanningMessage[]>(`/api/ai/planning/sessions/${id}/messages`);
export const sendPlanningMessage = (id: number, content: string) => apiRequest<PlanningMessage>(`/api/ai/planning/sessions/${id}/messages`, { method: "POST", body: JSON.stringify({ content }) });
export type NewsOutlet = { outletDomain: string; outletName: string };
export type NewsSetting = NewsOutlet & { deliveryTime: string; lastAttemptAt: string | null };
export type NewsBriefing = NewsOutlet & { deliveryTime: string | null; briefingDate: string; content: string; sources: { title: string; link: string; outlet: string }[]; createdAt: string };
export const getNewsOutlets = () => apiRequest<NewsOutlet[]>("/api/ai/news/outlets");
export const getNewsSetting = () => apiRequest<NewsSetting | null>("/api/ai/news/settings");
export const saveNewsSetting = (outletDomain: string, deliveryTime: string) => apiRequest<NewsSetting>("/api/ai/news/settings", { method: "PUT", body: JSON.stringify({ outletDomain, deliveryTime }) });
export const getBriefingHistory = () => apiRequest<NewsBriefing[]>("/api/ai/news/briefings");
export const getBriefingByDate = (date: string) => apiRequest<NewsBriefing>(`/api/ai/news/briefings/${encodeURIComponent(date)}`);
export type NewsChatTurn = { role: "USER" | "ASSISTANT"; content: string };
export type NewsChatAnswer = { content: string; searchedAt: string; sources: { title: string; description: string; link: string; pubDate: string; outlet: string }[] };
export const sendNewsChat = (content: string, history: NewsChatTurn[]) => apiRequest<NewsChatAnswer>("/api/ai/news/chat", { method: "POST", body: JSON.stringify({ content, history }) });
export type NewsChatSession = { sessionId: number; outletDomain: string | null; outletName: string; deliveryTime: string | null; createdAt: string; updatedAt: string };
export type NewsChatMessage = NewsChatTurn & { messageId: number; sources: NewsChatAnswer["sources"]; searchedAt: string | null; createdAt: string };
export type NewsChatSessions = { currentSessionId: number; sessions: NewsChatSession[] };
export const syncNewsChatSessions = () => apiRequest<NewsChatSessions>("/api/ai/news/chat/sessions/sync", { method: "POST" });
export const deleteNewsChatSession = (sessionId: number) => apiRequest<null>(`/api/ai/news/chat/sessions/${sessionId}`, { method: "DELETE" });
export const getNewsChatMessages = (sessionId: number) => apiRequest<NewsChatMessage[]>(`/api/ai/news/chat/sessions/${sessionId}/messages`);
export const sendNewsChatMessage = (sessionId: number, content: string, briefingDate: string | null) =>
    apiRequest<NewsChatMessage[]>(`/api/ai/news/chat/sessions/${sessionId}/messages`, {
        method: "POST", body: JSON.stringify({ content, briefingDate }),
    });

// linkedGoalPlanIds는 예전 적립식 목표(goal_plans), linkedSimulationIds는 목표 도달 시뮬레이션에서 저장한 결과 — 두 목록을 합쳐 최대 2개
export type PlanningPreferences = { savedBriefingDates: string[]; linkedBriefingDates: string[]; linkedGoalPlanIds: number[]; linkedSimulationIds: number[] };
export type PlanningConnectionOptions = {
    goals: { planId: number; goal: string; monthlyPayment: number; years: number }[];
    simulations: { simulationId: number; goalText: string; targetAmount: number; periodMonths: number | null; rebalancedReachDate: string | null; createdAt: string }[];
    briefings: { briefingDate: string; outletDomain: string; outletName: string; deliveryTime: string | null }[];
};
export const getPlanningPreferences = () => apiRequest<PlanningPreferences>("/api/ai/planning/preferences");
export const getPlanningConnectionOptions = () => apiRequest<PlanningConnectionOptions>("/api/ai/planning/preferences/options");
export const savePlanningPreferences = (request: PlanningPreferences) => apiRequest<PlanningPreferences>("/api/ai/planning/preferences", { method: "PUT", body: JSON.stringify(request) });
// 목표 도달 시뮬레이션(보유종목 유지 vs 투자성향 리밸런싱 비교) — 백엔드 SimulationController
export type SimulationPoint = { date: string; value: number };
export type PortfolioAllocation = { stockCode: string; stockName: string; weight: number; monthlyGrowthRate: number };
export type PortfolioProjection = {
    monthlyGrowthRate: number;
    cashWeight: number;
    allocations: PortfolioAllocation[];
    excludedStockNames: string[];
    points: SimulationPoint[];
    reachMonths: number | null;
    reachDate: string | null;
    achievableWithinPeriod: boolean | null;
};
export type SimulationResult = {
    simulationId: number | null;
    pendingSimulationId: string | null;
    goalText: string;
    targetAmount: number;
    periodMonths: number | null;
    startAmount: number;
    holdingsAmount: number;
    cashAmount: number;
    monthlyContribution: number;
    current: PortfolioProjection;
    rebalanced: PortfolioProjection;
    shortenedMonths: number | null;
    rebalanceReason: string;
    timeReductionExplanation: string;
    createdAt: string;
};
export type SimulationSummary = {
    simulationId: number;
    goalText: string;
    targetAmount: number;
    periodMonths: number | null;
    currentReachDate: string | null;
    rebalancedReachDate: string | null;
    createdAt: string;
};
// includeCurrentPortfolio=false면 백엔드가 계좌를 보지 않고 시작 금액 0원에서 월 추가 납입액만으로 계산한다(startAmount·holdingsAmount·cashAmount 모두 0).
export const runSimulation = (goalText: string, monthlyContribution: number, includeCurrentPortfolio: boolean) => apiRequest<SimulationResult>("/api/simulations", { method: "POST", body: JSON.stringify({ goalText, monthlyContribution, includeCurrentPortfolio }) });
export const saveSimulation = (pendingSimulationId: string) => apiRequest<SimulationResult>("/api/simulations/saved", { method: "POST", body: JSON.stringify({ pendingSimulationId }) });
export const getSimulations = () => apiRequest<SimulationSummary[]>("/api/simulations");
export const getSimulation = (simulationId: number) => apiRequest<SimulationResult>(`/api/simulations/${simulationId}`);
export const deleteSimulation = (simulationId: number) => apiRequest<null>(`/api/simulations/${simulationId}`, { method: "DELETE" });

// AI 기능(시뮬레이터·재무설계) 전용 오류 안내.
// GEMINI_RATE_LIMIT_EXCEEDED(429)는 Gemini API 자체 할당량 초과가 재시도 후에도 계속될 때 온다.
const AI_RATE_LIMIT_CODE = "GEMINI_RATE_LIMIT_EXCEEDED";
const AI_RESPONSE_TIMEOUT_CODE = "AI_RESPONSE_TIMEOUT";

function isAiRateLimitError(error: unknown): error is ApiError {
    return error instanceof ApiError && (error.status === 429 || error.code === AI_RATE_LIMIT_CODE);
}

// 시뮬레이터(하루 3회)·재무설계(하루 5회)의 계정당 하루 사용 횟수 초과(DAILY_LIMIT_EXCEEDED). Gemini 자체 할당량 초과(GEMINI_RATE_LIMIT_EXCEEDED)와는
// 다른 코드로 오므로 "잠시 후 다시"가 아니라 "내일 다시"로 안내한다.
const DAILY_LIMIT_CODE = "DAILY_LIMIT_EXCEEDED";
const DAILY_LIMIT_MESSAGE = "오늘 사용 횟수를 모두 사용했습니다. 내일 다시 이용해 주세요.";

function isDailyLimitError(error: unknown) {
    return error instanceof ApiError && error.code === DAILY_LIMIT_CODE;
}

export function getSimulationErrorMessage(error: unknown, fallback: string) {
    if (isDailyLimitError(error)) return DAILY_LIMIT_MESSAGE;
    if (isAiRateLimitError(error)) return "AI 요청이 많아 잠시 후 다시 시도해 주세요.";
    return getApiErrorMessage(error, fallback);
}

export function getPlanningErrorMessage(error: unknown, fallback: string) {
    if (isDailyLimitError(error)) return DAILY_LIMIT_MESSAGE;
    if (isAiRateLimitError(error)) return "AI 요청이 많아 잠시 후 다시 시도해 주세요.";
    // 백엔드 45초 마감(AI_RESPONSE_TIMEOUT)과 앞단 프록시의 504를 같은 안내로 묶는다.
    if (error instanceof ApiError && (error.status === 504 || error.code === AI_RESPONSE_TIMEOUT_CODE)) {
        return "응답 생성에 실패했습니다. 다시 시도해 주세요.";
    }
    return getApiErrorMessage(error, fallback);
}
