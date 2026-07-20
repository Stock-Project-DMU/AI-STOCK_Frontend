import { FavoriteButton } from "@/components/common/Button";
import type { Holding } from "./types";
import { formatWon, getRateColorClass } from "./format";

type HoldingRowProps = {
    holding: Holding;
};

export default function HoldingRow({ holding }: HoldingRowProps) {
    return (
        <div className="cursor-pointer grid grid-cols-[48px_minmax(0,1fr)_122px] border-b border-gray-300 px-3 py-3 text-sm text-gray-900">
            <div className="flex items-center justify-center text-gray-500">
                <FavoriteButton size="xl" />
            </div>

            <div className="min-w-0">
                <div className="truncate text-[13px] font-medium leading-tight">
                    {holding.name}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-gray-500">
                    {holding.quantity}주
                </div>
            </div>

            <div className="text-right leading-tight">
                <div className="whitespace-nowrap text-[12px] font-medium">
                    {formatWon(holding.amountValue)}
                </div>
                <div className={`mt-1 text-[11px] ${getRateColorClass(holding.rate)}`}>
                    {holding.rate}
                </div>
            </div>
        </div>
    );
}
