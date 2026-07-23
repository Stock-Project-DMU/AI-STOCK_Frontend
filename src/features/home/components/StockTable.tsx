"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FavoriteButton } from "@/components/common/Button";

const STOCK_DATA = [
    { code: "005930", name: "삼성전자", changeRate: "+1.05%", currentPrice: "191,700", tradingValue: "6.7억원" },
    { code: "066570", name: "LG전자", changeRate: "-0.85%", currentPrice: "120,500", tradingValue: "3.2억원" },
    { code: "000660", name: "SK하이닉스", changeRate: "+0.50%", currentPrice: "95,300", tradingValue: "4.1억원" },
    { code: "005380", name: "현대자동차", changeRate: "+2.10%", currentPrice: "220,000", tradingValue: "5.5억원" },
    { code: "035720", name: "카카오", changeRate: "-1.20%", currentPrice: "85,400", tradingValue: "2.8억원" },
    { code: "035420", name: "NAVER", changeRate: "+0.75%", currentPrice: "310,000", tradingValue: "7.3억원" },
    { code: "068270", name: "셀트리온", changeRate: "-0.60%", currentPrice: "250,000", tradingValue: "3.9억원" },
    { code: "012330", name: "현대모비스", changeRate: "+1.80%", currentPrice: "280,000", tradingValue: "4.5억원" },
    { code: "051910", name: "LG화학", changeRate: "-0.95%", currentPrice: "700,000", tradingValue: "6.1억원" },
    { code: "207940", name: "삼성바이오로직스", changeRate: "+0.40%", currentPrice: "900,000", tradingValue: "5.2억원" },
] as const;

type SortKey = "현재가" | "급상승" | "급하락" | "거래량" | "거래대금";

export default function StockTable() {
    const [sortKey, setSortKey] = useState<SortKey>("현재가");
    const rows = useMemo(() => {
        if (sortKey === "급상승") return [...STOCK_DATA].sort((a, b) => Number.parseFloat(b.changeRate) - Number.parseFloat(a.changeRate));
        if (sortKey === "급하락") return [...STOCK_DATA].sort((a, b) => Number.parseFloat(a.changeRate) - Number.parseFloat(b.changeRate));
        return STOCK_DATA;
    }, [sortKey]);

    return (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1726]/95 shadow-[0_18px_55px_rgba(0,0,0,.24)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                    <p className="theme-accent-text text-[10px] font-bold tracking-[0.16em]">MARKET WATCH</p>
                    <h2 className="mt-1 text-lg font-black text-white">주요 종목</h2>
                </div>
                <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-[#07111e] p-1">
                    {(["현재가", "급상승", "급하락", "거래량", "거래대금"] as SortKey[]).map((label) => (
                        <button key={label} type="button" onClick={() => setSortKey(label)} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${sortKey === label ? "theme-accent-bg" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-[#081321] text-[10px] font-bold tracking-wider text-slate-500">
                            <th className="w-16 px-4 py-3 text-center">관심</th>
                            <th className="px-4 py-3 text-left">종목</th>
                            <th className="px-4 py-3 text-right">등락률</th>
                            <th className="px-4 py-3 text-right">현재가</th>
                            <th className="px-4 py-3 text-right">거래대금</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((stock) => {
                            const rising = stock.changeRate.startsWith("+");
                            return (
                                <tr key={stock.code} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.025]">
                                    <td className="px-3 py-3 text-center"><FavoriteButton /></td>
                                    <td className="px-4 py-3">
                                        <Link href={stock.name === "삼성전자" ? "/stock-detail" : "/home"} className="group inline-flex flex-col">
                                            <strong className="font-bold text-slate-100 group-hover:text-[var(--market-accent-text)]">{stock.name}</strong>
                                            <span className="mt-0.5 text-[10px] text-slate-600">{stock.code} · KRX</span>
                                        </Link>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-bold ${rising ? "text-red-400" : "text-blue-400"}`}>{stock.changeRate}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-200">{stock.currentPrice}<span className="ml-1 text-[10px] text-slate-600">KRW</span></td>
                                    <td className="px-4 py-3 text-right text-slate-400">{stock.tradingValue}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
