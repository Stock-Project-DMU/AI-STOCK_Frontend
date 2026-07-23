import { EXECUTIONS, QUOTES } from "../constants/stockData";

const candles = [
    42, 58, 70, 85, 98, 111, 88, 73, 59, 45, 38, 34, 31, 29, 28, 27, 26,
    25, 24, 23, 24, 25, 24, 23, 22, 24, 27, 25, 24, 26, 28, 29,
];

export default function StockChart() {
    const line = candles
        .map((value, index) => `${24 + index * 25},${164 - value}`)
        .join(" ");

    return (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div className="min-w-0 space-y-4">
                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726] shadow-xl shadow-black/10">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold">주가 차트</h2>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">LIVE</span>
                            </div>
                            <div className="mt-2 flex gap-4 text-[10px] tabular-nums text-slate-500">
                                <span>시 <b className="text-slate-300">192,500</b></span>
                                <span>고 <b className="text-red-400">193,000</b></span>
                                <span>저 <b className="text-blue-400">189,708</b></span>
                                <span>종 <b className="text-slate-300">191,000</b></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
                                <TimeButton active>일</TimeButton>
                                <TimeButton>주</TimeButton>
                                <TimeButton>월</TimeButton>
                                <TimeButton>년</TimeButton>
                            </div>
                            <button type="button" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-400 hover:border-slate-500 hover:text-white">지표</button>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto px-4 pb-3 pt-2">
                        <div className="absolute right-4 top-5 z-10 rounded bg-red-500 px-2 py-1 text-[10px] font-bold shadow-lg shadow-red-950/30">191,000</div>
                        <svg viewBox="0 0 840 270" className="h-[330px] w-full min-w-[690px]" role="img" aria-label="삼성전자 일봉 차트">
                            <defs>
                                <linearGradient id="chartFade" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[36, 80, 124, 168, 212].map((y) => <line key={y} x1="16" y1={y} x2="824" y2={y} stroke="#1e293b" strokeDasharray="3 5" />)}
                            {[100, 220, 340, 460, 580, 700].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="226" stroke="#132238" />)}
                            <path d={`M ${line} L 824 228 L 24 228 Z`} fill="url(#chartFade)" opacity="0.45" />
                            {candles.map((value, index) => {
                                const x = 24 + index * 25;
                                const y = 164 - value;
                                const rising = index < 6 || index % 4 === 0;
                                const color = rising ? "#f04452" : "#3b82f6";
                                return <g key={index}><line x1={x} y1={y - 9} x2={x} y2={y + 20} stroke={color} strokeWidth="1.3" /><rect x={x - 5} y={y} width="10" height="15" rx="1" fill={color} /></g>;
                            })}
                            <polyline points={line} fill="none" stroke="#fb7185" strokeWidth="1.5" opacity="0.65" />
                            <path d="M 284 101 C 390 110, 510 151, 824 154" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.75" />
                            <line x1="16" y1="164" x2="824" y2="164" stroke="#ef4444" strokeDasharray="4 5" opacity="0.45" />
                            {candles.map((value, index) => <rect key={`v-${index}`} x={19 + index * 25} y={250 - Math.max(7, value / 3)} width="10" height={Math.max(7, value / 3)} rx="1" fill={index % 3 === 0 ? "#f0445277" : "#3b82f655"} />)}
                        </svg>
                    </div>

                    <div className="grid grid-cols-2 border-t border-slate-800 sm:grid-cols-4">
                        <ChartMetric label="거래량" value="15,234,567" />
                        <ChartMetric label="외국인" value="+214,830" positive />
                        <ChartMetric label="기관" value="-58,200" />
                        <ChartMetric label="체결강도" value="58.45%" positive />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726] shadow-xl shadow-black/10">
                    <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                        <div><h2 className="font-bold">실시간 체결</h2><p className="mt-1 text-[10px] text-slate-500">최근 체결 내역</p></div>
                        <div className="flex gap-4 text-xs"><span className="font-bold text-red-400">실시간</span><span className="text-slate-500">일별</span></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-xs tabular-nums">
                            <thead className="bg-slate-900/60 text-slate-500"><tr><th className="px-5 py-3 text-left font-medium">체결가</th><th className="px-3 text-right font-medium">체결량(주)</th><th className="px-3 text-right font-medium">등락률</th><th className="px-3 text-right font-medium">누적 거래량</th><th className="px-5 text-right font-medium">시간</th></tr></thead>
                            <tbody>{EXECUTIONS.map((row, index) => <tr key={index} className="border-t border-slate-800/70 transition-colors hover:bg-slate-800/40"><td className="px-5 py-3 font-semibold">{row[0]}</td><td className="px-3 text-right text-red-400">{row[1]}</td><td className="px-3 text-right text-red-400">{row[2]}</td><td className="px-3 text-right text-slate-300">{row[3]}</td><td className="px-5 text-right text-slate-600">{row[4]}</td></tr>)}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            <aside className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726] shadow-xl shadow-black/10">
                <div className="border-b border-slate-800 px-4 py-4">
                    <div className="flex justify-between"><strong>실시간 호가</strong><span className="text-[10px] text-slate-500">체결강도 <b className="text-emerald-400">58.45%</b></span></div>
                    <div className="mt-3 grid grid-cols-2 text-[10px] text-slate-600"><span>가격</span><span className="text-right">잔량</span></div>
                </div>
                <div className="py-2">
                    {QUOTES.slice(0, 5).map((quote, index) => <QuoteRow key={quote[0]} quote={quote} index={index} side="sell" />)}
                    <div className="my-2 border-y border-red-500/20 bg-red-500/5 px-4 py-3">
                        <div className="flex items-end justify-between"><strong className="text-lg text-red-400">191,000</strong><span className="text-xs font-bold text-red-400">▲ 1.76%</span></div>
                        <p className="mt-1 text-[10px] text-slate-600">전일 대비 +3,303</p>
                    </div>
                    {QUOTES.slice(5).map((quote, index) => <QuoteRow key={quote[0]} quote={quote} index={index} side="buy" />)}
                </div>
                <dl className="grid grid-cols-2 gap-y-3 border-t border-slate-800 px-4 py-4 text-[10px] text-slate-500"><dt>52주 최고</dt><dd className="text-right font-semibold text-red-400">205,000</dd><dt>52주 최저</dt><dd className="text-right font-semibold text-blue-400">168,000</dd><dt>시가</dt><dd className="text-right text-slate-300">192,500</dd><dt>거래량</dt><dd className="text-right text-slate-300">15,234,567</dd></dl>
            </aside>
        </div>
    );
}

function TimeButton({ active, children }: { active?: boolean; children: React.ReactNode }) {
    return <button type="button" className={`rounded-md px-3 py-1.5 font-semibold ${active ? "theme-accent-bg shadow" : "text-slate-500 hover:text-slate-200"}`}>{children}</button>;
}

function ChartMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
    return <dl className="border-r border-slate-800 px-5 py-3 last:border-0"><dt className="text-[10px] text-slate-600">{label}</dt><dd className={`mt-1 text-xs font-bold tabular-nums ${positive ? "text-emerald-400" : "text-slate-300"}`}>{value}</dd></dl>;
}

function QuoteRow({ quote, index, side }: { quote: readonly [string, string, string]; index: number; side: "sell" | "buy" }) {
    const width = 28 + (4 - index) * 11;
    return (
        <div className="relative grid grid-cols-[1fr_auto] overflow-hidden px-4 py-2 text-xs tabular-nums">
            <span className={`absolute inset-y-0 ${side === "sell" ? "right-0 bg-red-500/8" : "left-0 bg-blue-500/8"}`} style={{ width: `${width}%` }} />
            <span className={`relative font-bold ${side === "sell" ? "text-red-400" : "text-blue-400"}`}>{quote[0]}</span>
            <span className="relative text-[10px] text-slate-500">{quote[2]}</span>
        </div>
    );
}
