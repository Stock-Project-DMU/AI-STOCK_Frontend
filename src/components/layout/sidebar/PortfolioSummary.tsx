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
        <div className="border-t border-white/10 bg-[#07111e] px-4 py-5 text-sm font-semibold text-slate-200">
            <div className="flex items-center justify-between">
                <span>원화</span>
                <span className="whitespace-nowrap">{formatWon(cashTotal)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span>평가액</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{formatWon(evaluationTotal)}</span>
                    <span className="text-[11px] font-bold text-red-400">
                        {formatSignedWon(profitTotal)} ({profitRate.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
