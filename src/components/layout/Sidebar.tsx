"use client";

import { useState } from "react";
import type { SidebarTabLabel } from "./sidebar/types";
import RailItem from "./sidebar/RailItem";
import SidebarPanelContent from "./sidebar/SidebarPanelContent";
import { SIDEBAR_TABS } from "./sidebar/sidebarData";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLabel, setActiveLabel] =
        useState<SidebarTabLabel>("내 투자");

    const activeTab =
        SIDEBAR_TABS.find((tab) => tab.label === activeLabel) ??
        SIDEBAR_TABS[0];

    const handleRailItemClick = (label: SidebarTabLabel) => {
        setActiveLabel(label);
        setIsOpen(true);
    };

    return (
        <aside className="flex min-h-full shrink-0 justify-end bg-white text-xs text-gray-700">
            <section
                id="portfolio-sidebar-panel"
                aria-hidden={!isOpen}
                className={`min-h-full overflow-hidden bg-white transition-[width] duration-300 ease-in-out ${
                    isOpen ? "w-[280px] border-l border-gray-300" : "w-0"
                }`}
            >
                <div className="flex min-h-full w-[280px] min-w-[280px] flex-col">
                    <div className="flex h-10 items-center bg-black px-3 text-base font-semibold text-white">
                        {activeTab.label}
                    </div>

                    <SidebarPanelContent activeTab={activeTab} />
                </div>
            </section>

            <nav className="flex w-14 min-w-14 flex-col items-center border-x border-gray-200 bg-white">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="portfolio-sidebar-panel"
                    aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="cursor-pointer flex h-10 w-full items-center justify-center text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-400"
                >
                    {isOpen ? ">>" : "<<"}
                </button>

                <div className="mt-4 flex w-full flex-col items-center gap-7">
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
