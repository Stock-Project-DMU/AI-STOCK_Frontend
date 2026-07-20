export default function FinancialSummary() {
    return (
        <aside className="hidden w-[322px] shrink-0 border-l border-gray-300 bg-white p-5 xl:block">
            <h2 className="flex items-center gap-2 text-sm font-bold">
                <span className="h-5 w-5 rounded-sm border-2 border-red-400" />
                나의 자산 대시보드
            </h2>

            <div className="relative mt-5 overflow-hidden rounded-2xl bg-[#1c1c1c] p-5 text-white">
                <span className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-red-500/15" />
                <p className="text-xs text-gray-500">총 자산 합계</p>
                <strong className="mt-2 block text-2xl">₩128,450,000</strong>
                <div className="mt-7 flex items-end justify-between">
                    <div><p className="text-xs text-gray-500">전월 대비 수익</p><p className="mt-1 font-bold text-red-500">₩2,340,000</p></div>
                    <span className="rounded bg-red-500/15 px-2 py-1 text-xs font-bold text-red-400">+1.8%</span>
                </div>
            </div>

            <div className="mt-4 border-t-2 border-red-500 px-4 py-4">
                <h3 className="text-sm font-bold text-red-500">◯ AI 투자 제안</h3>
                <ul className="mt-4 space-y-3 text-xs leading-5 text-gray-600">
                    <li className="flex gap-2"><span className="mt-2 h-1 w-5 shrink-0 bg-red-500" />기술주 비중 축소 및 ETF 비중 15% 확대 제안</li>
                    <li className="flex gap-2"><span className="mt-2 h-1 w-5 shrink-0 bg-red-500" />금리 인하 전망에 따른 장기 채권형 상품 매수 타이밍 포착</li>
                </ul>
                <button className="mt-5 w-full rounded-lg border border-gray-200 py-3 text-xs font-bold hover:bg-gray-50">상세 리포트 보기</button>
            </div>

            <div className="mt-1 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between"><span className="text-xs font-bold">재무 건강도</span><strong className="text-2xl text-emerald-500">95<span className="ml-1 text-xs">%</span></strong></div>
                <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-600">GREAT</span>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full w-[95%] rounded-full bg-emerald-400" /></div>
            </div>
        </aside>
    );
}
