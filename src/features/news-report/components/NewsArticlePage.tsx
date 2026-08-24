import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronLeftIcon, NewsIcon } from "@/components/icons/Icon";
import type { NewsArticle, NewsReport } from "../types";

type NewsArticlePageProps = {
    article: NewsArticle;
    report: NewsReport;
    relatedReports: NewsReport[];
};

export default function NewsArticlePage({ article, report, relatedReports }: NewsArticlePageProps) {
    return (
        <main className="market-theme market-grid min-h-screen">
            <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
                <nav aria-label="뉴스 리포트 경로" className="mb-6">
                    <Link href="/news-report" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-primary">
                        <ChevronLeftIcon className="h-4 w-4" /> 뉴스 리포트
                    </Link>
                </nav>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <article className="min-w-0 overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_8px_28px_rgba(10,11,13,0.05)]">
                        <header className="px-5 pb-7 pt-6 sm:px-9 sm:pb-9 sm:pt-8 lg:px-12">
                            <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold">
                                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">{report.category}</span>
                                <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-primary">화면 확인용 샘플 기사</span>
                            </div>
                            <h1 className="mt-6 max-w-4xl text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl lg:text-[44px]">{report.title}</h1>
                            <p className="mt-5 max-w-3xl text-base leading-8 text-body sm:text-lg">{report.summary}</p>
                            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hairline-soft pt-5 text-sm text-muted">
                                <strong className="text-ink">{report.source}</strong>
                                <span aria-hidden="true">·</span>
                                <span>{report.publishedAt}</span>
                                <span aria-hidden="true">·</span>
                                <span>읽는 시간 {report.readTime}</span>
                            </div>
                        </header>

                        {report.id === 1 ? (
                            <figure className="relative aspect-[16/8] w-full overflow-hidden bg-surface-strong">
                                <Image src="/new1.png" alt="정책 관련 시장 뉴스" fill priority sizes="(min-width: 1280px) 900px, 100vw" className="object-cover" />
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-16 text-[12px] text-white/90 sm:px-9">화면 구성을 위한 샘플 뉴스 이미지입니다.</figcaption>
                            </figure>
                        ) : (
                            <div className="relative mx-5 overflow-hidden rounded-xl bg-[#071b45] px-6 py-12 text-white sm:mx-9 sm:px-10 sm:py-16 lg:mx-12">
                                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-primary/45 blur-3xl" />
                                <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
                                <div className="relative">
                                    <div className="text-[12px] font-black tracking-[0.2em] text-blue-200">AI STOCK MARKET REPORT</div>
                                    <p className="mt-5 max-w-xl text-2xl font-black leading-snug sm:text-3xl">데이터 흐름에서 오늘의 시장 변화를 읽습니다.</p>
                                    <p className="mt-4 text-sm text-white/65">{report.category} · SAMPLE REPORT</p>
                                </div>
                            </div>
                        )}

                        <div className="px-5 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
                            <section aria-labelledby="article-summary" className="rounded-xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white"><NewsIcon className="h-4 w-4" /></span>
                                    <h2 id="article-summary" className="text-lg font-black text-ink">핵심 요약</h2>
                                </div>
                                <ul className="mt-5 space-y-3">
                                    {article.keyPoints.map((point) => (
                                        <li key={point} className="flex gap-3 text-sm leading-6 text-body sm:text-base">
                                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <div className="mt-10 space-y-10">
                                {article.sections.map((section) => (
                                    <section key={section.heading}>
                                        <h2 className="text-2xl font-black tracking-tight text-ink">{section.heading}</h2>
                                        <div className="mt-4 space-y-4">
                                            {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-body sm:text-[17px] sm:leading-9">{paragraph}</p>)}
                                        </div>
                                    </section>
                                ))}
                            </div>

                            <div className="mt-12 rounded-xl border border-hairline bg-surface-soft p-5 text-sm leading-6 text-muted">
                                본 콘텐츠는 서비스 화면 확인을 위해 작성된 샘플이며, 투자 제안이나 특정 종목의 매수·매도 권유가 아닙니다.
                            </div>
                        </div>
                    </article>

                    <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                        <section className="rounded-xl border border-hairline bg-white p-5">
                            <div className="text-[12px] font-black tracking-[0.14em] text-primary">REPORT INFO</div>
                            <dl className="mt-4 divide-y divide-hairline-soft text-sm">
                                <div className="flex justify-between gap-4 py-3"><dt className="text-muted">분류</dt><dd className="font-bold text-ink">{report.category}</dd></div>
                                <div className="flex justify-between gap-4 py-3"><dt className="text-muted">작성</dt><dd className="font-bold text-ink">{report.source}</dd></div>
                                <div className="flex justify-between gap-4 py-3"><dt className="text-muted">읽는 시간</dt><dd className="font-bold text-ink">{report.readTime}</dd></div>
                            </dl>
                        </section>

                        <section className="rounded-xl border border-hairline bg-white p-5">
                            <h2 className="text-base font-black text-ink">관련 리포트</h2>
                            <div className="mt-3 divide-y divide-hairline-soft">
                                {relatedReports.map((related) => (
                                    <Link key={related.id} href={`/news-report/${related.id}`} className="group block py-4 first:pt-2 last:pb-1">
                                        <span className="text-[12px] font-bold text-primary">{related.category}</span>
                                        <span className="mt-1.5 flex items-start justify-between gap-3 text-sm font-bold leading-6 text-ink group-hover:text-primary">
                                            {related.title}<ArrowRightIcon className="mt-1 h-4 w-4 shrink-0" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <Link href="/news-report" className="flex items-center justify-center gap-2 rounded-xl border border-hairline bg-white px-4 py-3 text-sm font-bold text-body hover:border-primary/25 hover:text-primary">
                            전체 리포트 보기 <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}
