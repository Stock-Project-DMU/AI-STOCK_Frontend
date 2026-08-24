import { RightSidebar, StockTable } from "@/features/home";

const marketPulse = [
    ["KOSPI", "2,742.18", "+0.82%", "text-up"],
    ["KOSDAQ", "892.44", "-0.31%", "text-down"],
    ["USD/KRW", "1,384.20", "+0.16%", "text-up"],
] as const;

export default function Home() {
    return (
        <div className="home-market-background market-theme min-h-screen">
            <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative mb-7 py-5 sm:py-7">
                    <div className="relative grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_620px] xl:gap-12">
                        <div className="flex flex-col justify-center xl:min-h-48">
                            <h1 className="max-w-2xl text-2xl font-black leading-tight tracking-[-0.035em] text-ink sm:text-3xl lg:text-[2.25rem]">
                                시장 흐름과 주요 종목을
                                <span className="block text-primary">빠르게 비교해보세요</span>
                            </h1>
                        </div>

                        <div className="grid divide-y divide-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            {marketPulse.map(([name, value, change, tone]) => {
                                const rising = change.startsWith("+");
                                return (
                                    <article
                                        key={name}
                                        className="group flex min-h-32 flex-col justify-between px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[12px] font-black tracking-[0.1em] text-muted">{name}</p>
                                            <span className={`h-2 w-2 rounded-full ${rising ? "bg-up" : "bg-down"}`} />
                                        </div>
                                        <div>
                                            <strong className="num block whitespace-nowrap text-lg font-black tracking-tight text-ink">{value}</strong>
                                            <span className={`num mt-2 inline-flex rounded-full px-2.5 py-1 text-[12px] font-black ${tone} ${rising ? "bg-red-500/8" : "bg-blue-500/8"}`}>
                                                {change}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
                    <StockTable />
                    <RightSidebar />
                </div>
                <p className="mt-3 text-right text-[12px] text-muted">화면에 표시된 수치는 UI 확인을 위한 샘플 데이터입니다.</p>
            </section>
        </div>
    );
}
