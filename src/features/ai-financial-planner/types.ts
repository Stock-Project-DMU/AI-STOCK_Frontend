export type PlannerView = "chat" | "survey";

export type SurveyQuestion = {
    title: string;
    options: string[];
};

export type ChatMessage = {
    id: number;
    role: "assistant" | "user";
    text: string;
    portfolio?: boolean;
};
