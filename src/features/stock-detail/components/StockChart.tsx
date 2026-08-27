"use client";

import {
    Bar,
    CartesianGrid,
    Cell,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { BarShapeProps, TooltipContentProps } from "recharts";
import type { HogaResponse, StockPriceResponse } from "@/lib/api/types";
import { EXECUTIONS, QUOTES } from "../constants/stockData";

const candles = [
    42, 58, 70, 85, 98, 111, 88, 73, 59, 45, 38, 34, 31, 29, 28, 27, 26,
    25, 24, 23, 24, 25, 24, 23, 22, 24, 27, 25, 24, 26, 28, 29,
];

type Candle = {
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

// Derive a real OHLC candle series from the original magnitude array so the
// recharts candlestick has open/high/low/close/volume to work with, while
// keeping the same underlying mock "shape" the component always shipped with.
function buildCandles(values: number[]): Candle[] {
    const BASE = 189_000;
    const SCALE = 40;

    return values.map((value, index) => {
        const prevValue = index === 0 ? value - 4 : values[index - 1];
        const open = BASE + prevValue * SCALE;
        const close = BASE + value * SCALE;
        const spread = 260 + (index % 5) * 110;
        const high = Math.max(open, close) + spread;
        const low = Math.min(open, close) - spread * 0.6;
        const volume = Math.round(Math.max(7, value / 3) * 42_000);

        return {
            label: `D-${values.length - index}`,
            open,
            high,
            low,
            close,
            volume,
        };
    });
}

const CANDLES = buildCandles(candles);

export default function StockChart({ stock, hoga }: { stock?: StockPriceResponse | null; hoga?: HogaResponse | null }) {
    const currentPrice = stock?.currentPrice ?? 191_000;
    const changeAmount = stock?.changeAmount ?? 3_303;
    const changeRate = stock?.changeRate ?? 1.76;
    const isDown = stock?.direction === "DOWN";
    const quoteRows = hoga ? buildQuoteRows(hoga, currentPrice) : QUOTES;

    return (
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0 space-y-3">
                <section className="overflow-hidden rounded-lg border border-hairline bg-canvas">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-ink">주가 차트</h2>
                                <span className="rounded-pill bg-emerald-500/10 px-2 py-0.5 text-[12px] font-bold text-emerald-500">LIVE</span>
                            </div>
                            <div className="num mt-1.5 flex gap-4 text-[12px] text-muted">
                                <span>시 <b className="text-ink">192,500</b></span>
                                <span>고 <b className="text-up">193,000</b></span>
                                <span>저 <b className="text-down">189,708</b></span>
                                <span>종 <b className="text-ink">{currentPrice.toLocaleString("ko-KR")}</b></span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex rounded-md border border-hairline bg-surface-soft p-1">
                                <TimeButton active>일</TimeButton>
                                <TimeButton>주</TimeButton>
                                <TimeButton>월</TimeButton>
                                <TimeButton>년</TimeButton>
                            </div>
                            <button type="button" className="rounded-md border border-hairline px-3 py-1.5 text-muted hover:border-muted-soft hover:text-ink">지표</button>
                        </div>
                    </div>

                    <div className="relative px-2 pb-2 pt-2">
                        <div className={`num absolute right-3 top-3 z-10 rounded-xs px-2 py-1 text-[12px] font-bold text-white ${isDown ? "bg-[var(--market-down)]" : "bg-[var(--market-up)]"}`}>{currentPrice.toLocaleString("ko-KR")}</div>
                        <ResponsiveContainer width="100%" height={330}>
                            <ComposedChart data={CANDLES} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "var(--chart-label)" }}
                                    axisLine={{ stroke: "var(--chart-grid)" }}
                                    tickLine={false}
                                    interval={3}
                                    minTickGap={16}
                                />
                                <YAxis
                                    yAxisId="price"
                                    orientation="right"
                                    domain={["dataMin - 400", "dataMax + 400"]}
                                    tick={{ fontSize: 10, fill: "var(--chart-label)" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={56}
                                    tickFormatter={(value: number) => Math.round(value).toLocaleString("ko-KR")}
                                />
                                <YAxis yAxisId="volume" domain={[0, (max: number) => max * 4]} hide />
                                <Tooltip content={ChartTooltip} cursor={{ stroke: "var(--chart-grid)", strokeWidth: 1 }} />
                                <Bar yAxisId="volume" dataKey="volume" isAnimationActive={false} radius={[1, 1, 0, 0]}>
                                    {CANDLES.map((candle) => (
                                        <Cell
                                            key={candle.label}
                                            fill={candle.close >= candle.open ? "rgba(207,32,47,0.18)" : "rgba(29,78,216,0.18)"}
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    yAxisId="price"
                                    dataKey={(candle: Candle) => [candle.low, candle.high]}
                                    shape={CandleShape}
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 border-t border-hairline sm:grid-cols-4">
                        <ChartMetric label="거래량" value={(stock?.volume ?? 15_234_567).toLocaleString("ko-KR")} />
                        <ChartMetric label="외국인" value="+214,830" positive />
                        <ChartMetric label="기관" value="-58,200" />
                        <ChartMetric label="체결강도" value="58.45%" positive />
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-hairline bg-canvas">
                    <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                        <div><h2 className="font-bold text-ink">실시간 체결</h2><p className="mt-1 text-[12px] text-muted">최근 체결 내역</p></div>
                        <div className="flex gap-4 text-xs"><span className="font-bold text-up">실시간</span><span className="text-muted">일별</span></div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-[13px]">
                            <thead className="bg-surface-soft text-muted"><tr><th className="px-4 py-2 text-left font-medium">체결가</th><th className="px-3 text-right font-medium">체결량(주)</th><th className="px-3 text-right font-medium">등락률</th><th className="px-3 text-right font-medium">누적 거래량</th><th className="px-4 text-right font-medium">시간</th></tr></thead>
                            <tbody>{EXECUTIONS.map((row, index) => <tr key={index} className="num border-t border-hairline transition-colors hover:bg-surface-soft"><td className="px-4 py-2 font-semibold text-ink">{row[0]}</td><td className="px-3 text-right text-up">{row[1]}</td><td className="px-3 text-right text-up">{row[2]}</td><td className="px-3 text-right text-ink">{row[3]}</td><td className="px-4 text-right text-muted">{row[4]}</td></tr>)}</tbody>
                        </table>
                    </div>
                </section>
            </div>

            <aside className="overflow-hidden rounded-lg border border-hairline bg-canvas">
                <div className="border-b border-hairline px-3 py-3">
                    <div className="flex justify-between"><strong className="text-ink">실시간 호가</strong><span className="text-[12px] text-muted">체결강도 <b className="text-up">58.45%</b></span></div>
                    <div className="mt-2 grid grid-cols-2 text-[12px] text-muted"><span>가격</span><span className="text-right">잔량</span></div>
                </div>
                <div className="py-1">
                    {quoteRows.slice(0, 5).map((quote, index) => <QuoteRow key={`ask-${quote[0]}-${index}`} quote={quote} index={index} side="sell" />)}
                    <div className="my-1.5 border-y border-[rgba(207,32,47,0.2)] bg-[rgba(207,32,47,0.05)] px-3 py-2">
                        <div className="num flex items-end justify-between"><strong className={`text-base ${isDown ? "text-down" : "text-up"}`}>{currentPrice.toLocaleString("ko-KR")}</strong><span className={`text-xs font-bold ${isDown ? "text-down" : "text-up"}`}>{isDown ? "▼" : "▲"} {Math.abs(changeRate).toFixed(2)}%</span></div>
                        <p className="num mt-1 text-[12px] text-muted">전일 대비 {changeAmount >= 0 ? "+" : "-"}{Math.abs(changeAmount).toLocaleString("ko-KR")}</p>
                    </div>
                    {quoteRows.slice(5).map((quote, index) => <QuoteRow key={`bid-${quote[0]}-${index}`} quote={quote} index={index} side="buy" />)}
                </div>
                <dl className="num grid grid-cols-2 gap-y-2 border-t border-hairline px-3 py-3 text-[12px] text-muted"><dt>52주 최고</dt><dd className="text-right font-semibold text-up">205,000</dd><dt>52주 최저</dt><dd className="text-right font-semibold text-down">168,000</dd><dt>시가</dt><dd className="text-right text-ink">192,500</dd><dt>거래량</dt><dd className="text-right text-ink">15,234,567</dd></dl>
            </aside>
        </div>
    );
}

function buildQuoteRows(hoga: HogaResponse, currentPrice: number): [string, string, string][] {
    const toQuote = (price: number, volume: number): [string, string, string] => {
        const rate = currentPrice === 0 ? 0 : ((price - currentPrice) / currentPrice) * 100;
        return [
            price.toLocaleString("ko-KR"),
            `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`,
            volume.toLocaleString("ko-KR"),
        ];
    };

    const asks = hoga.askPrices.slice(0, 5).map((price, index) => toQuote(price, hoga.askVolumes[index] ?? 0));
    const bids = hoga.bidPrices.slice(0, 5).map((price, index) => toQuote(price, hoga.bidVolumes[index] ?? 0));
    return [...asks, ...bids];
}

// Custom recharts Bar `shape`: renders the high-low wick plus the open-close
// body, colored via the Korean up=red/down=blue convention. The Bar's
// dataKey returns [low, high] so recharts positions x/y/width/height to
// span the full high-low range; the body rect is derived from that span.
function CandleShape(props: BarShapeProps) {
    const { x, y, width, height, payload } = props;
    const candle = payload as Candle | undefined;

    if (x == null || y == null || candle == null || height <= 0) return null;

    const { open, close, high, low } = candle;
    const isUp = close >= open;
    const color = isUp ? "var(--market-up)" : "var(--market-down)";

    const range = high - low || 1;
    const scale = height / range;
    const bodyTop = y + (high - Math.max(open, close)) * scale;
    const bodyBottom = y + (high - Math.min(open, close)) * scale;
    const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);

    const bodyWidth = Math.max(2, width * 0.6);
    const bodyX = x + (width - bodyWidth) / 2;
    const wickX = x + width / 2;

    return (
        <g>
            <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} strokeWidth={1.2} />
            <rect x={bodyX} y={bodyTop} width={bodyWidth} height={bodyHeight} rx={1} fill={color} />
        </g>
    );
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const candle = payload[0]?.payload as Candle | undefined;
    if (!candle) return null;

    const isUp = candle.close >= candle.open;

    return (
        <div className="rounded-md border border-hairline bg-canvas px-3 py-2 text-[12px] shadow-[0_0.6px_0.6px_-1.25px_rgba(10,11,13,.12),0_2.2px_2.2px_-2.5px_rgba(10,11,13,.1),0_10px_10px_-3.75px_rgba(10,11,13,.0425)]">
            <p className="mb-1.5 font-semibold text-ink">{candle.label}</p>
            <div className="space-y-0.5">
                <TooltipRow label="시가" value={candle.open} />
                <TooltipRow label="고가" value={candle.high} />
                <TooltipRow label="저가" value={candle.low} />
                <TooltipRow label="종가" value={candle.close} tone={isUp ? "up" : "down"} />
                <TooltipRow label="거래량" value={candle.volume} unit="주" />
            </div>
        </div>
    );
}

function TooltipRow({ label, value, tone, unit = "원" }: { label: string; value: number; tone?: "up" | "down"; unit?: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted">{label}</span>
            <span className={`num ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-ink"}`}>
                {Math.round(value).toLocaleString("ko-KR")}{unit}
            </span>
        </div>
    );
}

function TimeButton({ active, children }: { active?: boolean; children: React.ReactNode }) {
    return <button type="button" className={`rounded-sm px-3 py-1.5 font-semibold ${active ? "bg-primary text-white" : "text-muted hover:text-ink"}`}>{children}</button>;
}

function ChartMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
    return <dl className="border-r border-hairline px-4 py-2.5 last:border-0"><dt className="text-[12px] text-muted">{label}</dt><dd className={`num mt-1 text-xs font-bold ${positive ? "text-up" : "text-ink"}`}>{value}</dd></dl>;
}

function QuoteRow({ quote, index, side }: { quote: readonly [string, string, string]; index: number; side: "sell" | "buy" }) {
    const width = 28 + (4 - index) * 11;
    return (
        <div className="num relative grid grid-cols-[1fr_auto] overflow-hidden px-3 py-1.5 text-[12px]">
            <span className={`absolute inset-y-0 ${side === "sell" ? "right-0 bg-[rgba(207,32,47,0.08)]" : "left-0 bg-[rgba(29,78,216,0.08)]"}`} style={{ width: `${width}%` }} />
            <span className={`relative font-bold ${side === "sell" ? "text-up" : "text-down"}`}>{quote[0]}</span>
            <span className="relative text-[12px] text-muted">{quote[2]}</span>
        </div>
    );
}
