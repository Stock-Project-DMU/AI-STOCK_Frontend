import type { StockPriceResponse } from "@/lib/api/types";
export default function StockHeader({ stock }: { stock?: StockPriceResponse | null }) {
    return <section className="border-b border-hairline bg-canvas p-5"><div className="mx-auto max-w-[1500px]">
        <p className="text-xs text-muted">국내 주식</p><h1 className="mt-3 text-xl font-bold">{stock?.stockName || stock?.stockCode || "종목 정보 조회 중"}</h1>
        <p className="mt-1 text-xs text-muted">{stock?.stockCode}</p>
        {stock && <div className="mt-4 flex flex-wrap items-end gap-4"><strong className="text-3xl font-bold">{stock.currentPrice.toLocaleString()}원</strong><span className={stock.direction === "DOWN" ? "text-down" : "text-up"}>{stock.changeAmount > 0 ? "+" : ""}{stock.changeAmount.toLocaleString()} ({stock.changeRate}%)</span><span className="text-sm text-muted">누적 거래량 {stock.volume.toLocaleString()}주</span></div>}
    </div></section>;
}
