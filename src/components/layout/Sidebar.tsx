"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { SidebarTabLabel } from "./sidebar/types";
import RailItem from "./sidebar/RailItem";
import SidebarPanelContent from "./sidebar/SidebarPanelContent";
import { SIDEBAR_TABS } from "./sidebar/sidebarData";
import { ChevronLeftIcon } from "@/components/icons/Icon";
import { useSidebarPortfolio } from "./sidebar/useSidebarPortfolio";
import { useAuthGuard } from "@/components/auth/AuthGuardProvider";

export default function Sidebar() {
    const { requireLogin } = useAuthGuard();
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
        if (!requireLogin()) return;
        setActiveLabel(label);
        setIsOpen(true);
    };

    const handleSidebarToggle = () => {
        if (!isOpen && !requireLogin()) return;
        setIsOpen((prev) => !prev);
    };

    if (["/login", "/signup", "/find-id", "/find-password"].includes(pathname)) {
        return null;
    }

    return (
        <aside className="flex min-h-full shrink-0 justify-end border-l border-hairline bg-canvas text-xs text-body md:sticky md:top-[72px] md:h-[calc(100vh-72px)] md:min-h-0 md:self-start">
            <section
                id="portfolio-sidebar-panel"
                aria-hidden={!isOpen}
                className={`min-h-full overflow-hidden bg-canvas transition-[width,opacity,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isOpen
                        ? "w-[320px] border-l border-hairline opacity-100 shadow-[-12px_0_32px_rgba(10,11,13,0.06)]"
                        : "pointer-events-none w-0 opacity-0"
                }`}
            >
                <div
                    className={`flex min-h-full w-[320px] min-w-[320px] flex-col transform-gpu transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                        isOpen ? "translate-x-0 opacity-100 delay-75" : "translate-x-4 opacity-0"
                    }`}
                >
                    <div className="flex h-14 items-center border-b border-hairline bg-surface-soft px-4 text-sm font-black text-ink">
                        <span>{activeTab.label}</span>
                    </div>

                    <div key={activeLabel} className="sidebar-content-enter flex min-h-0 flex-1 flex-col">
                        <SidebarPanelContent activeTab={activeTab} data={portfolioData} />
                    </div>
                </div>
            </section>

            <nav className="flex w-[68px] min-w-[68px] flex-col items-center bg-canvas">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="portfolio-sidebar-panel"
                    aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                    onClick={handleSidebarToggle}
                    className="flex h-14 w-full items-center justify-center border-b border-hairline text-sm font-bold text-muted transition-none hover:bg-surface-soft hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)]"
                >
                    <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-[transform,background-color,color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                            isOpen
                                ? "rotate-180 bg-primary/10 text-primary shadow-[0_4px_12px_rgba(0,82,255,0.12)]"
                                : ""
                        }`}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </span>
                </button>

                <div className="mt-5 flex w-full flex-col items-center gap-7">
                    {SIDEBAR_TABS.map((tab) => (
                        <RailItem
                            key={tab.label}
                            label={tab.label}
                            active={isOpen && tab.label === activeLabel}
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
