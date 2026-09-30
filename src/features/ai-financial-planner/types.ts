export type PlannerView = "chat" | "survey";

export type SurveyQuestion = {
    title: string;
    options: string[];
    multiple?: boolean;
};

export type ChatMessage = {
    id: number;
    role: "assistant" | "user";
    text: string;
    portfolio?: boolean;
};
