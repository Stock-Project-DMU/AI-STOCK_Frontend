import type { MarketNews } from "../types";

export const MARKET_NEWS: MarketNews[] = [
    { rank: 1, title: "미 연준, 기준금리 동결 결정… 하반기 인하 시사", source: "Reuters", age: "1시간 전" },
    { rank: 2, title: "삼성전자, AI 반도체 투자 10조 확대 발표", source: "매일경제", age: "2시간 전" },
    { rank: 3, title: "코스피 6,900선 돌파… 역대 최고치 경신", source: "한국경제", age: "3시간 전" },
    { rank: 4, title: "중국 경기 부양책 기대감 확산, 아시아 증시 동반 상승", source: "Bloomberg", age: "4시간 전" },
    { rank: 5, title: "한국은행 '물가 안정세 지속' 전망 발표", source: "한국은행", age: "5시간 전" },
];

export const MARKET_INDEXES = [
    ["코스피", "6,936.99", "+338.12 (5.12%)", "text-up"],
    ["코스닥", "1,213.74", "+12.40 (1.03%)", "text-up"],
    ["S&P 500", "7,259.1", "+58.35 (0.81%)", "text-up"],
    ["나스닥", "28,144.75", "+368.75 (1.32%)", "text-up"],
    ["USD/KRW", "1,342.50", "-8.20 (0.61%)", "text-down"],
] as const;

export const LIVE_TRENDS = [
    ["AI 반도체 투자 확대", "HOT"],
    ["미 연준 금리 동결", "NEW"],
    ["코스피 신고가 경신", "↑"],
    ["중국 경기 부양책", ""],
    ["원달러 환율 하락", ""],
] as const;
