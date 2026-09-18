"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMarketNews, type MarketNews } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
export default function RightSidebar() {
    const [news, setNews] = useState<MarketNews[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { let active = true; getMarketNews("코스피").then(result => { if (active) setNews(result.results.slice(0, 5)); }).catch(error => { if (active) setError(getApiErrorMessage(error, "뉴스를 불러오지 못했습니다.")); }); return () => { active = false; }; }, []);
    return <aside className="flex flex-col gap-3 xl:sticky xl:top-20 xl:self-start">
        <section className="always-dark rounded-lg p-5"><h2 className="font-bold">재무 진단 브리핑</h2><p className="mt-3 text-xs leading-6">보유 자산과 투자 성향을 연결해 상담할 수 있습니다.</p><Link href="/ai-financial-planner" className="mt-4 block rounded bg-primary p-3 text-center text-sm font-bold text-white">AI 분석 시작하기</Link></section>
        <section className="rounded-lg border border-hairline bg-canvas p-4"><div className="flex justify-between"><h2 className="font-bold">뉴스 리포트</h2><Link href="/news-report" className="text-xs text-primary">전체 보기</Link></div>{error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}{news.map((item, index) => /^https?:\/\//.test(item.link) && <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="mt-3 block border-t border-hairline pt-3 text-sm"><strong>{item.title}</strong><p className="mt-2 text-xs text-muted">{item.outlet}</p></a>)}</section>
    </aside>;
}
