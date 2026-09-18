import type { SidebarTab, FavoriteActions } from "./types";
import EmptyTab from "./EmptyTab";
import PortfolioPanel from "./PortfolioPanel";
import StockListPanel from "./StockListPanel";
import { RECENT_STOCKS, WATCHLIST } from "./sidebarData";
import type { Holding, SidebarStockItem } from "./types";

type SidebarPanelContentProps = {
    activeTab: SidebarTab;
    data: FavoriteActions & {
        holdings: Holding[];
        balances: number[];
        watchlist: SidebarStockItem[];
        recent: SidebarStockItem[];
        isLoading: boolean;
        error: string;
        actionError: string;
    };
};

export default function SidebarPanelContent({
    activeTab,
    data,
}: SidebarPanelContentProps) {
    if (data.isLoading) {
        return <div className="flex flex-1 items-center justify-center px-5 text-center text-sm font-semibold text-muted">투자 정보를 불러오는 중입니다.</div>;
    }

    if (data.error) {
        return <div role="alert" className="flex flex-1 items-center justify-center px-5 text-center text-sm font-semibold text-red-500">{data.error}</div>;
    }

    if (activeTab.label === "내 투자") {
        return <><ActionError message={data.actionError} /><PortfolioPanel holdings={data.holdings} balances={data.balances} favorites={data} /></>;
    }

    if (activeTab.label === "관심") {
        return (
            <StockListPanel
                emptyMessage={activeTab.emptyMessage}
                items={data.watchlist ?? WATCHLIST}
                variant="watchlist"
                favorites={data}
                actionError={data.actionError}
            />
        );
    }

    if (activeTab.label === "최근 본") {
        return (
            <StockListPanel
                emptyMessage={activeTab.emptyMessage}
                items={data.recent ?? RECENT_STOCKS}
                variant="recent"
                favorites={data}
                actionError={data.actionError}
            />
        );
    }

    return <EmptyTab message={activeTab.emptyMessage} />;
}

function ActionError({ message }: { message: string }) {
    return message ? <p role="alert" className="p-3 text-sm text-red-500">{message}</p> : null;
}
