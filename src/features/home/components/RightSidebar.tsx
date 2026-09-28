"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMarketNews, type MarketNews } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
import { ArrowRightIcon, SparkleIcon } from "@/components/icons/Icon";
export default function RightSidebar() {
    const [news, setNews] = useState<MarketNews[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { let active = true; getMarketNews("코스피").then(result => { if (active) setNews(result.results.slice(0, 5)); }).catch(error => { if (active) setError(getApiErrorMessage(error, "뉴스를 불러오지 못했습니다.")); }); return () => { active = false; }; }, []);
    return <aside className="cq-wide-sticky top-20 flex flex-col gap-3 self-start">
        <section className="always-dark rounded-lg border border-primary/25 bg-[linear-gradient(145deg,#16295c,#0a0b0d_68%)] p-4 shadow-[0_4px_16px_rgba(0,0,0,.22)]">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">재무 진단 브리핑</h2><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white"><SparkleIcon className="h-4 w-4" /></span></div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/15 p-3 text-xs leading-6 text-white/70">보유 자산과 투자 성향을 연결해 상담할 수 있습니다.</div>
            <Link href="/ai-financial-planner" className="mt-3 flex items-center justify-between rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-active">AI 분석 시작하기 <ArrowRightIcon className="h-3.5 w-3.5" /></Link>
        </section>
        <section className="rounded-lg border border-hairline bg-white p-4">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-ink">뉴스 리포트</h2><Link href="/news-report" className="theme-accent-text text-[12px] font-bold">전체 보기</Link></div>
            {error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}
            {!error && !news.length && <p className="mt-3 text-xs text-muted">표시할 뉴스가 없습니다.</p>}
            <div className="mt-2 divide-y divide-hairline-soft">{news.map((item, index) => /^https?:\/\//.test(item.link) && <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="group relative block rounded-md py-3 pl-3 pr-1 transition-colors hover:bg-primary/[0.045]"><span className="text-[12px] font-black text-primary">0{index + 1}</span><h3 className="mt-1 text-xs font-bold leading-5 text-ink group-hover:text-primary">{item.title}</h3><p className="mt-1 text-[12px] text-muted">{item.outlet}</p></a>)}</div>
        </section>
    </aside>;
}
