import { SparkleIcon } from "@/components/icons/Icon";

export default function FinancialSummary() {
    return (
        <aside className="hidden w-[300px] shrink-0 border-l border-hairline bg-canvas p-4 xl:block">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="h-5 w-5 rounded-sm border-2 border-primary" />
                나의 자산 대시보드
            </h2>

            <div className="always-dark relative mt-4 overflow-hidden rounded-lg p-5">
                <span className="absolute -top-7 -right-7 h-24 w-24 rounded-full bg-primary/15" />
                <p className="text-xs text-white/60">총 자산 합계</p>
                <strong className="mt-2 block text-2xl">₩128,450,000</strong>
                <div className="mt-6 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-white/60">전월 대비 수익</p>
                        <p className="mt-1 font-bold text-up">₩2,340,000</p>
                    </div>
                    <span className="rounded-sm px-2 py-1 text-xs font-bold text-up">+1.8%</span>
                </div>
            </div>

            <div className="mt-4 border-t-2 border-primary px-4 py-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-primary"><SparkleIcon className="h-3.5 w-3.5" /> AI 투자 제안</h3>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-body">
                    <li className="flex gap-2"><span className="mt-2 h-1 w-5 shrink-0 bg-primary" />기술주 비중 축소 및 ETF 비중 15% 확대 제안</li>
                    <li className="flex gap-2"><span className="mt-2 h-1 w-5 shrink-0 bg-primary" />금리 인하 전망에 따른 장기 채권형 상품 매수 타이밍 포착</li>
                </ul>
                <button className="mt-4 w-full rounded-md border border-hairline py-2.5 text-xs font-bold text-ink hover:bg-surface-soft">상세 리포트 보기</button>
            </div>

            <div className="mt-1 rounded-md border border-hairline p-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">재무 건강도</span>
                    <strong className="text-2xl text-emerald-500">95<span className="ml-1 text-xs">%</span></strong>
                </div>
                <span className="rounded-sm bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-600">우수</span>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong"><div className="h-full w-[95%] rounded-full bg-emerald-400" /></div>
            </div>
        </aside>
    );
}
