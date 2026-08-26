import Link from "next/link";
import { SparkleIcon, ArrowRightIcon } from "@/components/icons/Icon";

const news = [
    ["시장 주요 이슈와 종목 영향 분석", "12분 전"],
    ["미국 기술주 흐름 한눈에 보기", "28분 전"],
    ["오늘의 투자 체크포인트", "41분 전"],
] as const;

export default function RightSidebar() {
    return (
        <aside className="flex flex-col gap-3">
            <section className="always-dark rounded-lg border border-primary/25 bg-[linear-gradient(145deg,#16295c,#0a0b0d_68%)] p-4 shadow-[0_4px_16px_rgba(0,0,0,.22)]">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">재무 진단 브리핑</h2>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white"><SparkleIcon className="h-4 w-4" /></span>
                </div>
                <div className="mt-4 rounded-md border border-white/10 bg-black/15 p-3 text-xs leading-6 text-white/70">
                    보유 자산과 투자 성향을 연결해 리밸런싱 시나리오를 확인할 수 있습니다.
                </div>
                <Link href="/ai-financial-planner" className="mt-3 flex items-center justify-between rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-active">
                    AI 분석 시작하기 <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
            </section>

            <section className="rounded-lg border border-hairline bg-white p-4">
                <h2 className="text-sm font-bold text-ink">전략 신호</h2>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[['시장', '중립'], ['변동성', '보통'], ['AI 신뢰도', '82%']].map(([label, value]) => <div key={label} className="rounded-md bg-surface-soft px-2 py-2.5"><p className="text-[12px] text-muted">{label}</p><strong className="num mt-1 block text-xs text-ink">{value}</strong></div>)}
                </div>
            </section>

            <section className="rounded-lg border border-hairline bg-white p-4">
                <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-ink">뉴스 리포트</h2><Link href="/ai-market-briefing" className="theme-accent-text text-[12px] font-bold">전체 보기</Link></div>
                <div className="mt-2 divide-y divide-hairline-soft">
                    {news.map(([title, age], index) => (
                        <article key={title} className="grid grid-cols-[minmax(0,1fr)_72px] gap-3 py-2.5">
                            <div><span className="theme-accent-text text-[12px] font-bold">0{index + 1}</span><h3 className="mt-1 text-xs font-bold leading-5 text-ink">{title}</h3><p className="mt-1 text-[12px] text-muted">{age}</p></div>
                            <img src="/new1.png" alt="" className="h-14 w-[72px] rounded-md object-cover" width={72} height={56} />
                        </article>
                    ))}
                </div>
            </section>
        </aside>
    );
}
