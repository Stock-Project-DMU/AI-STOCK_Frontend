import { RightSidebar, StockTable } from "@/features/home";

import MarketPulse from "@/features/home/components/MarketPulse";

export default function Home() {
    return (
        <div className="home-market-background market-theme min-h-screen">
            <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="cq-home-hero mb-5 grid items-center gap-4">
                    <div>
                        <h1 className="text-balance text-xl font-bold tracking-tight text-ink sm:text-2xl">오늘의 시장을 한 화면에서 읽으세요</h1>
                    </div>
                    <MarketPulse />
                </div>

                <div className="cq-home-main grid min-w-0 gap-4">
                    <StockTable />
                    <RightSidebar />
                </div>
                <p className="mt-3 text-right text-[12px] text-muted">시장 데이터는 연결된 제공자의 응답 기준입니다. 미제공 정보는 임의로 표시하지 않습니다.</p>
            </section>
        </div>
    );
}
