"use client";

import { useState } from "react";
import type { LivePortfolio } from "@/hooks/LivePortfolioProvider";
import type { RealizedReturnResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";

const won = (amount: number) => amount.toLocaleString("ko-KR") + "원";
const profitColor = (amount: number | null | undefined) =>
    amount == null || amount === 0 ? "" : amount > 0 ? "text-red-500" : "text-blue-500";

type Tab = "holdings" | "returns";

export default function ReturnsPanel({ live, rows }: { live: LivePortfolio; rows: RealizedReturnResponse[] }) {
    const [tab, setTab] = useState<Tab>("holdings");
    const summary = [
        { title: "총 평가 자산", value: won(live.totalAsset) },
        { title: "계좌 평가 손익", value: won(live.accountProfitAmount), amount: live.accountProfitAmount },
        { title: "계좌 수익률", value: `${live.accountProfitRate.toFixed(2)}%`, amount: live.accountProfitRate },
    ];
    const tabs: { id: Tab; label: string }[] = [
        { id: "holdings", label: "보유 중" },
        { id: "returns", label: "매매 완료" },
    ];

    return <div><h1 className="mb-4 text-xl font-bold">수익률</h1>
        <div className="grid gap-3 sm:grid-cols-3">{summary.map(({ title, value, amount }) => <div key={title} className="rounded-lg border border-hairline bg-surface-soft p-4"><p className="text-sm text-muted">{title}</p><strong className={`mt-3 block text-xl ${profitColor(amount)}`}>{value}</strong></div>)}</div>

        <div className="mt-5 mb-4 flex gap-2" aria-label="수익률 보기 전환">
            {tabs.map(({ id, label }) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`rounded-md border px-3.5 py-2 text-sm font-bold ${tab === id ? "theme-accent-soft theme-accent-text border-primary/30" : "border-hairline bg-canvas hover:bg-surface-soft"}`}>{label}</button>)}
        </div>

        {tab === "holdings" && <HoldingsTab live={live} />}
        {tab === "returns" && <ReturnsTab rows={rows} />}
    </div>;
}

function HoldingsTab({ live }: { live: LivePortfolio }) {
    if (live.isLoading) return <p role="status" className="py-12 text-center text-sm text-muted">보유 종목을 불러오는 중입니다.</p>;
    if (live.error) return <p role="alert" className="py-8 text-center text-sm text-up">{live.error}</p>;
    if (!live.holdings.length) return <p className="py-12 text-center text-sm text-muted">보유 중인 종목이 없습니다.</p>;

    return <div className="overflow-auto rounded-lg border border-hairline"><table className="w-full text-right text-sm">
        <thead className="bg-surface-soft"><tr>{["종목", "수량", "평균가", "현재가", "평가금액", "평가손익", "수익률"].map(label => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead>
        <tbody>{live.holdings.map(holding => <tr key={holding.stockCode} className="border-t border-hairline [&_td]:whitespace-nowrap [&_td]:p-3">
            <td className="text-left font-semibold">{holding.stockName || holding.stockCode}</td>
            <td>{holding.quantity}주</td>
            <td>{won(holding.avgPrice)}</td>
            <td>{won(holding.currentPrice)}</td>
            <td>{won(holding.currentPrice * holding.quantity)}</td>
            <td className={`font-semibold ${profitColor(holding.evaluationProfit)}`}>{won(holding.evaluationProfit)}</td>
            <td className={`font-semibold ${profitColor(holding.profitRate)}`}>{holding.profitRate.toFixed(2)}%</td>
        </tr>)}</tbody>
    </table></div>;
}

function ReturnsTab({ rows }: { rows: RealizedReturnResponse[] }) {
    const realizedProfit = rows.reduce((sum, row) => sum + row.profitAmount, 0);

    return <div>
        <p className="mb-3 text-sm"><span className="text-muted">매도 실현손익 </span><strong className={`font-bold ${profitColor(realizedProfit)}`}>{won(realizedProfit)}</strong></p>
        <p className="mb-4 text-xs text-muted">실현손익은 체결 순서와 이동평균 매입단가 기준이며, 매도 시 거래 수수료가 차감된 금액입니다. 배당금과 예치금 이자는 포함하지 않습니다.</p>
        <div className="overflow-auto rounded-lg border border-hairline"><table className="w-full text-right text-sm"><thead className="bg-surface-soft"><tr>{["판매일", "종목", "수량", "매입단가", "매도단가", "실현손익", "수익률"].map(label => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.orderId} className="border-t border-hairline [&_td]:whitespace-nowrap [&_td]:p-3"><td>{formatDateTime(row.executedAt)}</td><td>{row.stockName}</td><td>{row.quantity}주</td><td>{won(row.averageCost)}</td><td>{won(row.sellPrice)}</td><td className={`font-semibold ${profitColor(row.profitAmount)}`}>{won(row.profitAmount)}</td><td className={`font-semibold ${profitColor(row.profitRate)}`}>{row.profitRate.toFixed(2)}%</td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-muted">매도 체결 내역이 없습니다.</p>}</div>
    </div>;
}
