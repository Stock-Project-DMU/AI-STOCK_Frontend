import Link from "next/link";
import { ClockIcon } from "@/components/icons/Icon";
import { FavoriteButton } from "@/components/common/Button";
import type { SidebarStockItem, FavoriteActions } from "./types";
import EmptyTab from "./EmptyTab";
import { formatWon, getRateColorClass } from "./format";

type StockListPanelProps = {
    emptyMessage: string;
    items: SidebarStockItem[];
    variant: "watchlist" | "recent";
    favorites: FavoriteActions;
    actionError: string;
};

export default function StockListPanel({
    emptyMessage,
    items,
    variant,
    favorites,
    actionError,
}: StockListPanelProps) {
    if (items.length === 0) {
        return <EmptyTab message={emptyMessage} />;
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            {actionError && <p role="alert" className="p-3 text-sm text-red-500">{actionError}</p>}
            <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                    <StockListRow
                        key={`${variant}-${item.meta}`}
                        item={item}
                        variant={variant}
                        favorites={favorites}
                    />
                ))}
            </div>
        </div>
    );
}

function StockListRow({
    item,
    variant,
    favorites,
}: {
    item: SidebarStockItem;
    variant: "watchlist" | "recent";
    favorites: FavoriteActions;
}) {
    return (
        <div className="relative grid cursor-pointer grid-cols-[52px_minmax(0,1fr)_128px] items-center border-b border-hairline-soft px-3.5 py-2.5 text-sm text-ink hover:bg-surface-soft">
            <Link href={`/stock-detail?code=${encodeURIComponent(item.meta)}`} prefetch={false} aria-label={`${item.name} 상세 보기`} className="absolute inset-0 z-0 rounded focus-visible:outline-2 focus-visible:outline-primary" />
            <div className={`flex items-center justify-center text-muted ${variant === "watchlist" ? "relative z-10" : "pointer-events-none"}`}>
                {variant === "watchlist" ? (
                    <FavoriteButton size="xl" favorite={favorites.favoriteCodes.has(item.meta)} disabled={favorites.pendingCodes.has(item.meta)} onToggle={next => favorites.onFavorite(item.meta, next)} />
                ) : (
                    <ClockIcon />
                )}
            </div>

            <div className="min-w-0">
                <div className="truncate text-sm font-medium leading-tight">
                    {item.name}
                </div>
                <div className="mt-1 truncate text-xs leading-tight text-muted">
                    {item.meta}
                </div>
            </div>

            <div className="text-right leading-tight">
                <div className="num whitespace-nowrap text-xs font-medium">
                    {item.rate === "시세 없음" ? "—" : formatWon(item.priceValue)}
                </div>
                <div className={`num mt-1 text-xs ${getRateColorClass(item.rate)}`}>
                    {item.rate}
                </div>
            </div>
        </div>
    );
}
