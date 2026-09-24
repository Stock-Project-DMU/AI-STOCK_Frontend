import HoldingRow from "./HoldingRow";
import PortfolioSummary from "./PortfolioSummary";
import type { Holding, FavoriteActions } from "./types";

export default function PortfolioPanel({ holdings, balances, favorites }: { holdings: Holding[]; balances: number[]; favorites: FavoriteActions }) {
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
                    <HoldingRow key={holding.stockCode ?? holding.name} holding={holding} favorites={favorites} />
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
