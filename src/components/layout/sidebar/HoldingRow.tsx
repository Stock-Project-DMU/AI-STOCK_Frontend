import { FavoriteButton } from "@/components/common/Button";
import type { Holding } from "./types";
import { formatWon, getRateColorClass } from "./format";

type HoldingRowProps = {
    holding: Holding;
};

export default function HoldingRow({ holding }: HoldingRowProps) {
    return (
        <div className="grid cursor-pointer grid-cols-[52px_minmax(0,1fr)_128px] items-center border-b border-hairline-soft px-3.5 py-2.5 text-sm text-ink hover:bg-surface-soft">
            <div className="flex items-center justify-center text-muted">
                <FavoriteButton size="xl" />
            </div>

            <div className="min-w-0">
                <div className="truncate text-sm font-medium leading-tight">
                    {holding.name}
                </div>
                <div className="mt-1 text-xs leading-tight text-muted">
                    {holding.quantity}주
                </div>
            </div>

            <div className="text-right leading-tight">
                <div className="num whitespace-nowrap text-xs font-medium">
                    {formatWon(holding.amountValue)}
                </div>
                <div className={`num mt-1 text-xs ${getRateColorClass(holding.rate)}`}>
                    {holding.rate}
                </div>
            </div>
        </div>
    );
}
