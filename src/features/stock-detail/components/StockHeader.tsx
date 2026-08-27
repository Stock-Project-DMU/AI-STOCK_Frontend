import type { StockPriceResponse } from "@/lib/api/types";

export default function StockHeader({ stock }: { stock?: StockPriceResponse | null }) {
    const currentPrice = stock?.currentPrice ?? 191_000;
    const changeAmount = stock?.changeAmount ?? 3_303;
    const changeRate = stock?.changeRate ?? 1.76;
    const previousClose = currentPrice - changeAmount;
    const isDown = stock?.direction === "DOWN";
    const changePrefix = isDown ? "▼" : stock?.direction === "FLAT" ? "" : "▲";
    const changeTone = isDown ? "text-down" : stock?.direction === "FLAT" ? "text-ink" : "text-up";

    return (
        <section className="border-b border-hairline bg-canvas px-4 py-4 text-ink sm:px-6">
            <div className="mx-auto max-w-[1500px]">
                <div className="mb-3 flex items-center justify-between text-[12px] text-muted">
                    <span>국내주식　/　KOSPI　/　전기·전자</span>
                    <span className="flex items-center gap-2">
                        <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        장 마감 · 데이터 기준 20:43
                    </span>
                </div>

                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-white">S</span>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-ink">{stock?.stockName ?? "삼성전자"}</h1>
                                    <span className="rounded-xs bg-surface-strong px-2 py-1 text-[12px] font-bold text-muted num">{stock?.stockCode ?? "005930"}</span>
                                    <span className="theme-accent-soft theme-accent-text rounded-xs px-2 py-1 text-[12px] font-bold">KOSPI</span>
                                </div>
                                <p className="mt-1 text-xs text-muted">Samsung Electronics Co., Ltd.</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-end gap-4">
                            <strong className="num text-3xl font-bold tracking-tight text-ink">{currentPrice.toLocaleString("ko-KR")}<span className="ml-1 text-base font-semibold text-muted">원</span></strong>
                            <div className="mb-1">
                                <span className={`num rounded-md bg-[rgba(207,32,47,0.1)] px-3 py-1.5 text-sm font-bold ${changeTone}`}>{changePrefix} {Math.abs(changeAmount).toLocaleString("ko-KR")} ({Math.abs(changeRate).toFixed(2)}%)</span>
                                <p className="mt-2 text-[12px] text-muted num">전일 종가 {previousClose.toLocaleString("ko-KR")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[620px]">
                        <Metric label="시가" value="192,500" />
                        <Metric label="고가 / 저가" value="193,000 / 189,708" />
                        <Metric label="거래량" value={(stock?.volume ?? 15_234_567).toLocaleString("ko-KR")} />
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
            <dt className="text-[12px] font-medium text-muted">{label}</dt>
            <dd className={`num mt-1 text-sm font-bold ${accent ? "text-up" : "text-ink"}`}>{value}</dd>
        </dl>
    );
}
