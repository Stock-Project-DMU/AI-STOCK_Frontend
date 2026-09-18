"use client";
import { useEffect, useState } from "react";
import { getMarketNews, type MarketNews } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
const categories = ["코스피", "코스닥", "반도체", "금리", "환율", "미국 증시"];
export default function NewsReportPage() {
    const [query, setQuery] = useState("코스피");
    const [search, setSearch] = useState("코스피");
    const [news, setNews] = useState<MarketNews[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            setLoading(true); setError("");
            try { const result = await getMarketNews(query, controller.signal); if (!controller.signal.aborted) setNews(result.results); }
            catch (error) { if (!controller.signal.aborted) { setNews([]); setError(getApiErrorMessage(error, "뉴스를 불러오지 못했습니다.")); } }
            finally { if (!controller.signal.aborted) setLoading(false); }
        }
        void load(); return () => controller.abort();
    }, [query]);
    return <main className="market-theme market-grid min-h-screen p-5 lg:p-8"><section className="mx-auto max-w-[1200px]">
        <p className="text-xs font-bold tracking-widest text-primary">NEWS REPORT</p><h1 className="mt-3 text-3xl font-bold">뉴스 리포트</h1><p className="mt-3 text-sm text-muted">종목과 시장 키워드로 검색하고 언론사 원문에서 내용을 확인하세요.</p>
        <form onSubmit={event => { event.preventDefault(); if (search.trim()) setQuery(search.trim()); }} className="my-5 flex gap-2"><input aria-label="뉴스 검색어" value={search} maxLength={100} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 rounded border border-hairline bg-canvas p-3" /><button className="rounded bg-primary px-5 text-white">검색</button></form>
        <div className="mb-5 flex flex-wrap gap-2">{categories.map(category => <button key={category} onClick={() => { setSearch(category); setQuery(category); }} className={`rounded border px-3 py-2 text-sm ${query === category ? "bg-primary text-white" : "bg-canvas"}`}>{category}</button>)}</div>
        {loading && <p role="status">뉴스를 불러오는 중...</p>}{error && <p role="alert" className="text-red-500">{error}</p>}
        {!loading && !error && !news.length && <p>검색 결과가 없습니다.</p>}
        <div className="space-y-4">{news.map((item, index) => /^https?:\/\//.test(item.link) && <article key={item.link + index} className="rounded-lg border border-hairline bg-canvas p-5"><a href={item.link} target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:text-primary">{item.title}</a><p className="mt-3 text-sm leading-6 text-body">{item.description}</p><p className="mt-3 text-xs text-muted">{item.outlet} · {item.pubDate}</p></article>)}</div>
    </section></main>;
}
