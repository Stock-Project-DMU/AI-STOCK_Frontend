import { ClockIcon } from "@/components/icons/Icon";
import { FavoriteButton } from "@/components/common/Button";
import type { SidebarStockItem } from "./types";
import EmptyTab from "./EmptyTab";
import { formatWon, getRateColorClass } from "./format";

type StockListPanelProps = {
    emptyMessage: string;
    items: SidebarStockItem[];
    variant: "watchlist" | "recent";
};

export default function StockListPanel({
    emptyMessage,
    items,
    variant,
}: StockListPanelProps) {
    if (items.length === 0) {
        return <EmptyTab message={emptyMessage} />;
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                    <StockListRow
                        key={`${variant}-${item.name}`}
                        item={item}
                        variant={variant}
                    />
                ))}
            </div>
        </div>
    );
}

function StockListRow({
    item,
    variant,
}: {
    item: SidebarStockItem;
    variant: "watchlist" | "recent";
}) {
    return (
        <div className="grid cursor-pointer grid-cols-[52px_minmax(0,1fr)_128px] items-center border-b border-hairline-soft px-3.5 py-2.5 text-sm text-ink hover:bg-surface-soft">
            <div className="flex items-center justify-center text-muted">
                {variant === "watchlist" ? (
                    <FavoriteButton defaultFavorite size="xl" />
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
                    {formatWon(item.priceValue)}
                </div>
                <div className={`num mt-1 text-xs ${getRateColorClass(item.rate)}`}>
                    {item.rate}
                </div>
            </div>
        </div>
    );
}
