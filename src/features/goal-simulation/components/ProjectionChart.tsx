import type { SimulationPoint } from "@/lib/api/ai";
import { formatCompactWon, formatMonths, formatWon } from "../utils/simulation";

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

const chartWidth = 560;
const chartHeight = 300;
const padLeft = 58;
const padRight = 18;
const padTop = 18;
const padBottom = 38;
const plotWidth = chartWidth - padLeft - padRight;
const plotHeight = chartHeight - padTop - padBottom;

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
    const lastIndex = Math.max(1, points.length - 1);
    const xOf = (index: number) => padLeft + (index / lastIndex) * plotWidth;
    const yOf = (value: number) => padTop + plotHeight - (Math.min(value, maxValue) / maxValue) * plotHeight;

    const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xOf(index).toFixed(1)} ${yOf(point.value).toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${xOf(points.length - 1).toFixed(1)} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`;
    const targetY = yOf(targetAmount);
    const reachPoint = reachMonths !== null && reachMonths < points.length ? points[reachMonths] : null;
    const periodX = periodMonths !== null && periodMonths <= lastIndex ? xOf(periodMonths) : null;

    // 가로축 눈금: 2년 이상이면 정수 연 단위(최대 6칸), 그 아래는 개월 단위로 최대 6칸
    const useYears = lastIndex >= 24;
    const unit = useYears ? 12 : 1;
    const stepUnits = Math.max(1, Math.ceil(lastIndex / unit / 5));
    const ticks = Array.from({ length: Math.floor(lastIndex / (unit * stepUnits)) + 1 }, (_, step) => step * unit * stepUnits);

    return (
        <figure className="m-0">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-auto w-full" role="img" aria-label={`${label} 예상 자산 추이. 목표 ${formatWon(targetAmount)}${reachMonths !== null ? `, ${formatMonths(reachMonths)} 뒤 도달` : ", 30년 안에 도달하지 못함"}`}>
                {[0, 1, 2, 3, 4].map((line) => {
                    const y = padTop + (line / 4) * plotHeight;
                    return (
                        <g key={line}>
                            <line x1={padLeft} y1={y} x2={chartWidth - padRight} y2={y} stroke="var(--chart-grid)" />
                            <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="var(--chart-label)" fontSize="11">{formatCompactWon(maxValue * (1 - line / 4))}</text>
                        </g>
                    );
                })}
                {ticks.map((month) => (
                    <text key={month} x={xOf(month)} y={chartHeight - 12} textAnchor="middle" fill="var(--chart-label)" fontSize="11">
                        {month === 0 ? "현재" : useYears ? `${month / 12}년` : `${month}개월`}
                    </text>
                ))}

                <path d={areaPath} fill={softColor} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {periodX !== null && (
                    <g>
                        <line x1={periodX} y1={padTop} x2={periodX} y2={padTop + plotHeight} stroke="var(--chart-label)" strokeDasharray="3 4" />
                        <text x={periodX - 4} y={padTop + 12} textAnchor="end" fill="var(--chart-label)" fontSize="11">기한</text>
                    </g>
                )}

                <line x1={padLeft} y1={targetY} x2={chartWidth - padRight} y2={targetY} stroke="var(--market-up)" strokeWidth="1.5" strokeDasharray="6 5" />
                <text x={chartWidth - padRight} y={targetY - 6} textAnchor="end" fill="var(--market-up)" fontSize="11" fontWeight="600">목표 {formatCompactWon(targetAmount)}</text>

                {reachPoint && (
                    <circle cx={xOf(reachMonths!)} cy={yOf(reachPoint.value)} r="5" fill={color} stroke="white" strokeWidth="2" />
                )}
            </svg>
        </figure>
    );
}
