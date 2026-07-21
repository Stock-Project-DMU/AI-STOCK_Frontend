import { LIVE_TRENDS, MARKET_INDEXES } from "../constants/marketData";

type MarketDashboardProps = {
    side?: "left" | "right";
};

export default function MarketDashboard({ side = "right" }: MarketDashboardProps) {
    return (
        <aside
            className={`hidden w-[300px] shrink-0 bg-white p-5 xl:block ${
                side === "left"
                    ? "border-r border-gray-300"
                    : "border-l border-gray-300"
            }`}
        >
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold">⌁ 시장 현황</h2><span className="theme-accent-soft theme-accent-text rounded-full px-2 py-1 text-[9px] font-black">DEMO</span></div>
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 border-t-2 border-t-black">
                {MARKET_INDEXES.map(([name, value, change, color]) => <div key={name} className="grid grid-cols-[72px_1fr_auto] items-center border-b border-gray-100 px-4 py-3 text-[11px] last:border-0"><strong>{name}</strong><span className="text-right font-semibold">{value}</span><span className={`ml-2 ${color}`}>{change}</span></div>)}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold">🔥 샘플 트렌드</h3>
                <ol className="mt-3 space-y-1">
                    {LIVE_TRENDS.map(([trend, badge], index) => <li key={trend} className="grid grid-cols-[18px_1fr_auto] items-center border-b border-gray-100 py-2 text-xs last:border-0"><strong className={index < 3 ? "text-red-500" : "text-gray-500"}>{index + 1}</strong><span>{trend}</span>{badge && <span className={`rounded px-1.5 py-0.5 text-[9px] ${badge === "HOT" ? "bg-red-50 text-red-500" : "theme-accent-soft theme-accent-text"}`}>{badge}</span>}</li>)}
                </ol>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-bold">시장 심리 지수</h3>
                <div className="mt-4 flex items-end justify-between"><span className="text-xs font-semibold text-emerald-600">탐욕 72%</span><strong className="text-2xl text-emerald-500">72<span className="ml-1 text-xs text-gray-400">/100</span></strong></div>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full"><span className="w-[72%] bg-emerald-500"/><span className="flex-1 bg-red-500"/></div>
                <div className="mt-2 flex justify-between text-[10px]"><span className="text-emerald-600">극도의 탐욕</span><span className="text-red-500">극도의 공포</span></div>
            </div>
        </aside>
    );
}
