"use client";

import { useMemo, useState } from "react";
import { NEWS_CATEGORIES, NEWS_REPORTS, FEATURED_REPORT } from "../data";
import type { NewsCategory } from "../types";
import FeaturedNews from "./FeaturedNews";
import NewsList from "./NewsList";
import NewsSidebar from "./NewsSidebar";

export default function NewsReportPage() {
    const [category, setCategory] = useState<NewsCategory>("전체");
    const filteredReports = useMemo(
        () => category === "전체" ? NEWS_REPORTS : NEWS_REPORTS.filter((report) => report.category === category),
        [category],
    );

    return (
        <main className="market-theme market-grid min-h-screen">
            <section className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[12px] font-black tracking-[0.16em] text-primary"><span className="h-px w-6 bg-primary" /> NEWS REPORT</div>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">뉴스 리포트</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-body">시장 흐름과 종목 영향을 빠르게 파악할 수 있도록 주요 이슈를 한곳에 정리했습니다.</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[12px] font-bold text-primary">화면 확인용 샘플 데이터</span>
                </header>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-5">
                        <FeaturedNews report={FEATURED_REPORT} />

                        <section>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div><h2 className="text-xl font-black text-ink">최신 리포트</h2><p className="mt-1 text-[12px] text-muted">선택한 주제의 시장 리포트를 확인하세요.</p></div>
                                <div className="flex flex-wrap gap-1.5 rounded-lg border border-hairline bg-white p-1.5">
                                    {NEWS_CATEGORIES.map((item) => (
                                        <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${category === item ? "bg-primary text-white" : "text-muted hover:bg-surface-soft hover:text-ink"}`}>{item}</button>
                                    ))}
                                </div>
                            </div>
                            <NewsList reports={filteredReports} />
                        </section>
                    </div>
                    <NewsSidebar />
                </div>
            </section>
        </main>
    );
}
