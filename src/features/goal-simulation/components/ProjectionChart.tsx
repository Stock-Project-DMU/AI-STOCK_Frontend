"use client";

import { useEffect, useRef, useState } from "react";
import type { SimulationPoint } from "@/lib/api/ai";
import { formatCompactWon, formatMonths, formatWon, formatYearMonth } from "../utils/simulation";

type ProjectionChartProps = {
    points: SimulationPoint[];
    targetAmount: number;
    // 왼쪽·오른쪽 차트가 같은 세로 눈금을 쓰도록 부모가 두 곡선의 최댓값을 넘겨준다
    maxValue: number;
    reachMonths: number | null;
    periodMonths: number | null;
    color: string;
    softColor: string;
    label: string;
};

// viewBox 너비를 실제 렌더링 너비(px)와 같게 맞춰 1 viewBox 단위 = 1px로 그린다. 고정 viewBox(560)를
// 늘리고 줄이면 좁은 화면에서 글자(11px)가 5~6px까지 작아지기 때문이다. 측정 전(SSR·첫 렌더)에는 기본 너비를 쓴다.
const DEFAULT_WIDTH = 560;
const MIN_WIDTH = 280;
// 세로는 최대 300px — 2열 비교에서 넓어져도 과도하게 커지지 않고, 좁은 화면에서는 조금 낮춘다.
const HEIGHT = 300;
const NARROW_HEIGHT = 240;
const NARROW_BREAKPOINT = 420;
const padLeft = 58;
const padRight = 18;
const padTop = 18;
const padBottom = 38;
const FONT_SIZE = 11;
const HIT_RADIUS = 9;
const TOOLTIP_WIDTH = 132;
const TOOLTIP_HEIGHT = 42;

export default function ProjectionChart({
    points,
    targetAmount,
    maxValue,
    reachMonths,
    periodMonths,
    color,
    softColor,
    label,
}: ProjectionChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(DEFAULT_WIDTH);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => {
            const width = Math.round(entry.contentRect.width);
            if (width > 0) setChartWidth(Math.max(MIN_WIDTH, width));
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const chartHeight = chartWidth < NARROW_BREAKPOINT ? NARROW_HEIGHT : HEIGHT;
    const plotWidth = chartWidth - padLeft - padRight;
    const plotHeight = chartHeight - padTop - padBottom;

    const lastIndex = Math.max(1, points.length - 1);
    const xOf = (index: number) => padLeft + (index / lastIndex) * plotWidth;
    const yOf = (value: number) => padTop + plotHeight - (Math.min(value, maxValue) / maxValue) * plotHeight;

    const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xOf(index).toFixed(1)} ${yOf(point.value).toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${xOf(points.length - 1).toFixed(1)} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`;
    const targetY = yOf(targetAmount);
    const reachPoint = reachMonths !== null && reachMonths < points.length ? points[reachMonths] : null;
    const periodX = periodMonths !== null && periodMonths <= lastIndex ? xOf(periodMonths) : null;

    // 가로축 눈금: 2년 이상이면 정수 연 단위(최대 6칸), 그 아래는 개월 단위로 최대 6칸. 좁은 화면에서는 최대 4칸으로 줄여 라벨이 겹치지 않게 한다.
    const maxTicks = chartWidth < NARROW_BREAKPOINT ? 3 : 5;
    const useYears = lastIndex >= 24;
    const unit = useYears ? 12 : 1;
    const stepUnits = Math.max(1, Math.ceil(lastIndex / unit / maxTicks));
    const ticks = Array.from({ length: Math.floor(lastIndex / (unit * stepUnits)) + 1 }, (_, step) => step * unit * stepUnits);

    const hoverPoint = hoverIndex !== null ? points[hoverIndex] : null;
    const hoverX = hoverIndex !== null ? xOf(hoverIndex) : 0;
    const hoverY = hoverPoint ? yOf(hoverPoint.value) : 0;
    // 말풍선은 점 위쪽에 두되, 플롯 영역 밖으로 나가지 않게 좌우·상하를 고정한다.
    const tooltipX = Math.min(Math.max(hoverX - TOOLTIP_WIDTH / 2, padLeft), chartWidth - padRight - TOOLTIP_WIDTH);
    const tooltipY = hoverY - TOOLTIP_HEIGHT - 12 < padTop ? hoverY + 12 : hoverY - TOOLTIP_HEIGHT - 12;

    return (
        <figure ref={containerRef} className="m-0 w-full max-h-[300px]">
            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-auto w-full"
                style={{ maxHeight: `${HEIGHT}px` }}
                role="img"
                aria-label={`${label} 예상 자산 추이. 목표 ${formatWon(targetAmount)}${reachMonths !== null ? `, ${formatMonths(reachMonths)} 뒤 도달` : ", 30년 안에 도달하지 못함"}`}
                onPointerLeave={() => setHoverIndex(null)}
            >
                {[0, 1, 2, 3, 4].map((line) => {
                    const y = padTop + (line / 4) * plotHeight;
                    return (
                        <g key={line}>
                            <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="var(--chart-grid)" />
                            <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="var(--chart-label)" fontSize={FONT_SIZE}>{formatCompactWon(maxValue * (1 - line / 4))}</text>
                        </g>
                    );
                })}
                {ticks.map((month) => (
                    <text key={month} x={xOf(month)} y={chartHeight - 12} textAnchor="middle" fill="var(--chart-label)" fontSize={FONT_SIZE}>
                        {month === 0 ? "현재" : useYears ? `${month / 12}년` : `${month}개월`}
                    </text>
                ))}

                <path d={areaPath} fill={softColor} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {periodX !== null && (
                    <g>
                        <line x1={periodX} y1={padTop} x2={periodX} y2={padTop + plotHeight} stroke="var(--chart-label)" strokeDasharray="3 4" />
                        <text x={periodX - 4} y={padTop + 12} textAnchor="end" fill="var(--chart-label)" fontSize={FONT_SIZE}>기한</text>
                    </g>
                )}

                <line x1={padLeft} y1={targetY} x2={chartWidth - padRight} y2={targetY} stroke="var(--market-up)" strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={chartWidth - padRight} y={targetY - 6} textAnchor="end" fill="var(--market-up)" fontSize={FONT_SIZE} fontWeight="600">목표 {formatCompactWon(targetAmount)}</text>

                {reachPoint && (
                    <circle cx={xOf(reachMonths!)} cy={yOf(reachPoint.value)} r="5" fill={color} stroke="white" strokeWidth="2" />
                )}

                {hoverPoint && (
                    <g pointerEvents="none">
                        <line x1={hoverX} y1={padTop} x2={hoverX} y2={padTop + plotHeight} stroke={color} strokeOpacity="0.35" />
                        <circle cx={hoverX} cy={hoverY} r="4" fill="white" stroke={color} strokeWidth="2" />
                        <rect x={tooltipX} y={tooltipY} width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT} rx="6" fill="var(--color-ink)" fillOpacity="0.92" />
                        <text x={tooltipX + 10} y={tooltipY + 17} fill="white" fillOpacity="0.75" fontSize={FONT_SIZE}>
                            {formatYearMonth(hoverPoint.date)}
                            {hoverIndex === reachMonths ? " · 목표 도달" : ""}
                        </text>
                        <text x={tooltipX + 10} y={tooltipY + 33} fill="white" fontSize="12" fontWeight="700">{formatWon(hoverPoint.value)}</text>
                    </g>
                )}

                {/* 점마다 투명한 원을 깔아 hover(터치 시 탭) 대상으로 쓴다. 점이 촘촘하면 원이 겹쳐 뒤에 그린 점이 우선한다. */}
                {points.map((point, index) => (
                    <circle
                        key={point.date}
                        cx={xOf(index)}
                        cy={yOf(point.value)}
                        r={HIT_RADIUS}
                        fill="transparent"
                        onPointerEnter={() => setHoverIndex(index)}
                    />
                ))}
            </svg>
        </figure>
    );
}
