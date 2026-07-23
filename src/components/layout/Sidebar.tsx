"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { SidebarTabLabel } from "./sidebar/types";
import RailItem from "./sidebar/RailItem";
import SidebarPanelContent from "./sidebar/SidebarPanelContent";
import { SIDEBAR_TABS } from "./sidebar/sidebarData";

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [activeLabel, setActiveLabel] = useState<SidebarTabLabel>(
        SIDEBAR_TABS[0].label,

    );

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
        <aside className="flex min-h-full shrink-0 justify-end border-l border-white/10 bg-[#07111e] text-xs text-slate-300">
            <section
                id="portfolio-sidebar-panel"
                aria-hidden={!isOpen}
                className={`min-h-full overflow-hidden bg-[#0b1726] transition-[width] duration-300 ease-in-out ${
                    isOpen ? "w-[300px] border-l border-white/10" : "w-0"
                }`}
            >
                <div className="flex min-h-full w-[300px] min-w-[300px] flex-col">
                    <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[#081321] px-4 text-sm font-black text-white">
                        <span>{activeTab.label}</span>
                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] tracking-wider text-emerald-300">PORTFOLIO</span>
                    </div>

                    <SidebarPanelContent activeTab={activeTab} />
                </div>
            </section>

            <nav className="flex w-[60px] min-w-[60px] flex-col items-center bg-[#07111e]">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="portfolio-sidebar-panel"
                    aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex h-14 w-full items-center justify-center border-b border-white/10 text-xs font-bold text-slate-500 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)]"
                >
                    {isOpen ? "→" : "←"}
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
