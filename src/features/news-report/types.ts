export type NewsCategory = "전체" | "국내증시" | "해외증시" | "산업·기업" | "경제";

export type NewsReport = {
    id: number;
    category: Exclude<NewsCategory, "전체">;
    title: string;
    summary: string;
    source: string;
    publishedAt: string;
    readTime: string;
    tone: "blue" | "red" | "green" | "amber";
};

export type NewsArticleSection = {
    heading: string;
    paragraphs: string[];
};

export type NewsArticle = {
    reportId: number;
    keyPoints: string[];
    sections: NewsArticleSection[];
};
