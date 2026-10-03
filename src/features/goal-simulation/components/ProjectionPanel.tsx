import type { PortfolioProjection } from "@/lib/api/ai";
import { formatMonthlyRate, formatMonths, formatYearMonth } from "../utils/simulation";
import ProjectionChart from "./ProjectionChart";

type ProjectionPanelProps = {
    title: string;
    description: string;
    projection: PortfolioProjection;
    targetAmount: number;
    periodMonths: number | null;
    maxValue: number;
    color: string;
    softColor: string;
};

export default function ProjectionPanel({
    title,
    description,
    projection,
    targetAmount,
    periodMonths,
    maxValue,
    color,
    softColor,
}: ProjectionPanelProps) {
    const { reachMonths, reachDate, achievableWithinPeriod } = projection;

    return (
        <section className="flex min-w-0 flex-col rounded-lg border border-hairline bg-canvas p-4 sm:p-5" aria-label={title}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                        <i className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                        {title}
                    </h2>
                    <p className="mt-1 text-xs text-muted">{description}</p>
                </div>
                {achievableWithinPeriod !== null && (
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${achievableWithinPeriod ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-600"}`}>
                        {achievableWithinPeriod ? "기한 내 달성 가능" : "기한 내 달성 어려움"}
                    </span>
                )}
            </div>

            <div className="mt-4">
                {reachMonths !== null && reachDate ? (
                    <p className="text-sm text-body">
                        목표 도달 예상
                        <strong className="num ml-2 text-xl font-bold text-ink">{formatYearMonth(reachDate)}</strong>
                        <span className="ml-2 text-muted">{reachMonths === 0 ? "이미 도달" : `${formatMonths(reachMonths)} 뒤`}</span>
                    </p>
                ) : (
                    <p className="text-sm font-semibold text-red-600">현재 조건으로는 도달이 어렵습니다</p>
                )}
                <p className="mt-1 text-xs text-muted">포트폴리오 월 성장률(보수적) {formatMonthlyRate(projection.monthlyGrowthRate)}</p>
            </div>

            <div className="mt-3">
                <ProjectionChart
                    points={projection.points}
                    targetAmount={targetAmount}
                    maxValue={maxValue}
                    reachMonths={reachMonths}
                    periodMonths={periodMonths}
                    color={color}
                    softColor={softColor}
                    label={title}
                />
            </div>

            <table className="mt-3 w-full text-sm">
                <caption className="sr-only">{title} 구성</caption>
                <thead>
                    <tr className="border-b border-hairline text-left text-xs text-muted">
                        <th scope="col" className="py-2 font-medium">종목</th>
                        <th scope="col" className="py-2 text-right font-medium">비중</th>
                        <th scope="col" className="py-2 text-right font-medium">월 성장률</th>
                    </tr>
                </thead>
                <tbody>
                    {projection.allocations.map((allocation) => (
                        <tr key={allocation.stockCode} className="border-b border-hairline/60">
                            <td className="py-2 text-ink">
                                {allocation.stockName}
                                <span className="ml-1.5 text-xs text-muted">{allocation.stockCode}</span>
                            </td>
                            <td className="num py-2 text-right text-ink">{allocation.weight.toFixed(1)}%</td>
                            <td className="num py-2 text-right text-body">{formatMonthlyRate(allocation.monthlyGrowthRate)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="py-2 text-ink">예수금(현금)</td>
                        <td className="num py-2 text-right text-ink">{projection.cashWeight.toFixed(1)}%</td>
                        <td className="num py-2 text-right text-body">0.00%</td>
                    </tr>
                </tbody>
            </table>

            {projection.excludedStockNames.length > 0 && (
                <p className="mt-2 text-xs text-muted">
                    시세 이력이 1년 미만이라 계산에서 제외하고 예수금으로 돌린 종목: {projection.excludedStockNames.join(", ")}
                </p>
            )}
        </section>
    );
}
