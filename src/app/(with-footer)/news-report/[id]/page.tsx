import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticlePage from "@/features/news-report/components/NewsArticlePage";
import { ALL_NEWS_REPORTS, getNewsArticle, getNewsReport } from "@/features/news-report/data";

type NewsArticleRouteProps = {
    params: Promise<{ id: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
    return ALL_NEWS_REPORTS.map((report) => ({ id: String(report.id) }));
}

export async function generateMetadata({ params }: NewsArticleRouteProps): Promise<Metadata> {
    const { id } = await params;
    const report = getNewsReport(Number(id));

    return report
        ? { title: `${report.title} | AI STOCK`, description: report.summary }
        : { title: "뉴스 리포트 | AI STOCK" };
}

export default async function NewsArticleRoute({ params }: NewsArticleRouteProps) {
    const { id } = await params;
    const reportId = Number(id);
    const report = getNewsReport(reportId);
    const article = getNewsArticle(reportId);

    if (!report || !article) notFound();

    const relatedReports = ALL_NEWS_REPORTS
        .filter((candidate) => candidate.id !== report.id)
        .sort((a, b) => Number(b.category === report.category) - Number(a.category === report.category))
        .slice(0, 3);

    return <NewsArticlePage report={report} article={article} relatedReports={relatedReports} />;
}
