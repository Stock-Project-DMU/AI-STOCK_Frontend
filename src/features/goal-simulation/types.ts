export type GoalType = "retirement" | "house";

export type SimulationSettings = {
    goal: GoalType | null;
    monthlyPayment: number;
    years: number;
    annualReturn: number;
    aggressive: boolean;
};
