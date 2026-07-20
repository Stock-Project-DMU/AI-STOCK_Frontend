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
        <div className="cursor-pointer grid grid-cols-[48px_minmax(0,1fr)_122px] border-b border-gray-300 px-3 py-3 text-sm text-gray-900">
            <div className="flex items-center justify-center text-gray-500">
                {variant === "watchlist" ? (
                    <FavoriteButton defaultFavorite size="xl" />
                ) : (
                    <ClockIcon />
                )}
            </div>

            <div className="min-w-0">
                <div className="truncate text-[13px] font-medium leading-tight">
                    {item.name}
                </div>
                <div className="mt-1 truncate text-[11px] leading-tight text-gray-500">
                    {item.meta}
                </div>
            </div>

            <div className="text-right leading-tight">
                <div className="whitespace-nowrap text-[12px] font-medium">
                    {formatWon(item.priceValue)}
                </div>
                <div className={`mt-1 text-[11px] ${getRateColorClass(item.rate)}`}>
                    {item.rate}
                </div>
            </div>
        </div>
    );
}
