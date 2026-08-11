import HoldingRow from "./HoldingRow";
import PortfolioSummary from "./PortfolioSummary";
import type { Holding } from "./types";

export default function PortfolioPanel({ holdings, balances }: { holdings: Holding[]; balances: number[] }) {
    const cashTotal = balances.reduce((sum, amount) => sum + amount, 0);
    const evaluationTotal = holdings.reduce(
        (sum, holding) => sum + holding.amountValue,
        0,
    );
    const profitTotal = holdings.reduce(
        (sum, holding) => sum + holding.profitValue,
        0,
    );
    const profitRate =
        evaluationTotal - profitTotal === 0
            ? 0
            : (profitTotal / (evaluationTotal - profitTotal)) * 100;

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                {holdings.map((holding) => (
                    <HoldingRow key={holding.name} holding={holding} />
                ))}
            </div>

            <PortfolioSummary
                cashTotal={cashTotal}
                evaluationTotal={evaluationTotal}
                profitRate={profitRate}
                profitTotal={profitTotal}
            />
        </div>
    );
}
