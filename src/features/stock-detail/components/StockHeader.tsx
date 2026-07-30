export default function StockHeader() {
    return (
        <section className="border-b border-hairline bg-canvas px-4 py-4 text-ink sm:px-6">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-3 flex items-center justify-between text-[11px] text-muted">
                    <span>국내주식　/　KOSPI　/　전기·전자</span>
                    <span className="flex items-center gap-2">
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        장 마감 · 데이터 기준 20:43
                    </span>
                </div>

                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-black text-white">S</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-black text-ink">삼성전자</h1>
                                    <span className="rounded-xs bg-surface-strong px-2 py-1 text-[10px] font-bold text-muted num">005930</span>
                                    <span className="theme-accent-soft theme-accent-text rounded-xs px-2 py-1 text-[10px] font-bold">KOSPI</span>
                                </div>
                                <p className="mt-1 text-xs text-muted">Samsung Electronics Co., Ltd.</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-end gap-4">
                            <strong className="num text-3xl font-black tracking-tight text-ink">191,000<span className="ml-1 text-base font-semibold text-muted">원</span></strong>
                            <div className="mb-1">
                                <span className="num rounded-md bg-[rgba(207,32,47,0.1)] px-3 py-1.5 text-sm font-bold text-up">▲ 3,303 (1.76%)</span>
                                <p className="mt-2 text-[11px] text-muted num">전일 종가 187,697</p>
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
        <dl className="rounded-lg border border-hairline bg-surface-soft px-3 py-2">
            <dt className="text-[10px] font-medium text-muted">{label}</dt>
            <dd className={`num mt-1 text-sm font-bold ${accent ? "text-up" : "text-ink"}`}>{value}</dd>
        </dl>
    );
}
