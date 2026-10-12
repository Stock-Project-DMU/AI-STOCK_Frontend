import type { StockPriceResponse } from "@/lib/api/types";
import { marketStatusLabel, type MarketStatus } from "@/lib/api/market";
import { formatDateTime } from "@/lib/format/dateTime";

export default function StockHeader({ stock, marketStatus }: { stock?: StockPriceResponse | null; marketStatus?: MarketStatus | null }) {
    return <section className="border-b border-hairline bg-canvas p-5"><div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">국내 주식</p>
            {marketStatus && <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${marketStatus.isOpen ? "bg-emerald-500/10 text-emerald-600" : "bg-surface-strong text-muted"}`}>{marketStatusLabel(marketStatus)}</span>
                {!marketStatus.isOpen && marketStatus.nextOpen && <span className="text-[11px] text-muted">다음 개장: {formatDateTime(marketStatus.nextOpen)}</span>}
            </div>}
        </div>
        <h1 className="mt-3 text-xl font-bold">{stock?.stockName || stock?.stockCode || "종목 정보 조회 중"}</h1>
        <p className="mt-1 text-xs text-muted">{stock?.stockCode}</p>
        {stock && <div className="mt-4 flex flex-wrap items-end gap-4"><strong className="text-3xl font-bold">{stock.currentPrice.toLocaleString()}원</strong><span className={stock.direction === "DOWN" ? "text-down" : "text-up"}>{stock.changeAmount > 0 ? "+" : ""}{stock.changeAmount.toLocaleString()} ({stock.changeRate}%)</span><span className="text-sm text-muted">누적 거래량 {stock.volume.toLocaleString()}주</span></div>}
    </div></section>;
}
