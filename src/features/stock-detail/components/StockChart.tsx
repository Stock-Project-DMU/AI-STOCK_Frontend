"use client";
import { useEffect, useMemo, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BarShapeProps, TooltipContentProps } from "recharts";
import type { HogaResponse, StockPriceResponse } from "@/lib/api/types";
import { getStockHistory, type HistoricalPrice } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
type Candle = { label: string; open: number; high: number; low: number; close: number; volume: number };
type Period = "일" | "주" | "월" | "년";
function aggregate(rows: HistoricalPrice[], period: Period): Candle[] {
    const groups = new Map<string, Candle>();
    [...rows].sort((a, b) => a.date.localeCompare(b.date)).forEach(row => {
        const date = row.date.replaceAll("-", "");
        let key = period === "년" ? date.slice(0, 4) : period === "월" ? date.slice(0, 6) : date;
        if (period === "주") {
            const day = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8))));
            day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
            key = day.toISOString().slice(0, 10);
        }
        const current = groups.get(key);
        if (current) { current.high = Math.max(current.high, row.high); current.low = Math.min(current.low, row.low); current.close = row.close; current.volume += row.volume; }
        else groups.set(key, { label: key, open: row.open, high: row.high, low: row.low, close: row.close, volume: row.volume });
    });
    return [...groups.values()];
}
export default function StockChart({ stockCode, stock, hoga, ticks }: { stockCode: string; stock?: StockPriceResponse | null; hoga?: HogaResponse | null; ticks: (StockPriceResponse & { receivedAt: string })[] }) {
    const [history, setHistory] = useState<HistoricalPrice[]>([]);
    const [period, setPeriod] = useState<Period>("일");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const months = period === "일" ? 3 : period === "주" ? 12 : 60;
    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try { const rows = await getStockHistory(stockCode, months); if (active) setHistory(rows); }
            catch (error) { if (active) { setHistory([]); setError(getApiErrorMessage(error, "차트 조회에 실패했습니다.")); } }
            finally { if (active) setLoading(false); }
        }
        void load(); return () => { active = false; };
    }, [stockCode, months]);
    const candles = useMemo(() => aggregate(history, period), [history, period]);
    return <div className="cq-stock-chart grid min-w-0 gap-3">
        <div className="min-w-0 space-y-3">
            <section className="rounded-lg border border-hairline bg-canvas p-3"><div className="mb-3 flex justify-between"><h2 className="font-bold">주가 차트</h2><div className="flex gap-1">{(["일", "주", "월", "년"] as Period[]).map(value => <button key={value} onClick={() => setPeriod(value)} className={`rounded px-3 py-1 text-sm ${period === value ? "bg-primary text-white" : "bg-surface-soft"}`}>{value}</button>)}</div></div>
                {loading && <p role="status">차트 조회 중...</p>}{error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                {candles.length > 0 ? <ResponsiveContainer width="100%" height={330}>
                            <ComposedChart data={candles} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
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
                                    {candles.map((candle) => (
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
                        </ResponsiveContainer> : !loading && <p className="p-8 text-center text-sm text-muted">표시할 시세가 없습니다.</p>}
            </section>
            <section className="overflow-hidden rounded-lg border border-hairline bg-canvas"><h2 className="p-4 font-bold">실시간 시세 수신 기록</h2><p className="px-4 pb-3 text-xs text-muted">접속 이후 수신한 시세입니다. 서버 전송 간격에 따라 개별 체결이 합쳐질 수 있습니다.</p>
                <div className="overflow-auto"><table className="w-full text-right text-sm"><thead><tr className="[&_th]:p-2"><th>현재가</th><th>등락률</th><th>누적 거래량</th><th>수신 시각</th></tr></thead><tbody>{ticks.map((tick, index) => <tr key={index} className="border-t border-hairline [&_td]:p-2"><td>{tick.currentPrice.toLocaleString()}</td><td>{tick.changeRate}%</td><td>{tick.volume.toLocaleString()}</td><td>{tick.receivedAt}</td></tr>)}</tbody></table></div>
                {!ticks.length && <p className="p-5 text-sm text-muted">새 시세 수신을 기다리고 있습니다.</p>}
            </section>
        </div>
        <aside className="rounded-lg border border-hairline bg-canvas p-3"><h2 className="font-bold">실시간 호가</h2>{!hoga && <p className="mt-4 text-xs text-muted">호가 수신 대기 중</p>}
            {hoga?.askPrices.slice(0, 5).reverse().map((price, index) => <div key={index} className="mt-3 flex justify-between text-xs text-up"><strong>{price.toLocaleString()}</strong><span>{hoga.askVolumes[Math.min(5, hoga.askPrices.length) - 1 - index]?.toLocaleString()}</span></div>)}
            <p className="my-4 border-y border-hairline py-3 font-bold">{stock ? stock.currentPrice.toLocaleString() + "원" : "현재가 수신 대기"}</p>
            {hoga?.bidPrices.slice(0, 5).map((price, index) => <div key={index} className="mt-3 flex justify-between text-xs text-down"><strong>{price.toLocaleString()}</strong><span>{hoga.bidVolumes[index]?.toLocaleString()}</span></div>)}
        </aside>
    </div>;
}
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
