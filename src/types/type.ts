import { ReactNode } from "react";

export type SidebarTab = {
    label: string;
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
