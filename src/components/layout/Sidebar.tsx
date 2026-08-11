"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { SidebarTabLabel } from "./sidebar/types";
import RailItem from "./sidebar/RailItem";
import SidebarPanelContent from "./sidebar/SidebarPanelContent";
import { SIDEBAR_TABS } from "./sidebar/sidebarData";
import { ChevronLeftIcon, ChevronRightSmallIcon } from "@/components/icons/Icon";
import { useSidebarPortfolio } from "./sidebar/useSidebarPortfolio";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [activeLabel, setActiveLabel] = useState<SidebarTabLabel>(
        SIDEBAR_TABS[0].label,

    );
    const portfolioData = useSidebarPortfolio();

    const activeTab =
        SIDEBAR_TABS.find((tab) => tab.label === activeLabel) ??
        SIDEBAR_TABS[0];

    const handleRailItemClick = (label: SidebarTabLabel) => {
        setActiveLabel(label);
        setIsOpen(true);
    };

    if (["/login", "/signup", "/find-id", "/find-password"].includes(pathname)) {
        return null;
    }

    return (
        <aside className="flex min-h-full shrink-0 justify-end border-l border-hairline bg-canvas text-xs text-body">
            <section
                id="portfolio-sidebar-panel"
                aria-hidden={!isOpen}
                className={`min-h-full overflow-hidden bg-canvas transition-[width] duration-300 ease-in-out ${
                    isOpen ? "w-[320px] border-l border-hairline" : "w-0"
                }`}
            >
                <div className="flex min-h-full w-[320px] min-w-[320px] flex-col">
                    <div className="flex h-14 items-center border-b border-hairline bg-surface-soft px-4 text-sm font-black text-ink">
                        <span>{activeTab.label}</span>
                    </div>

                    <SidebarPanelContent activeTab={activeTab} data={portfolioData} />
                </div>
            </section>

            <nav className="flex w-[68px] min-w-[68px] flex-col items-center bg-canvas">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="portfolio-sidebar-panel"
                    aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex h-14 w-full items-center justify-center border-b border-hairline text-sm font-bold text-muted hover:bg-surface-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)]"
                >
                    {isOpen ? <ChevronRightSmallIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
                </button>

                <div className="mt-5 flex w-full flex-col items-center gap-7">
                    {SIDEBAR_TABS.map((tab) => (
                        <RailItem
                            key={tab.label}
                            label={tab.label}
                            active={tab.label === activeLabel}
                            onClick={() => handleRailItemClick(tab.label)}
                        >
                            <div className="cursor-pointer">{tab.icon}</div>
                        </RailItem>
                    ))}
                </div>
            </nav>
        </aside>
    );
}
