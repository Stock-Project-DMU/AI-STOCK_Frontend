import { EXECUTIONS, QUOTES } from "../constants/stockData";

const candles = [
    42, 58, 70, 85, 98, 111, 88, 73, 59, 45, 38, 34, 31, 29, 28, 27, 26,
    25, 24, 23, 24, 25, 24, 23, 22, 24, 27, 25, 24, 26, 28, 29,
];

export default function StockChart() {
    const line = candles.map((value, index) => `${20 + index * 25},${150 - value}`).join(" ");

    return (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
            <div className="min-w-0 space-y-4">
                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-2"><button className="rounded bg-black px-3 py-1 text-white">일</button><button className="rounded bg-gray-100 px-3 py-1">주</button><button className="rounded bg-gray-100 px-3 py-1">월</button></div>
                        <span className="text-gray-400">시간　고가 저가 종가</span>
                    </div>
                    <svg viewBox="0 0 820 230" className="mt-3 h-[230px] w-full min-w-[600px]" role="img" aria-label="삼성전자 일봉 차트">
                        {[35, 75, 115, 155].map((y) => <line key={y} x1="10" y1={y} x2="810" y2={y} stroke="#eeeeee" />)}
                        {candles.map((value, index) => {
                            const x = 20 + index * 25;
                            const y = 150 - value;
                            const rising = index < 6 || index % 4 === 0;
                            return <g key={index}><line x1={x} y1={y - 8} x2={x} y2={y + 18} stroke={rising ? "#ef4444" : "#2563eb"} /><rect x={x - 5} y={y} width="10" height="14" fill={rising ? "#ef4444" : "#2563eb"} /></g>;
                        })}
                        <polyline points={line} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.55" />
                        <path d="M 280 95 C 390 105, 500 145, 810 147" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />
                        {candles.map((value, index) => <rect key={`v-${index}`} x={15 + index * 25} y={205 - Math.max(6, value / 3)} width="10" height={Math.max(6, value / 3)} fill={index % 3 === 0 ? "#ef444477" : "#2563eb55"} />)}
                    </svg>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between"><h2 className="font-bold">시세</h2><span className="text-xs font-bold text-red-500">실시간　<span className="text-gray-400">일별</span></span></div>
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[650px] text-xs">
                            <thead><tr className="border-b text-gray-400"><th className="py-2 text-left font-normal">체결가</th><th className="text-right font-normal">체결량(주)</th><th className="text-right font-normal">등락률</th><th className="text-right font-normal">거래량(주)</th><th className="text-right font-normal">시간</th></tr></thead>
                            <tbody>{EXECUTIONS.map((row, index) => <tr key={index} className="border-b border-gray-100"><td className="py-2">{row[0]}</td><td className="text-right text-red-500">{row[1]}</td><td className="text-right text-red-500">{row[2]}</td><td className="text-right">{row[3]}</td><td className="text-right text-gray-400">{row[4]}</td></tr>)}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            <aside className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex justify-between"><strong>호가</strong><span className="text-[10px] text-gray-400">체결강도 58.45%</span></div>
                <div className="mt-4 space-y-2">{QUOTES.map((quote, index) => <div key={quote[0]} className={`grid grid-cols-[1fr_auto] text-xs ${index < 5 ? "text-red-500" : "text-blue-500"}`}><span className="font-bold">{quote[0]}</span><span className="text-[10px] text-gray-400">{quote[2]}</span></div>)}</div>
                <div className="my-4 border-y py-3 text-center font-bold text-red-500">191,000　+1.76%</div>
                <dl className="grid grid-cols-2 gap-y-2 text-[10px] text-gray-400"><dt>52주 최고</dt><dd className="text-right text-gray-700">205,000</dd><dt>시가</dt><dd className="text-right text-gray-700">192,500</dd><dt>최저</dt><dd className="text-right text-gray-700">190,000</dd><dt>거래량</dt><dd className="text-right text-gray-700">15,234,567</dd></dl>
            </aside>
        </div>
    );
}
