"use client";
import { useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import type { AccountInfoResponse, ProfitResponse } from "@/lib/api/types";
type RealizedReturn = { orderId: number; stockCode: string; stockName: string; quantity: number; averageCost: number; sellPrice: number; profitAmount: number; profitRate: number; executedAt: string };
const won = (amount: number) => amount.toLocaleString("ko-KR") + "원";
export default function ReturnsPanel({ profit, account }: { profit: ProfitResponse | null; account: AccountInfoResponse | null }) {
    const [rows, setRows] = useState<RealizedReturn[]>([]);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        if (account) apiRequest<RealizedReturn[]>(`/api/accounts/${account.accountId}/returns`).then(rows => { if (active) setRows(rows); }).catch(error => { if (active) setError(getApiErrorMessage(error, "실현손익을 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, [account]);
    return <div><h1 className="mb-4 text-xl font-bold">수익률</h1>
        {error && <p role="alert" className="mb-3 text-red-500">{error}</p>}
        <div className="grid gap-3 sm:grid-cols-3">{[["매도 실현손익", error ? "조회 실패" : won(rows.reduce((sum, row) => sum + row.profitAmount, 0))], ["누적 평가 손익", profit ? won(profit.profitAmount) : "—"], ["총 평가 자산", profit ? won(profit.totalAsset) : "—"]].map(([title, value]) => <div key={title} className="rounded-lg border border-hairline bg-surface-soft p-4"><p className="text-sm text-muted">{title}</p><strong className="mt-3 block text-xl">{value}</strong></div>)}</div>
        <p className="my-4 text-xs text-muted">실현손익은 체결 순서와 이동평균 매입단가 기준입니다. 현재 모의투자에서 지급·차감하지 않는 배당금, 이자, 수수료는 포함하지 않습니다.</p>
        <div className="overflow-auto rounded-lg border border-hairline"><table className="w-full text-right text-sm"><thead className="bg-surface-soft"><tr>{["판매일", "종목", "수량", "매입단가", "매도단가", "실현손익", "수익률"].map(label => <th key={label} className="whitespace-nowrap p-3">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.orderId} className="border-t border-hairline [&_td]:whitespace-nowrap [&_td]:p-3"><td>{row.executedAt.replace("T", " ")}</td><td>{row.stockName}</td><td>{row.quantity}주</td><td>{won(row.averageCost)}</td><td>{won(row.sellPrice)}</td><td>{won(row.profitAmount)}</td><td>{row.profitRate.toFixed(2)}%</td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-muted">매도 체결 내역이 없습니다.</p>}</div>
    </div>;
}
