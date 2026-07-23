import Link from "next/link";

const news = [
    ["시장 주요 이슈와 종목 영향 분석", "12분 전"],
    ["미국 기술주 흐름 한눈에 보기", "28분 전"],
    ["오늘의 투자 체크포인트", "41분 전"],
] as const;

export default function RightSidebar() {
    return (
        <aside className="flex flex-col gap-4">
            <section className="always-dark rounded-2xl border border-teal-400/20 bg-[linear-gradient(145deg,#123936,#0b1818_68%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
                <div className="flex items-center justify-between">
                    <div><p className="text-[10px] font-bold tracking-[0.15em] text-teal-200">AI ADVISOR</p><h2 className="mt-1 font-black text-white">재무 진단 브리핑</h2></div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white">◇</span>
                </div>
                <div className="mt-5 rounded-xl border border-white/10 bg-black/15 p-4 text-xs leading-6 text-slate-300">
                    보유 자산과 투자 성향을 연결해 리밸런싱 시나리오를 확인할 수 있습니다.
                </div>
                <Link href="/ai-financial-planner" className="mt-4 flex items-center justify-between rounded-xl bg-teal-600 px-4 py-3 text-xs font-bold text-white hover:bg-teal-500">
                    AI 분석 시작하기 <span>→</span>
                </Link>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0b1726] p-5">
                <div className="flex items-center justify-between"><h2 className="font-black text-white">전략 신호</h2><span className="text-[10px] font-bold text-emerald-400">BALANCED</span></div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[['시장', '중립'], ['변동성', '보통'], ['AI 신뢰도', '82%']].map(([label, value]) => <div key={label} className="rounded-xl bg-[#07111e] px-2 py-3"><p className="text-[10px] text-slate-600">{label}</p><strong className="mt-1 block text-xs text-slate-200">{value}</strong></div>)}
                </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#0b1726] p-5">
                <div className="flex items-center justify-between"><h2 className="font-black text-white">뉴스 리포트</h2><Link href="/ai-market-briefing" className="theme-accent-text text-[10px] font-bold">전체 보기</Link></div>
                <div className="mt-3 divide-y divide-white/10">
                    {news.map(([title, age], index) => (
                        <article key={title} className="grid grid-cols-[minmax(0,1fr)_70px] gap-3 py-3">
                            <div><span className="theme-accent-text text-[9px] font-black">0{index + 1}</span><h3 className="mt-1 text-xs font-bold leading-5 text-slate-200">{title}</h3><p className="mt-1 text-[10px] text-slate-600">{age}</p></div>
                            <img src="/new1.png" alt="" className="h-14 w-[70px] rounded-lg object-cover opacity-75" width={70} height={56} />
                        </article>
                    ))}
                </div>
            </section>
        </aside>
    );
}
