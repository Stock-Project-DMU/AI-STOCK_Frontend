import { RightSidebar, StockTable } from "@/features/home";

const marketPulse = [
    ["KOSPI", "2,742.18", "+0.82%", "text-red-400"],
    ["KOSDAQ", "892.44", "-0.31%", "text-blue-400"],
    ["USD/KRW", "1,384.20", "+0.16%", "text-red-400"],
] as const;

export default function Home() {
    return (
        <div className="market-theme market-grid min-h-screen text-slate-100">
            <section className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
                <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_500px]">
                    <div>
                        <span className="theme-accent-border theme-accent-soft theme-accent-text inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.14em]">
                            MARKET OVERVIEW · DEMO
                        </span>
                        <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">오늘의 시장을 한 화면에서 읽으세요</h1>
                        <p className="mt-2 text-sm text-slate-400">관심 종목, AI 분석, 포트폴리오 신호를 연결한 투자 대시보드입니다.</p>
                    </div>
                    <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1726]/90 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
                        {marketPulse.map(([name, value, change, tone]) => (
                            <div key={name} className="border-r border-white/10 px-4 py-4 last:border-0">
                                <p className="text-[10px] font-bold tracking-wider text-slate-500">{name}</p>
                                <strong className="mt-2 block text-base text-white">{value}</strong>
                                <span className={`mt-1 block text-xs font-bold ${tone}`}>{change}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
                    <StockTable />
                    <RightSidebar />
                </div>
                <p className="mt-4 text-right text-[10px] text-slate-600">화면에 표시된 수치는 UI 확인을 위한 샘플 데이터입니다.</p>
            </section>
        </div>
    );
}
