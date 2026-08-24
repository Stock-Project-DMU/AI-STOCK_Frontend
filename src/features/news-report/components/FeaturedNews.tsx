import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/Icon";
import type { NewsReport } from "../types";

export default function FeaturedNews({ report }: { report: NewsReport }) {
    return (
        <Link href={`/news-report/${report.id}`} className="group grid overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_4px_12px_rgba(10,11,13,0.04)] hover:border-primary/25 hover:shadow-[0_10px_26px_rgba(10,11,13,0.08)] lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col p-5 sm:p-7">
                <div className="flex items-center gap-2 text-[12px] font-bold">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">주요 리포트</span>
                    <span className="text-muted">{report.category}</span>
                </div>
                <h2 className="mt-5 max-w-2xl text-2xl font-black leading-tight text-ink sm:text-3xl">{report.title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-body">{report.summary}</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8 text-[12px] text-muted">
                    <span>{report.source} · {report.publishedAt} · 읽는 시간 {report.readTime}</span>
                    <span className="inline-flex items-center gap-2 font-bold text-primary">리포트 요약 보기 <ArrowRightIcon className="h-3.5 w-3.5" /></span>
                </div>
            </div>
            <div className="relative min-h-64 overflow-hidden bg-surface-strong lg:min-h-full">
                <Image src="/new1.png" alt="정책 관련 시장 뉴스" fill priority sizes="(min-width: 1024px) 360px, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-12 text-[12px] font-medium text-white/90">샘플 뉴스 이미지</span>
            </div>
        </Link>
    );
}
