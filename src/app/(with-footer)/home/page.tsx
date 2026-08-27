import { RightSidebar, StockTable } from "@/features/home";

const marketPulse = [
    ["KOSPI", "2,742.18", "+0.82%", "text-up"],
    ["KOSDAQ", "892.44", "-0.31%", "text-down"],
    ["USD/KRW", "1,384.20", "+0.16%", "text-up"],
] as const;

export default function Home() {
    return (
        <div className="market-theme market-grid min-h-screen">
            <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 grid items-center gap-4 xl:grid-cols-[minmax(0,1fr)_500px]">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">오늘의 시장을 한 화면에서 읽으세요</h1>
                    </div>
                    <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-hairline bg-white shadow-[0_4px_12px_rgba(10,11,13,0.04)]">
                        {marketPulse.map(([name, value, change, tone]) => (
                            <div key={name} className="border-r border-hairline px-3 py-3 last:border-0">
                                <p className="text-[12px] font-bold tracking-wider text-muted">{name}</p>
                                <strong className="num mt-1.5 block text-lg text-ink">{value}</strong>
                                <span className={`num mt-0.5 block text-xs font-bold ${tone}`}>{change}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
                    <StockTable />
                    <RightSidebar />
                </div>
                <p className="mt-3 text-right text-[12px] text-muted">화면에 표시된 수치는 UI 확인을 위한 샘플 데이터입니다.</p>
            </section>
        </div>
    );
}
