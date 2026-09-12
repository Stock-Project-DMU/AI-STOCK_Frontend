import { ReactNode } from "react";

export type SidebarTabLabel = "내 투자" | "관심" | "최근 본";

export type SidebarTab = {
    label: SidebarTabLabel;
    emptyMessage: string;
    icon: ReactNode;
};

export type Holding = {
    stockCode?: string;
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

export type FavoriteActions = {
    favoriteCodes: Set<string>;
    pendingCodes: Set<string>;
    onFavorite: (stockCode: string, favorite: boolean) => void;
};
