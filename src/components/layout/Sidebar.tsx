"use client";

import { type MouseEventHandler, type ReactNode, useState } from "react";
import {
    ClockIcon,
    EmptyPortfolioIcon,
    HeartIcon,
    UserIcon,
} from "@/components/icons/Icon";
import { SidebarTab, Holding } from "@/types/type";
import { FavoriteButton } from "../common/Button";

const HOLDINGS: Holding[] = [
    {
        name: "삼성전자",
        quantity: 10,
        amountValue: 1_917_000,
        profitValue: 100_000,
        rate: "+10.5%",
    },
    {
        name: "SK하이닉스",
        quantity: 10,
        amountValue: 10_040_000,
        profitValue: 70_000,
        rate: "+1.82%",
    },
    {
        name: "NAVER",
        quantity: 10,
        amountValue: 2_100_000,
        profitValue: 23_700,
        rate: "+16.3%",
    },
];

const KRW_BALANCES = [80_000_000, 6_066_700];
const wonFormatter = new Intl.NumberFormat("ko-KR");

function formatWon(value: number) {
    return `${wonFormatter.format(value)}원`;
}

function formatSignedWon(value: number) {
    return `${value >= 0 ? "+" : "-"}${formatWon(Math.abs(value))}`;
}

function RailItem({
    active = false,
    children,
    label,
    onClick,
}: {
    active?: boolean;
    children: ReactNode;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full flex-col items-center gap-1.5 px-1 text-center text-[11px] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-300 ${
                active ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
        >
            {children}
            <span className="whitespace-nowrap leading-none">{label}</span>
        </button>
    );
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const [activeLabel, setActiveLabel] = useState("내 투자");

    const sidebarTabs: SidebarTab[] = [
        {
            label: "내 투자",
            emptyMessage: "보유 종목이 없습니다.",
            icon: <UserIcon />,
        },
        {
            label: "관심",
            emptyMessage: "관심 종목이 없습니다.",
            icon: <HeartIcon />,
        },
        {
            label: "최근 본",
            emptyMessage: "최근 본 종목이 없습니다.",
            icon: <ClockIcon />,
        },
    ];
    const activeTab =
        sidebarTabs.find((tab) => tab.label === activeLabel) ?? sidebarTabs[0];
    const showPortfolio = activeTab.label === "내 투자";
    const cashTotal = KRW_BALANCES.reduce((sum, amount) => sum + amount, 0);
    const evaluationTotal = HOLDINGS.reduce(
        (sum, holding) => sum + holding.amountValue,
        0,
    );
    const profitTotal = HOLDINGS.reduce(
        (sum, holding) => sum + holding.profitValue,
        0,
    );
    const profitRate =
        evaluationTotal - profitTotal === 0
            ? 0
            : (profitTotal / (evaluationTotal - profitTotal)) * 100;

    const handleRailItemClick = (label: string) => {
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

                    {showPortfolio ? (
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto">
                                {HOLDINGS.map((holding) => (
                                    <HoldingRow
                                        key={holding.name}
                                        holding={holding}
                                    />
                                ))}
                            </div>

                            <PortfolioSummary
                                cashTotal={cashTotal}
                                evaluationTotal={evaluationTotal}
                                profitRate={profitRate}
                                profitTotal={profitTotal}
                            />
                        </div>
                    ) : (
                        <EmptyTab message={activeTab.emptyMessage} />
                    )}
                </div>
            </section>

            <nav className="flex w-14 min-w-14 flex-col items-center border-x border-gray-200 bg-white">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls="portfolio-sidebar-panel"
                    aria-label={isOpen ? "사이드바 닫기" : "사이드바 열기"}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex h-10 w-full items-center justify-center text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-400"
                >
                    {isOpen ? ">>" : "<<"}
                </button>

                <div className="mt-4 flex w-full flex-col items-center gap-7">
                    {sidebarTabs.map((s) => (
                        <RailItem
                            key={s.label}
                            label={s.label}
                            active={s.label === activeLabel}
                            onClick={() => handleRailItemClick(s.label)}
                        >
                            {s.icon}
                        </RailItem>
                    ))}
                </div>
            </nav>
        </aside>
    );
}

function HoldingRow({ holding }: { holding: Holding }) {
    return (
        <div className="grid grid-cols-[48px_minmax(0,1fr)_122px] border-b border-gray-300 px-3 py-3 text-sm text-gray-900">
            <div className="flex items-center justify-center text-gray-500">
                <FavoriteButton size="xl" />
            </div>

            <div className="min-w-0">
                <div className="truncate text-[13px] font-medium leading-tight">
                    {holding.name}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-gray-500">
                    {holding.quantity}주
                </div>
            </div>

            <div className="text-right leading-tight">
                <div className="whitespace-nowrap text-[12px] font-medium">
                    {formatWon(holding.amountValue)}
                </div>
                <div className="mt-1 text-[11px] text-red-500">
                    {holding.rate}
                </div>
            </div>
        </div>
    );
}

function EmptyTab({ message }: { message: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-gray-900">
            <EmptyPortfolioIcon />
            <p>{message}</p>
        </div>
    );
}

function PortfolioSummary({
    cashTotal,
    evaluationTotal,
    profitRate,
    profitTotal,
}: {
    cashTotal: number;
    evaluationTotal: number;
    profitRate: number;
    profitTotal: number;
}) {
    return (
        <div className="border-t border-gray-300 bg-slate-50 px-3 py-4 text-sm font-semibold text-black">
            <div className="flex items-center justify-between">
                <span>원화</span>
                <span className="whitespace-nowrap">{formatWon(cashTotal)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <span>평가액</span>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span>{formatWon(evaluationTotal)}</span>
                    <span className="text-[11px] font-normal text-red-500">
                        {formatSignedWon(profitTotal)} ({profitRate.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
