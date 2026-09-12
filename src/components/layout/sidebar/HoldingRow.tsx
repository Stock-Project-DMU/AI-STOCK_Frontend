import Link from "next/link";
import { FavoriteButton } from "@/components/common/Button";
import type { Holding, FavoriteActions } from "./types";
import { formatWon, getRateColorClass } from "./format";

type HoldingRowProps = {
    holding: Holding;
    favorites: FavoriteActions;
};

export default function HoldingRow({ holding, favorites }: HoldingRowProps) {
    return (
        <div className="relative grid cursor-pointer grid-cols-[52px_minmax(0,1fr)_128px] items-center border-b border-hairline-soft px-3.5 py-2.5 text-sm text-ink hover:bg-surface-soft">
            {holding.stockCode && <Link href={`/stock-detail?code=${encodeURIComponent(holding.stockCode)}`} prefetch={false} aria-label={`${holding.name} 상세 보기`} className="absolute inset-0 z-0 rounded focus-visible:outline-2 focus-visible:outline-primary" />}
            <div className="relative z-10 flex items-center justify-center text-muted">
                <FavoriteButton size="xl" favorite={favorites.favoriteCodes.has(holding.stockCode ?? "")} disabled={!holding.stockCode || favorites.pendingCodes.has(holding.stockCode)} onToggle={next => { if (holding.stockCode) favorites.onFavorite(holding.stockCode, next); }} />
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
