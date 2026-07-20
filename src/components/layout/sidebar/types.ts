import { ReactNode } from "react";

export type SidebarTabLabel = "내 투자" | "관심" | "최근 본";

export type SidebarTab = {
    label: SidebarTabLabel;
    emptyMessage: string;
    icon: ReactNode;
};

export type Holding = {
    name: string;
    quantity: number;
    amountValue: number;
    profitValue: number;
    rate: string;
};

export type SidebarStockItem = {
    name: string;
    meta: string;
    priceValue: number;
    rate: string;
};
