import { TrendUpIcon, SparkleIcon } from "@/components/icons/Icon";
import { LIVE_TRENDS, MARKET_INDEXES } from "../constants/marketData";

type MarketDashboardProps = {
    side?: "left" | "right";
};

export default function MarketDashboard({ side = "right" }: MarketDashboardProps) {
    return (
        <aside
            className={`hidden w-[280px] shrink-0 bg-canvas p-4 xl:block ${
                side === "left" ? "border-r border-hairline" : "border-l border-hairline"
            }`}
        >
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink"><TrendUpIcon className="h-3.5 w-3.5" /> 시장 현황</h2>
                <span className="theme-accent-soft theme-accent-text rounded-pill px-2 py-1 text-[12px] font-black">데모</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-md border border-hairline border-t-2 border-t-primary">
                {MARKET_INDEXES.map(([name, value, change, color]) => (
                    <div key={name} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center border-b border-hairline-soft px-3 py-2.5 text-[12px] last:border-0">
                        <strong className="whitespace-nowrap text-ink">{name}</strong>
                        <span className="whitespace-nowrap text-right font-semibold text-ink">{value}</span>
                        <span className={`ml-1 whitespace-nowrap ${color}`}>{change}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-md border border-hairline p-4">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink"><SparkleIcon className="h-3.5 w-3.5" /> 샘플 트렌드</h3>
                <ol className="mt-3 space-y-1">
                    {LIVE_TRENDS.map(([trend, badge], index) => (
                        <li key={trend} className="grid grid-cols-[18px_1fr_auto] items-center border-b border-hairline-soft py-2 text-xs last:border-0">
                            <strong className={index < 3 ? "text-primary" : "text-muted"}>{index + 1}</strong>
                            <span className="text-ink">{trend}</span>
                            {badge && (
                                <span className={`rounded-sm px-1.5 py-0.5 text-[12px] ${badge === "HOT" ? "bg-primary/10 text-primary" : "theme-accent-soft theme-accent-text"}`}>{badge}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>

            <div className="mt-4 rounded-md border border-hairline p-4">
                <h3 className="text-sm font-bold text-ink">시장 심리 지수</h3>
                <div className="mt-4 flex items-end justify-between">
                    <span className="text-xs font-semibold text-emerald-600">탐욕 72%</span>
                    <strong className="text-2xl text-emerald-500">72<span className="ml-1 text-xs text-muted-soft">/100</span></strong>
                </div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                    <span className="w-[72%] bg-emerald-500" />
                    <span className="flex-1 bg-red-500" />
                </div>
                <div className="mt-2 flex justify-between text-[12px]">
                    <span className="text-emerald-600">극도의 탐욕</span>
                    <span className="text-red-500">극도의 공포</span>
                </div>
            </div>
        </aside>
    );
}
