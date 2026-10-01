"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BarShapeProps, TooltipContentProps } from "recharts";
import type { HogaResponse, StockPriceResponse } from "@/lib/api/types";
import { getStockHistory, type ChartDwmcode, type HistoricalPrice } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
type Candle = { label: string; open: number; high: number; low: number; close: number; volume: number };
type Period = "일" | "주" | "월" | "년";
// 탭별로 받을 봉 종류(dwmcode)와 개수 — 일봉 60(약 3개월), 주봉 52(약 1년), 월봉 60(5년).
// '년' 탭은 별도 연봉이 없어 월봉 60개(5년)를 받아 아래 aggregate()에서 연도별로 묶는다.
const PERIOD_REQUEST: Record<Period, { dwmcode: ChartDwmcode; count: number }> = {
    일: { dwmcode: 1, count: 60 },
    주: { dwmcode: 2, count: 52 },
    월: { dwmcode: 3, count: 60 },
    년: { dwmcode: 3, count: 60 },
};
// x축 날짜 라벨 — 탭별 표시 형식과 최대 개수, 라벨 한 개가 차지하는 폭(px, 폰트 10px 기준 여백 포함).
// 라벨 값(candle.label)은 툴팁에서도 쓰므로 그대로 두고 x축 표시만 tickFormatter로 바꾼다.
const LABEL_RULES: Record<Period, { maxLabels: number; labelWidth: number; format: (digits: string) => string }> = {
    일: { maxLabels: 10, labelWidth: 44, format: digits => `${digits.slice(4, 6)}/${digits.slice(6, 8)}` },
    주: { maxLabels: 10, labelWidth: 44, format: digits => `${digits.slice(4, 6)}/${digits.slice(6, 8)}` },
    월: { maxLabels: 10, labelWidth: 56, format: digits => `${digits.slice(0, 4)}/${digits.slice(4, 6)}` },
    년: { maxLabels: Number.POSITIVE_INFINITY, labelWidth: 36, format: digits => digits.slice(0, 4) },
};
// 가격 축이 오른쪽에 있어 실제 봉이 그려지는 폭 = 차트 폭 - (오른쪽 margin 8 + 가격 축 폭 56).
const PLOT_RIGHT_INSET = 64;
// 최대로 확대했을 때 남기는 최소 봉 개수.
const MIN_VISIBLE_CANDLES = 5;
// 휠 한 번에 보이는 봉 개수를 바꾸는 배율.
const WHEEL_ZOOM_FACTOR = 1.2;
type ZoomWindow = { source: Candle[]; start: number; end: number };
type Gesture = { pointers: Map<number, number>; dragX: number; dragStart: number; pinchDistance: number; pinchStart: number; pinchSize: number; pinchRatio: number };
// 보이는 봉이 많으면 최신(오른쪽 끝) 봉 라벨이 항상 남도록 끝에서부터 일정 간격으로 라벨을 고른다.
function pickTickLabels(labels: string[], maxLabels: number): string[] {
    if (labels.length <= maxLabels) return labels;
    const step = Math.ceil(labels.length / maxLabels);
    const picked: string[] = [];
    for (let index = labels.length - 1; index >= 0; index -= step) picked.push(labels[index]);
    return picked.reverse();
}
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
    const { dwmcode, count } = PERIOD_REQUEST[period];
    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try { const rows = await getStockHistory(stockCode, dwmcode, count); if (active) setHistory(rows); }
            catch (error) { if (active) { setHistory([]); setError(getApiErrorMessage(error, "차트 조회에 실패했습니다.")); } }
            finally { if (active) setLoading(false); }
        }
        void load(); return () => { active = false; };
    }, [stockCode, dwmcode, count]);
    const candles = useMemo(() => aggregate(history, period), [history, period]);

    // 확대/축소 — 보이는 봉 범위(start~end)만 차트에 넘긴다. source가 지금 candles와 다르면(탭 변경·새 데이터) 전체 보기로 돌아간다.
    const chartAreaRef = useRef<HTMLDivElement>(null);
    const gestureRef = useRef<Gesture>({ pointers: new Map(), dragX: 0, dragStart: 0, pinchDistance: 0, pinchStart: 0, pinchSize: 0, pinchRatio: 0 });
    const [zoom, setZoom] = useState<ZoomWindow | null>(null);
    const [chartWidth, setChartWidth] = useState(0);
    const total = candles.length;
    const activeZoom = zoom && zoom.source === candles && zoom.end <= total ? zoom : null;
    const viewStart = activeZoom?.start ?? 0;
    const viewEnd = activeZoom?.end ?? total;
    const viewSize = viewEnd - viewStart;
    const visibleCandles = useMemo(() => candles.slice(viewStart, viewEnd), [candles, viewStart, viewEnd]);
    const plotWidth = Math.max(1, chartWidth - PLOT_RIGHT_INSET);
    const labelRule = LABEL_RULES[period];
    // 탭별 최대 개수와 지금 차트 폭에 들어가는 개수 중 작은 쪽만큼만 라벨을 보여 좁은 화면에서도 겹치지 않게 한다.
    const tickLabels = useMemo(() => {
        const fitByWidth = Math.max(2, Math.floor(plotWidth / labelRule.labelWidth));
        return pickTickLabels(visibleCandles.map(candle => candle.label), Math.min(labelRule.maxLabels, fitByWidth));
    }, [visibleCandles, plotWidth, labelRule]);

    // 보이는 봉 개수를 nextSize로 바꾸되, anchorRatio(0=왼쪽 끝, 1=오른쪽 끝) 위치의 봉이 화면에서 같은 자리에 머물게 한다.
    function zoomTo(nextSize: number, anchorRatio: number, baseStart: number, baseSize: number) {
        const size = Math.min(total, Math.max(Math.min(MIN_VISIBLE_CANDLES, total), Math.round(nextSize)));
        const anchorIndex = baseStart + anchorRatio * baseSize;
        const start = Math.min(Math.max(Math.round(anchorIndex - anchorRatio * size), 0), total - size);
        setZoom(size >= total ? null : { source: candles, start, end: start + size });
    }
    function ratioAt(clientX: number) {
        const left = chartAreaRef.current?.getBoundingClientRect().left ?? 0;
        return Math.min(Math.max((clientX - left) / plotWidth, 0), 1);
    }

    useEffect(() => {
        const area = chartAreaRef.current;
        if (!area) return;
        const observer = new ResizeObserver(entries => setChartWidth(entries[0]?.contentRect.width ?? 0));
        observer.observe(area);
        return () => observer.disconnect();
    }, [total]);

    // 휠은 페이지 스크롤 대신 확대/축소로 쓴다 — React onWheel은 passive라 preventDefault가 안 돼 직접 등록한다.
    useEffect(() => {
        const area = chartAreaRef.current;
        if (!area || total === 0) return;
        const handleWheel = (event: WheelEvent) => {
            if (event.deltaY === 0) return;
            event.preventDefault();
            const zoomOut = event.deltaY > 0;
            let nextSize = viewSize * (zoomOut ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR);
            if (Math.round(nextSize) === viewSize) nextSize = viewSize + (zoomOut ? 1 : -1);
            const left = area.getBoundingClientRect().left;
            const ratio = Math.min(Math.max((event.clientX - left) / plotWidth, 0), 1);
            const size = Math.min(total, Math.max(Math.min(MIN_VISIBLE_CANDLES, total), Math.round(nextSize)));
            const start = Math.min(Math.max(Math.round(viewStart + ratio * viewSize - ratio * size), 0), total - size);
            setZoom(size >= total ? null : { source: candles, start, end: start + size });
        };
        area.addEventListener("wheel", handleWheel, { passive: false });
        return () => area.removeEventListener("wheel", handleWheel);
    }, [candles, total, viewStart, viewSize, plotWidth]);

    // 손가락 하나(또는 마우스) 드래그는 좌우 이동, 손가락 두 개는 핀치 확대/축소.
    function beginGesture() {
        const gesture = gestureRef.current;
        const xs = [...gesture.pointers.values()];
        if (xs.length >= 2) {
            gesture.pinchDistance = Math.max(1, Math.abs(xs[0] - xs[1]));
            gesture.pinchStart = viewStart;
            gesture.pinchSize = viewSize;
            gesture.pinchRatio = ratioAt((xs[0] + xs[1]) / 2);
        } else if (xs.length === 1) {
            gesture.dragX = xs[0];
            gesture.dragStart = viewStart;
        }
    }
    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        gestureRef.current.pointers.set(event.pointerId, event.clientX);
        beginGesture();
    }
    function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
        const gesture = gestureRef.current;
        if (!gesture.pointers.has(event.pointerId)) return;
        gesture.pointers.set(event.pointerId, event.clientX);
        const xs = [...gesture.pointers.values()];
        if (xs.length >= 2) {
            const distance = Math.max(1, Math.abs(xs[0] - xs[1]));
            zoomTo(gesture.pinchSize * gesture.pinchDistance / distance, gesture.pinchRatio, gesture.pinchStart, gesture.pinchSize);
        } else if (activeZoom) {
            const shift = Math.round((gesture.dragX - event.clientX) / (plotWidth / viewSize));
            const start = Math.min(Math.max(gesture.dragStart + shift, 0), total - viewSize);
            if (start !== viewStart) setZoom({ source: candles, start, end: start + viewSize });
        }
    }
    function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
        gestureRef.current.pointers.delete(event.pointerId);
        beginGesture();
    }

    return <div className="cq-stock-chart grid min-w-0 gap-3">
        <div className="min-w-0 space-y-3">
            <section className="rounded-lg border border-hairline bg-canvas p-3"><div className="mb-3 flex justify-between"><h2 className="font-bold">주가 차트</h2><div className="flex gap-1">{(["일", "주", "월", "년"] as Period[]).map(value => <button key={value} onClick={() => setPeriod(value)} className={`rounded px-3 py-1 text-sm ${period === value ? "bg-primary text-white" : "bg-surface-soft"}`}>{value}</button>)}</div></div>
                {loading && <p role="status">차트 조회 중...</p>}{error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                {candles.length > 0 ? <div
                            ref={chartAreaRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerEnd}
                            onPointerCancel={handlePointerEnd}
                            onDoubleClick={() => setZoom(null)}
                            // 세로 스크롤은 페이지에 맡기고 가로 드래그·핀치만 차트가 받는다.
                            style={{ touchAction: "pan-y", cursor: activeZoom ? "grab" : undefined }}
                            // Recharts가 차트(svg)와 내부 레이어(g)에 tabindex를 붙여 클릭·드래그 때도 포커스 테두리가 그려진다 —
                            // 차트 영역 안에서 마우스 포커스(:focus-visible 아님)일 때만 숨기고 키보드 포커스 테두리는 유지한다.
                            className="select-none [&_:focus:not(:focus-visible)]:outline-none"
                        ><ResponsiveContainer width="100%" height={330}>
                            <ComposedChart data={visibleCandles} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "var(--chart-label)" }}
                                    axisLine={{ stroke: "var(--chart-grid)" }}
                                    tickLine={false}
                                    ticks={tickLabels}
                                    interval={0}
                                    tickFormatter={(label: string) => labelRule.format(label.replaceAll("-", ""))}
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
                                    {visibleCandles.map((candle) => (
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
                        </ResponsiveContainer></div> : !loading && <p className="p-8 text-center text-sm text-muted">표시할 시세가 없습니다.</p>}
            </section>
            <section className="overflow-hidden rounded-lg border border-hairline bg-canvas"><h2 className="p-4 font-bold">실시간 시세 수신 기록</h2><p className="px-4 pb-3 text-xs text-muted">접속 이후 수신한 시세입니다. 서버 전송 간격에 따라 개별 체결이 합쳐질 수 있습니다.</p>
                <div className="overflow-auto"><table className="w-full text-right text-sm"><thead><tr className="[&_th]:p-2"><th>현재가</th><th>등락률</th><th>누적 거래량</th><th>수신 시각</th></tr></thead><tbody>{ticks.map((tick, index) => <tr key={index} className="border-t border-hairline [&_td]:p-2"><td>{tick.currentPrice.toLocaleString()}</td><td>{tick.changeRate}%</td><td>{tick.volume.toLocaleString()}</td><td>{tick.receivedAt}</td></tr>)}</tbody></table></div>
                {!ticks.length && <p className="p-5 text-sm text-muted">새 시세 수신을 기다리고 있습니다.</p>}
            </section>
        </div>
        <aside className="rounded-lg border border-hairline bg-canvas p-3"><h2 className="font-bold">실시간 호가</h2>{!hoga && <p className="mt-4 text-xs text-muted">현재 제공된 호가가 없습니다. 실시간 수신 시 표시됩니다.</p>}
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
