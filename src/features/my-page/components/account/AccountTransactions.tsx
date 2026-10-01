"use client";

import { useEffect, useState } from "react";
import { getAccountTransactions, type AccountTransactionResponse } from "@/lib/api/portfolio";
import type { AccountInfoResponse } from "@/lib/api/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
import { won } from "../../data";

const categories = ["가상계좌 입금", "가상계좌 출금", "배당금 입금", "예치금 이자 입금", "거래 수수료 출금"] as const;
type Category = typeof categories[number];
type TransactionRow = Pick<AccountTransactionResponse, "transactionId" | "amount" | "balanceAfter" | "reason" | "createdAt"> & { category: Category };

// Preview only: these records are never sent to the account API.
const previewEntries: { category: Category; amount: number; reason: string; createdAt: string }[] = [
    { category: "가상계좌 입금", amount: 500000, reason: "가상계좌 추가 입금", createdAt: "2026-09-28T09:00:00" },
    { category: "거래 수수료 출금", amount: 1500, reason: "삼성전자 매수 거래 수수료", createdAt: "2026-09-28T10:15:00" },
    { category: "배당금 입금", amount: 36100, reason: "삼성전자 보유 주식 배당금", createdAt: "2026-09-29T09:00:00" },
    { category: "가상계좌 출금", amount: 200000, reason: "가상계좌 출금", createdAt: "2026-09-29T14:30:00" },
    { category: "예치금 이자 입금", amount: 2450, reason: "9월 예치금 이자", createdAt: "2026-09-30T18:00:00" },
    { category: "가상계좌 입금", amount: 300000, reason: "가상계좌 추가 입금", createdAt: "2026-10-01T09:00:00" },
    { category: "거래 수수료 출금", amount: 2100, reason: "SK하이닉스 매도 거래 수수료", createdAt: "2026-10-01T10:20:00" },
    { category: "배당금 입금", amount: 15000, reason: "보유 ETF 분배금", createdAt: "2026-10-01T11:00:00" },
];
let previewBalance = 1000000;
const previewRows: TransactionRow[] = previewEntries.map((entry, index) => {
    previewBalance += entry.category.endsWith("입금") ? entry.amount : -entry.amount;
    return { ...entry, transactionId: -(index + 1), balanceAfter: previewBalance };
}).reverse();

function getCategory(type: AccountTransactionResponse["type"]): Category | null {
    switch (type) {
        case "INITIAL_GRANT":
        case "AUTO_CHARGE":
        case "ADMIN_CHARGE": return "가상계좌 입금";
        case "ADMIN_DEDUCTION": return "가상계좌 출금";
        default: return null; // Stock orders/refunds are not deposits, withdrawals or fees.
    }
}

export default function AccountTransactions({ accounts }: { accounts: AccountInfoResponse[] }) {
    const [preview, setPreview] = useState(process.env.NODE_ENV === "development");
    const [selectedId, setSelectedId] = useState(accounts[0]?.accountId ?? 0);
    const accountId = accounts.some(account => account.accountId === selectedId) ? selectedId : accounts[0]?.accountId;
    const [category, setCategory] = useState<Category | "전체">("전체");
    const [result, setResult] = useState<{ accountId: number; items: AccountTransactionResponse[]; error: string } | null>(null);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!accountId || preview) return;
        const controller = new AbortController();
        void getAccountTransactions(accountId, controller.signal).then(items => {
            if (!controller.signal.aborted) setResult({ accountId, items, error: "" });
        }).catch(error => {
            if (!controller.signal.aborted) setResult({ accountId, items: [], error: getApiErrorMessage(error, "계좌내역을 불러오지 못했습니다.") });
        });
        return () => controller.abort();
    }, [accountId, retry, preview]);

    const loading = Boolean(accountId) && result?.accountId !== accountId;
    const error = result?.accountId === accountId ? result.error : "";
    const rows: TransactionRow[] = preview ? previewRows : result?.accountId === accountId ? result.items.flatMap(item => {
        const itemCategory = getCategory(item.type);
        return itemCategory ? [{ ...item, category: itemCategory }] : [];
    }) : [];
    const items = rows.filter(item => category === "전체" || item.category === category);

    return (
        <section aria-labelledby="account-transactions-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 id="account-transactions-title" className="text-lg font-bold">계좌내역</h2>
                {process.env.NODE_ENV === "development" && <button type="button" onClick={() => setPreview(value => !value)} className="rounded-md border border-hairline bg-canvas px-3 py-2 text-sm font-semibold">{preview ? "실제 내역 보기" : "예시 내역 보기"}</button>}
                {accounts.length > 1 && <select aria-label="조회 계좌" value={accountId} onChange={event => { setResult(null); setSelectedId(Number(event.target.value)); }} className="rounded-md border border-hairline bg-canvas px-3 py-2 text-sm">
                    {accounts.map(account => <option key={account.accountId} value={account.accountId}>{account.accountName} · {account.accountNumber}</option>)}
                </select>}
            </div>
            <div className="mb-5 flex flex-wrap gap-2" aria-label="계좌내역 종류">
                {(["전체", ...categories] as const).map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${category === value ? "theme-accent-soft theme-accent-text border-primary/30" : "border-hairline bg-canvas hover:bg-surface-soft"}`}>{value}</button>)}
            </div>
            <p className="mb-4 text-xs leading-5 text-muted">{preview ? "예시 데이터 미리보기 · 아래 8건의 금액과 잔액은 화면 확인용이며 실제 계좌에 반영되지 않습니다." : "현재 배당금·예치금 이자·거래 수수료는 지급·부과되지 않아 해당 내역이 없습니다. 주식 매매 내역은 주문내역에서 확인할 수 있습니다."}</p>
            {!preview && !accountId ? <p className="py-12 text-center text-sm text-muted">표시할 계좌가 없습니다.</p>
                : !preview && loading ? <p role="status" className="py-12 text-center text-sm text-muted">계좌내역을 불러오는 중입니다.</p>
                : !preview && error ? <div role="alert" className="py-8 text-center"><p className="text-sm text-up">{error}</p><button type="button" onClick={() => { setResult(null); setRetry(value => value + 1); }} className="mt-3 rounded-md border border-hairline px-3 py-2 text-sm">다시 시도</button></div>
                : items.length === 0 ? <p className="py-12 text-center text-sm text-muted">{category === "전체" ? "표시할 계좌내역이 없습니다." : `${category} 내역이 없습니다.`}</p>
                : <div className="overflow-x-auto rounded-lg border border-hairline bg-canvas"><table className="w-full min-w-[640px] text-left text-sm">
                    <caption className="sr-only">계좌 입출금 내역</caption>
                    <thead className="bg-surface-strong text-muted"><tr>{["일시", "항목", "금액", "거래 후 잔액", "내용"].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                    <tbody>{items.map(item => {
                        const deposit = item.category.endsWith("입금");
                        return <tr key={item.transactionId} className="border-t border-hairline"><td className="whitespace-nowrap px-4 py-4">{formatDateTime(item.createdAt)}</td><td className="whitespace-nowrap px-4 py-4 font-semibold">{item.category}</td><td className={`whitespace-nowrap px-4 py-4 text-right font-bold ${deposit ? "text-up" : "text-down"}`}>{deposit ? "+" : "−"}{won(Math.abs(item.amount))}</td><td className="whitespace-nowrap px-4 py-4 text-right">{won(item.balanceAfter)}</td><td className="max-w-64 break-words px-4 py-4 text-muted">{item.reason ?? "—"}</td></tr>;
                    })}</tbody>
                </table></div>}
        </section>
    );
}
