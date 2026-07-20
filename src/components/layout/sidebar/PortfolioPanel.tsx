import { HOLDINGS, KRW_BALANCES } from "./sidebarData";
import HoldingRow from "./HoldingRow";
import PortfolioSummary from "./PortfolioSummary";

export default function PortfolioPanel() {
    const cashTotal = KRW_BALANCES.reduce((sum, amount) => sum + amount, 0);
    const evaluationTotal = HOLDINGS.reduce(
        (sum, holding) => sum + holding.amountValue,
        0,
    );
    const profitTotal = HOLDINGS.reduce(
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
                {HOLDINGS.map((holding) => (
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
