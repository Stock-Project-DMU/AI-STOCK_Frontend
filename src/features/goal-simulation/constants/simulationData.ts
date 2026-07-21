import type { GoalType } from "../types";

export const GOAL_PRESETS: Record<
    GoalType,
    { label: string; monthlyPayment: number; years: number; annualReturn: number }
> = {
    retirement: {
        label: "노후 자금 마련",
        monthlyPayment: 500_000,
        years: 50,
        annualReturn: 5,
    },
    house: {
        label: "내 집 마련",
        monthlyPayment: 2_000_000,
        years: 10,
        annualReturn: 5,
    },
};

export const SAVED_SIMULATIONS = [
    { id: 1, title: "공격적인 내집마련 투자 시뮬레이션", age: "2시간 전" },
    { id: 2, title: "내집마련 투자 시뮬레이션", age: "3시간 전" },
    { id: 3, title: "노후대비 연금 시뮬레이션", age: "6시간 전" },
    { id: 4, title: "공격적인 노후대비 연금 시뮬레이션", age: "한국은행 · 5시간 전" },
] as const;
