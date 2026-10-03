import { apiRequest } from "./client";
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
    briefings: { briefingDate: string; outletName: string }[];
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
export const runSimulation = (goalText: string, monthlyContribution: number) => apiRequest<SimulationResult>("/api/simulations", { method: "POST", body: JSON.stringify({ goalText, monthlyContribution }) });
export const saveSimulation = (pendingSimulationId: string) => apiRequest<SimulationResult>("/api/simulations/saved", { method: "POST", body: JSON.stringify({ pendingSimulationId }) });
export const getSimulations = () => apiRequest<SimulationSummary[]>("/api/simulations");
export const getSimulation = (simulationId: number) => apiRequest<SimulationResult>(`/api/simulations/${simulationId}`);
export const deleteSimulation = (simulationId: number) => apiRequest<null>(`/api/simulations/${simulationId}`, { method: "DELETE" });
