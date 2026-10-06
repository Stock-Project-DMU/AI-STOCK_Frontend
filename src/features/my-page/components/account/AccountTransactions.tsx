"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccountTransactions, type AccountTransactionResponse } from "@/lib/api/portfolio";
import type { AccountInfoResponse } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
import { formatAccountNumber } from "@/lib/format/account";
import { won } from "../../data";

const filters = ["충전", "주식 거래", "이자·수수료", "배당금", "기타"] as const;
type Filter = typeof filters[number];

const TRANSACTION_META: Record<AccountTransactionResponse["type"], { label: string; sign: 1 | -1; filter: Filter }> = {
    INITIAL_GRANT: { label: "계좌 개설 지급", sign: 1, filter: "충전" },
    AUTO_CHARGE: { label: "직접 충전", sign: 1, filter: "충전" },
    ADMIN_CHARGE: { label: "관리자 승인 충전", sign: 1, filter: "충전" },
    ADMIN_DEDUCTION: { label: "관리자 차감", sign: -1, filter: "기타" },
    AUTO_DEDUCTION: { label: "직접 차감", sign: -1, filter: "기타" },
    ORDER_BUY: { label: "주식 매수", sign: -1, filter: "주식 거래" },
    ORDER_SELL: { label: "주식 매도", sign: 1, filter: "주식 거래" },
    ORDER_REFUND: { label: "주문 취소 환불", sign: 1, filter: "주식 거래" },
    INTEREST: { label: "예치금 이자", sign: 1, filter: "이자·수수료" },
    TRADE_FEE: { label: "거래 수수료", sign: -1, filter: "이자·수수료" },
};

type TransactionRow = AccountTransactionResponse & { label: string; sign: 1 | -1; filter: Filter };

export default function AccountTransactions({ accounts }: { accounts: AccountInfoResponse[] }) {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState(accounts[0]?.accountId ?? 0);
    const accountId = accounts.some(account => account.accountId === selectedId) ? selectedId : accounts[0]?.accountId;
    const [filter, setFilter] = useState<Filter | "전체">("전체");
    const [result, setResult] = useState<{ accountId: number; items: AccountTransactionResponse[]; error: string } | null>(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!accountId) return;
        const controller = new AbortController();
        void getAccountTransactions(accountId, controller.signal).then(items => {
            if (!controller.signal.aborted) setResult({ accountId, items, error: "" });
        }).catch(error => {
            if (!controller.signal.aborted) setResult({ accountId, items: [], error: getApiErrorMessage(error, "계좌내역을 불러오지 못했습니다.") });
        });
        return () => controller.abort();
    }, [accountId, retry]);

    const loading = Boolean(accountId) && result?.accountId !== accountId;
    const error = result?.accountId === accountId ? result.error : "";
    const rows: TransactionRow[] = result?.accountId === accountId ? result.items.map(item => ({ ...item, ...TRANSACTION_META[item.type] })) : [];
    const items = rows.filter(row => filter === "전체" || row.filter === filter);

    return (
        <section aria-labelledby="account-transactions-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 id="account-transactions-title" className="text-lg font-bold">계좌내역</h2>
                {accounts.length > 1 && <select aria-label="조회 계좌" value={accountId} onChange={event => { setResult(null); setSelectedId(Number(event.target.value)); }} className="rounded-md border border-hairline bg-canvas px-3 py-2 text-sm">
                    {accounts.map(account => <option key={account.accountId} value={account.accountId}>{account.accountName} · {formatAccountNumber(account.accountNumber)}</option>)}
                </select>}
            </div>
            <div className="mb-5 flex flex-wrap gap-2" aria-label="계좌내역 종류">
                {(["전체", ...filters] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${filter === value ? "theme-accent-soft theme-accent-text border-primary/30" : "border-hairline bg-canvas hover:bg-surface-soft"}`}>{value}</button>)}
            </div>
            <p className="mb-4 text-xs leading-5 text-muted">충전, 주식 거래, 이자·수수료 등 계좌에서 발생한 모든 내역입니다. 종목 관련 내역은 클릭하면 주문내역에서 자세히 볼 수 있습니다.</p>
            {!accountId ? <p className="py-12 text-center text-sm text-muted">표시할 계좌가 없습니다.</p>
                : loading ? <p role="status" className="py-12 text-center text-sm text-muted">계좌내역을 불러오는 중입니다.</p>
                : error ? <div role="alert" className="py-8 text-center"><p className="text-sm text-up">{error}</p><button type="button" onClick={() => { setResult(null); setRetry(value => value + 1); }} className="mt-3 rounded-md border border-hairline px-3 py-2 text-sm">다시 시도</button></div>
                : items.length === 0 ? <p className="py-12 text-center text-sm text-muted">{filter === "전체" ? "표시할 계좌내역이 없습니다." : `${filter} 내역이 없습니다.`}</p>
                : <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas"><table className="w-full min-w-[640px] text-left text-sm">
                    <caption className="sr-only">계좌 입출금 내역</caption>
                    <thead className="bg-surface-strong text-muted"><tr>{["일시", "항목", "금액", "거래 후 잔액", "내용"].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                    <tbody>{items.map(item => {
                        const deposit = item.sign > 0;
                        const clickable = item.relatedOrderId != null;
                        return <tr
                            key={item.transactionId}
                            onClick={clickable ? () => router.push(`/my-page?tab=orders&orderId=${item.relatedOrderId}`) : undefined}
                            className={`border-t border-hairline ${clickable ? "cursor-pointer hover:bg-surface-soft" : ""}`}
                        >
                            <td className="whitespace-nowrap px-4 py-4">{formatDateTime(item.createdAt)}</td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold">{item.label}</td>
                            <td className={`whitespace-nowrap px-4 py-4 text-right font-bold ${deposit ? "text-up" : "text-down"}`}>{deposit ? "+" : "−"}{won(Math.abs(item.amount))}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-right">{won(item.balanceAfter)}</td>
                            <td className="max-w-64 break-words px-4 py-4 text-muted">{item.reason ?? "—"}</td>
                        </tr>;
                    })}</tbody>
                </table></div>}
        </section>
    );
}
