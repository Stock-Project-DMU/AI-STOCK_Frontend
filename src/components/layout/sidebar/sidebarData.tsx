import { ClockIcon, HeartIcon, UserIcon } from "@/components/icons/Icon";
import type {
    Holding,
    SidebarStockItem,
    SidebarTab,
} from "./types";

export const SIDEBAR_TABS: SidebarTab[] = [
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

export const HOLDINGS: Holding[] = [
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

export const WATCHLIST: SidebarStockItem[] = [
    {
        name: "LG전자",
        meta: "066570",
        priceValue: 120_500,
        rate: "-0.85%",
    },
    {
        name: "현대자동차",
        meta: "005380",
        priceValue: 220_000,
        rate: "+2.10%",
    },
    {
        name: "카카오",
        meta: "035720",
        priceValue: 85_400,
        rate: "-1.20%",
    },
];

export const RECENT_STOCKS: SidebarStockItem[] = [
    {
        name: "포스코",
        meta: "005490",
        priceValue: 350_000,
        rate: "-1.10%",
    },
    {
        name: "현대제철",
        meta: "005380",
        priceValue: 150_000,
        rate: "+0.90%",
    },
    {
        name: "LG화학",
        meta: "051910",
        priceValue: 700_000,
        rate: "-0.95%",
    },
];

export const KRW_BALANCES = [80_000_000, 6_066_700];
