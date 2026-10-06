import type { PortfolioProjection } from "@/lib/api/ai";
import { formatAnnualizedRate, formatMonthlyRate, formatMonths, formatYearMonthDot } from "../utils/simulation";
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
    const { reachMonths, reachDate, achievableWithinPeriod, excludedStockNames } = projection;
    // 서버 계산 곡선은 최대 30년이라, 도달 시점이 없으면 30년 안에 도달하지 못한다는 뜻이다.
    const reachText = reachMonths === null || reachDate === null ? null
        : reachMonths === 0 ? `이미 도달 (${formatYearMonthDot(reachDate)})`
        : `${formatMonths(reachMonths)} 후 (${formatYearMonthDot(reachDate)})`;

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

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-surface-soft px-4 py-3 text-sm">
                <div className="col-span-2 min-w-0">
                    <dt className="text-xs text-muted">목표 도달 예상</dt>
                    <dd className={`num mt-0.5 font-bold ${reachText ? "text-ink" : "text-red-600"}`}>
                        {reachText ?? "기간 내 도달 불가"}
                        {!reachText && <span className="ml-1.5 text-xs font-normal text-muted">30년 안에 목표 금액에 닿지 않음</span>}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-muted">월 성장률(보수적)</dt>
                    <dd className="num mt-0.5 font-semibold text-ink">
                        월 {formatMonthlyRate(projection.monthlyGrowthRate)}
                        <span className="ml-1 font-normal text-muted">(연 {formatAnnualizedRate(projection.monthlyGrowthRate)})</span>
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-muted">현금 비중</dt>
                    <dd className="num mt-0.5 font-semibold text-ink">{projection.cashWeight.toFixed(1)}%</dd>
                </div>
                {excludedStockNames.length > 0 && (
                    <div className="col-span-2 min-w-0">
                        <dt className="text-xs text-muted">제외 종목</dt>
                        <dd className="mt-0.5 font-semibold text-ink">
                            {excludedStockNames.length}개 종목 제외됨
                            <span className="ml-1.5 text-xs font-normal text-muted">시세 이력이 1년 미만이라 예수금으로 돌림 · {excludedStockNames.join(", ")}</span>
                        </dd>
                    </div>
                )}
            </dl>

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
        </section>
    );
}
