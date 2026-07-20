import type { SidebarTab } from "./types";
import EmptyTab from "./EmptyTab";
import PortfolioPanel from "./PortfolioPanel";
import StockListPanel from "./StockListPanel";
import { RECENT_STOCKS, WATCHLIST } from "./sidebarData";

type SidebarPanelContentProps = {
    activeTab: SidebarTab;
};

export default function SidebarPanelContent({
    activeTab,
}: SidebarPanelContentProps) {
    if (activeTab.label === "내 투자") {
        return <PortfolioPanel />;
    }

    if (activeTab.label === "관심") {
        return (
            <StockListPanel
                emptyMessage={activeTab.emptyMessage}
                items={WATCHLIST}
                variant="watchlist"
            />
        );
    }

    if (activeTab.label === "최근 본") {
        return (
            <StockListPanel
                emptyMessage={activeTab.emptyMessage}
                items={RECENT_STOCKS}
                variant="recent"
            />
        );
    }

    return <EmptyTab message={activeTab.emptyMessage} />;
}
