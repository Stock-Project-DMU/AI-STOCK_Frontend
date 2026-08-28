import { ArrowRightIcon, NewsIcon } from "@/components/icons/Icon";
import Link from "next/link";
import type { NewsReport } from "../types";

const TONE_CLASS = {
    blue: "bg-blue-500/10 text-blue-600",
    red: "bg-red-500/10 text-red-600",
    green: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-700",
} as const;

export default function NewsList({ reports }: { reports: NewsReport[] }) {
    if (reports.length === 0) {
        return <div className="rounded-xl border border-dashed border-hairline bg-white py-20 text-center text-sm text-muted">해당 카테고리의 리포트가 없습니다.</div>;
    }

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {reports.map((report) => (
                <Link key={report.id} href={`/news-report/${report.id}`} className="group flex min-h-64 flex-col rounded-xl border border-hairline bg-white p-5 shadow-[0_4px_12px_rgba(10,11,13,0.03)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_10px_26px_rgba(10,11,13,0.08)]">
                    <div className="flex items-center justify-between">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${TONE_CLASS[report.tone]}`}><NewsIcon className="h-4 w-4" /></span>
                        <span className="text-[12px] font-bold text-muted">{report.category}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-black leading-7 text-ink group-hover:text-primary">{report.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-body">{report.summary}</p>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-hairline-soft pt-5 text-[12px] text-muted">
                        <span>{report.source}<br />{report.publishedAt} · {report.readTime}</span>
                        <ArrowRightIcon className="h-4 w-4 text-primary" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
