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
        <div className="border-t border-gray-300 bg-slate-50 px-3 py-4 text-sm font-semibold text-black">
            <div className="flex items-center justify-between">
                <span>원화</span>
                <span className="whitespace-nowrap">{formatWon(cashTotal)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span>평가액</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{formatWon(evaluationTotal)}</span>
                    <span className="text-[11px] font-normal text-red-500">
                        {formatSignedWon(profitTotal)} ({profitRate.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
