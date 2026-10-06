"use client";
import { useEffect, useState } from "react";
import { getDividendSchedules, type DividendScheduleResponse } from "@/lib/api/dividend";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";

const RECENT_YEAR_COUNT = 3;
const periodLabel = (item: DividendScheduleResponse) => item.dividendKind === "ANNUAL" ? "ANNUAL" : item.period;

export default function StockDividendSchedule({ stockCode }: { stockCode: string }) {
    const [authenticated] = useState(isAuthenticated);
    const [result, setResult] = useState<{ stockCode: string; items: DividendScheduleResponse[]; error: string } | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!authenticated) return;
        const controller = new AbortController();
        void getDividendSchedules(stockCode, controller.signal).then(items => {
            if (!controller.signal.aborted) setResult({ stockCode, items, error: "" });
        }).catch(error => {
            if (!controller.signal.aborted) setResult({ stockCode, items: [], error: getApiErrorMessage(error, "배당 정보를 불러오지 못했습니다.") });
        });
        return () => controller.abort();
    }, [authenticated, stockCode]);

    if (!authenticated) return <p className="text-sm text-muted">로그인 후 배당 정보를 확인할 수 있습니다.</p>;
    if (result?.stockCode !== stockCode) return <p role="status">자료 조회 중...</p>;
    if (result.error) return <p role="alert" className="text-red-500">{result.error}</p>;
    if (!result.items.length) return <p className="text-sm text-muted">배당 정보가 없습니다.</p>;

    const rows = [...result.items].sort((a, b) => b.fiscalYear.localeCompare(a.fiscalYear) || b.recordDate.localeCompare(a.recordDate));
    const recentYears = [...new Set(rows.map(row => row.fiscalYear))].slice(0, RECENT_YEAR_COUNT);
    const visible = expanded ? rows : rows.filter(row => recentYears.includes(row.fiscalYear));
    const hiddenCount = rows.length - rows.filter(row => recentYears.includes(row.fiscalYear)).length;

    return <>
        <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">회차별 배당 일정</caption>
                <thead className="bg-surface-strong text-muted"><tr>{["연도", "분기", "배당기준일", "배당락일", "지급일", "1주당 배당금"].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                <tbody>{visible.map(item => <tr key={item.dividendScheduleId} className="border-t border-hairline">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{item.fiscalYear}</td>
                    <td className="whitespace-nowrap px-4 py-3">{periodLabel(item)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{item.recordDate}</td>
                    <td className="whitespace-nowrap px-4 py-3">{item.exDividendDate}</td>
                    <td className="whitespace-nowrap px-4 py-3">{item.payDate ?? "-"}</td>
                    <td className={`num whitespace-nowrap px-4 py-3 text-right font-bold ${item.dpsCash == null ? "text-muted" : ""}`}>{item.dpsCash == null ? "미공시" : `${item.dpsCash.toLocaleString("ko-KR")}원`}</td>
                </tr>)}</tbody>
            </table>
        </div>
        {hiddenCount > 0 && <button type="button" onClick={() => setExpanded(value => !value)} className="mt-3 w-full rounded-lg border border-hairline px-3.5 py-2 text-sm font-bold hover:bg-surface-soft">{expanded ? "최근 3년만 보기" : `이전 배당 더 보기 (${hiddenCount}건)`}</button>}
    </>;
}
