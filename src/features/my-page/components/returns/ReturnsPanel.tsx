import type { ProfitResponse, RealizedReturnResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";
const won = (amount: number) => amount.toLocaleString("ko-KR") + "원";
const profitColor = (amount: number | null | undefined) =>
    amount == null || amount === 0 ? "" : amount > 0 ? "text-red-500" : "text-blue-500";

export default function ReturnsPanel({ profit, rows }: { profit: ProfitResponse | null; rows: RealizedReturnResponse[] }) {
    const realizedProfit = rows.reduce((sum, row) => sum + row.profitAmount, 0);
    const summary = [
        { title: "매도 실현손익", value: won(realizedProfit), amount: realizedProfit },
        { title: "누적 평가 손익", value: profit ? won(profit.profitAmount) : "—", amount: profit?.profitAmount },
        { title: "총 평가 자산", value: profit ? won(profit.totalAsset) : "—" },
    ];

    return <div><h1 className="mb-4 text-xl font-bold">수익률</h1>
        <div className="grid gap-3 sm:grid-cols-3">{summary.map(({ title, value, amount }) => <div key={title} className="rounded-lg border border-hairline bg-surface-soft p-4"><p className="text-sm text-muted">{title}</p><strong className={`mt-3 block text-xl ${profitColor(amount)}`}>{value}</strong></div>)}</div>
        <p className="my-4 text-xs text-muted">실현손익은 체결 순서와 이동평균 매입단가 기준입니다. 현재 모의투자에서 지급·차감하지 않는 배당금, 이자, 수수료는 포함하지 않습니다.</p>
        <div className="overflow-auto rounded-lg border border-hairline"><table className="w-full text-right text-sm"><thead className="bg-surface-soft"><tr>{["판매일", "종목", "수량", "매입단가", "매도단가", "실현손익", "수익률"].map(label => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.orderId} className="border-t border-hairline [&_td]:whitespace-nowrap [&_td]:p-3"><td>{formatDateTime(row.executedAt)}</td><td>{row.stockName}</td><td>{row.quantity}주</td><td>{won(row.averageCost)}</td><td>{won(row.sellPrice)}</td><td className={`font-semibold ${profitColor(row.profitAmount)}`}>{won(row.profitAmount)}</td><td className={`font-semibold ${profitColor(row.profitRate)}`}>{row.profitRate.toFixed(2)}%</td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-muted">매도 체결 내역이 없습니다.</p>}</div>
    </div>;
}
