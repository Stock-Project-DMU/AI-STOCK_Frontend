import { formatSignedWon, formatWon } from "./format";

type PortfolioSummaryProps = {
    cashTotal: number;
    evaluationTotal: number;
    profitRate: number;
    profitTotal: number;
};

export default function PortfolioSummary({
    cashTotal,
    evaluationTotal,
    profitRate,
    profitTotal,
}: PortfolioSummaryProps) {
    return (
        <div className="border-t border-hairline bg-surface-soft px-4 py-3.5 text-sm font-semibold text-ink">
            <div className="flex items-center justify-between">
                <span>원화</span>
                <span className="num whitespace-nowrap">{formatWon(cashTotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span>평가액</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="num">{formatWon(evaluationTotal)}</span>
                    <span className={`num text-xs font-bold ${profitTotal >= 0 ? "text-up" : "text-down"}`}>
                        {formatSignedWon(profitTotal)} ({profitRate.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
