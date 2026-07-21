export default function StockHeader() {
    return (
        <section className="border-b border-slate-800 bg-[#081321] px-5 py-6 text-white sm:px-8">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-5 flex items-center justify-between text-xs text-slate-400">
                    <span>국내주식　/　KOSPI　/　전기·전자</span>
                    <span className="flex items-center gap-2">
                        <i className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        장 마감 · 데이터 기준 20:43
                    </span>
                </div>

                <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="always-dark flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-700 text-lg font-black text-white shadow-lg shadow-teal-950/40">S</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black">삼성전자</h1>
                                    <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">005930</span>
                                    <span className="theme-accent-soft theme-accent-text rounded px-2 py-1 text-[10px] font-bold">KOSPI</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Samsung Electronics Co., Ltd.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-end gap-4">
                            <strong className="text-4xl font-black tracking-tight tabular-nums">191,000<span className="ml-1 text-lg font-semibold text-slate-400">원</span></strong>
                            <div className="mb-1">
                                <span className="rounded-lg bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-400">▲ 3,303 (1.76%)</span>
                                <p className="mt-2 text-[11px] text-slate-500">전일 종가 187,697</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[620px]">
                        <Metric label="시가" value="192,500" />
                        <Metric label="고가 / 저가" value="193,000 / 189,708" />
                        <Metric label="거래량" value="15,234,567" />
                        <Metric label="거래대금" value="2.91조" accent />
                    </div>
                </div>
            </div>
        </section>
    );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <dl className="rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 shadow-inner shadow-black/20">
            <dt className="text-[10px] font-medium text-slate-500">{label}</dt>
            <dd className={`mt-1.5 text-sm font-bold tabular-nums ${accent ? "text-red-400" : "text-slate-100"}`}>{value}</dd>
        </dl>
    );
}
