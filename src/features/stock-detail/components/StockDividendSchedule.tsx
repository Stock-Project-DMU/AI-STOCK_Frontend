"use client";
import type { DividendSchedule } from "../types";

const periodLabel = (item: DividendSchedule) => item.dividendKind === "ANNUAL" ? "ANNUAL" : item.period;

// 백엔드가 최근 3년치만 내려주므로 더보기/펼치기 없이 받은 그대로 전부 보여준다.
export default function StockDividendSchedule({ items }: { items: DividendSchedule[] }) {
    if (!items.length) return <p className="text-sm text-muted">배당 일정 정보가 없습니다.</p>;

    const rows = [...items].sort((a, b) => b.fiscalYear.localeCompare(a.fiscalYear) || b.recordDate.localeCompare(a.recordDate));

    return <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">회차별 배당 일정</caption>
            <thead className="bg-surface-strong text-muted"><tr>{["연도", "분기", "배당기준일", "배당락일", "지급일", "1주당 배당금"].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
            <tbody>{rows.map(item => <tr key={item.dividendScheduleId} className="border-t border-hairline">
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{item.fiscalYear}</td>
                <td className="whitespace-nowrap px-4 py-3">{periodLabel(item)}</td>
                <td className="whitespace-nowrap px-4 py-3">{item.recordDate}</td>
                <td className="whitespace-nowrap px-4 py-3">{item.exDividendDate}</td>
                <td className="whitespace-nowrap px-4 py-3">{item.payDate ?? "-"}</td>
                <td className={`num whitespace-nowrap px-4 py-3 text-right font-bold ${item.dpsCash == null ? "text-muted" : ""}`}>{item.dpsCash == null ? "미공시" : `${item.dpsCash.toLocaleString("ko-KR")}원`}</td>
            </tr>)}</tbody>
        </table>
    </div>;
}
