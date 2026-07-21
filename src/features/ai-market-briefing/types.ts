export type BriefingKind = "summary" | "semiconductor";

export type BriefingMessage = {
    id: number;
    role: "assistant" | "user";
    text: string;
    kind?: BriefingKind;
};

export type MarketNews = {
    rank: number;
    title: string;
    source: string;
    age: string;
};
