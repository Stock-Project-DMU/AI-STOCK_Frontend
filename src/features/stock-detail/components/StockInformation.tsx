"use client";

import { useState } from "react";
import {
    ANALYSTS,
    DIVIDEND_ROWS,
    EARNINGS_ROWS,
    FINANCE_ROWS,
    INFORMATION_TABS,
    PEER_ROWS,
} from "../constants/stockData";
import type { InformationTab } from "../types";

export default function StockInformation() {
    const [tab, setTab] = useState<InformationTab>("overview");

    return (
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 p-4 lg:flex-row lg:p-6">
            <nav className="flex shrink-0 overflow-x-auto rounded-2xl border border-slate-800 bg-[#0b1726] p-2 lg:w-52 lg:flex-col lg:self-start">
                <p className="hidden px-4 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 lg:block">Research Menu</p>
                {INFORMATION_TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`relative shrink-0 rounded-xl px-4 py-3 text-left text-xs font-semibold transition-colors ${
                            tab === item.id
                                ? "bg-slate-800 text-white shadow-inner shadow-black/20"
                                : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                    >
                        {tab === item.id && <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-red-500" />}
                        {item.label}
                    </button>
                ))}
            </nav>

            <main className="min-h-[720px] min-w-0 flex-1 rounded-2xl border border-slate-800 bg-[#0b1726] p-5 shadow-xl shadow-black/10 sm:p-7">
                {renderTab(tab)}
            </main>
        </div>
    );
}

function renderTab(tab: InformationTab) {
    if (tab === "overview") return <Overview />;
    if (tab === "finance") return <Financials />;
    if (tab === "earnings") return <Earnings />;
    if (tab === "dividend") return <Dividend />;
    if (tab === "peers") return <Peers />;
    return <Analysts />;
}

function SectionTitle({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-5">
            <div><h2 className="text-xl font-black tracking-tight">{title}</h2><p className="mt-1.5 text-xs text-slate-500">{subtitle}</p></div>
            {badge && <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-400">{badge}</span>}
        </div>
    );
}

function Overview() {
    return (
        <div>
            <SectionTitle title="기업 개요" subtitle="삼성전자 · 005930 · KOSPI" badge="전자·반도체" />
            <div className="theme-accent-border mt-6 rounded-2xl border bg-[linear-gradient(90deg,var(--market-accent-soft),transparent)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="theme-accent-text text-[10px] font-bold uppercase tracking-[0.16em]">Company Profile</p><h3 className="mt-2 text-lg font-black">삼성전자</h3></div><button type="button" className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300 hover:border-[var(--market-accent)] hover:text-white">기업 홈페이지 ↗</button></div>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400">반도체, 모바일, 디스플레이, 가전 등 다양한 사업을 영위하는 글로벌 전자·IT 기업입니다. 메모리 반도체와 스마트폰 시장에서 높은 글로벌 점유율을 확보하고 있습니다.</p>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Info label="시가총액" value="19조 3,123억원" change="KOSPI 1위" />
                <Info label="기업 가치" value="19조 8,737억원" change="EV 기준" />
                <Info label="대표이사" value="한종희" change="CEO" />
                <Info label="상장일" value="1975.06.11" change="51년" />
                <Info label="발행주식수" value="5,969,782,550주" change="보통주" />
                <Info label="외국인 지분율" value="51.37%" change="+0.18%p" positive />
            </dl>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
                <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="text-sm font-bold">투자 지표</h3><div className="mt-5 grid grid-cols-2 gap-4"><MiniMetric label="PER" value="10.85배" /><MiniMetric label="PBR" value="1.42배" /><MiniMetric label="ROE" value="13.7%" positive /><MiniMetric label="배당수익률" value="2.32%" positive /></div></section>
                <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="text-sm font-bold">사업 구성</h3><div className="mt-6 flex flex-col items-center gap-7 sm:flex-row sm:justify-center"><div className="relative h-36 w-36 rounded-full bg-[conic-gradient(#3b82f6_0_55%,#8b5cf6_55%_78%,#14b8a6_78%_100%)]"><div className="absolute inset-5 flex items-center justify-center rounded-full bg-[#0d1929] text-center text-xs font-bold">매출<br />100%</div></div><div className="space-y-3 text-xs"><Legend color="bg-blue-500" label="반도체" value="55%" /><Legend color="bg-violet-500" label="모바일·네트워크" value="23%" /><Legend color="bg-teal-500" label="디스플레이·가전" value="22%" /></div></div></section>
            </div>
        </div>
    );
}

function Info({ label, value, change, positive }: { label: string; value: string; change: string; positive?: boolean }) {
    return <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><dt className="text-[10px] text-slate-600">{label}</dt><dd className="mt-2 text-sm font-bold tabular-nums">{value}</dd><span className={`mt-2 block text-[10px] ${positive ? "text-emerald-400" : "text-slate-600"}`}>{change}</span></div>;
}

function MiniMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
    return <dl><dt className="text-[10px] text-slate-600">{label}</dt><dd className={`mt-1 text-lg font-black tabular-nums ${positive ? "text-emerald-400" : "text-slate-200"}`}>{value}</dd></dl>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
    return <div className="flex min-w-48 items-center"><i className={`mr-2 h-2.5 w-2.5 rounded-full ${color}`} /><span className="flex-1 text-slate-400">{label}</span><strong>{value}</strong></div>;
}

function Financials() {
    return <div><SectionTitle title="재무 정보" subtitle="최근 분기 실적 · 연결 기준 · 백만원" badge="24.Q4" /><KpiStrip items={[["매출액", "75,789", "-4.2%"], ["영업이익", "6,492", "-29.3%"], ["순이익", "5,567", "-25.5%"], ["부채비율", "26.0%", "안정"]]} /><DataTable headers={["항목", "24.Q1", "24.Q2", "24.Q3", "24.Q4"]} rows={FINANCE_ROWS} blueColumns /><Analysis tone="red">매출 성장세는 유지되고 있으나 영업이익의 단기 둔화가 확인됩니다. 현금성 자산과 낮은 부채비율을 고려하면 재무 안정성은 우수한 편입니다.</Analysis></div>;
}

function Earnings() {
    return <div><SectionTitle title="실적 발표" subtitle="최근 실적 · 실제 EPS 대비 컨센서스" badge="4개 분기 연속 BEAT" /><KpiStrip items={[["최근 EPS", "1,310", "+19.0%"], ["예상 EPS", "1,101", "컨센서스"], ["연속 서프라이즈", "4분기", "긍정"], ["다음 발표", "2025.04", "예정"]]} positive /><DataTable headers={["분기", "발표일", "EPS 예상", "EPS 실제", "서프라이즈"]} rows={EARNINGS_ROWS} redLast /><Analysis tone="green">최근 4개 분기 모두 시장 예상치를 상회했습니다. 반도체 업황 회복과 고부가 메모리 판매 확대가 실적 모멘텀을 지지하고 있습니다.</Analysis></div>;
}

function Dividend() {
    return (
        <div>
            <SectionTitle title="배당 정보" subtitle="삼성전자 · 005930 · 최근 2년 기준" badge="분기 배당" />
            <KpiStrip items={[["현재 배당금", "$1.44", "+9.1%"], ["배당 수익률", "2.32%", "현재가 기준"], ["배당 성향", "26.0%", "안정"], ["배당 주기", "분기", "연 4회"]]} positive />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5"><div><p className="text-xs font-bold text-red-400">다음 배당 일정</p><p className="mt-2 text-sm font-bold">2026년 4월 15일 지급 예정</p><span className="mt-1 block text-[10px] text-slate-600">배당락일 2026년 3월 30일</span></div><div className="text-right"><p className="text-[10px] text-slate-600">예상 배당금</p><strong className="mt-1 block text-xl text-red-400">$0.36</strong></div></div>
            <h3 className="mt-7 text-sm font-bold">배당 지급 내역</h3><DataTable headers={["지급일", "배당락일", "주당 배당금", "배당 수익률", "배당 유형"]} rows={DIVIDEND_ROWS} redMiddle />
            <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><h3 className="text-sm font-bold">연간 배당금 추이</h3><div className="mt-5 flex h-44 items-end justify-around border-b border-slate-800 pb-3">{[["2023", 72, "$1.20"], ["2024", 102, "$1.32"], ["2025", 132, "$1.44"]].map(([year, height, value]) => <div key={year} className="text-center text-xs"><div className={`mx-auto w-12 rounded-t-md ${year === "2025" ? "bg-gradient-to-t from-red-600 to-red-400 shadow-lg shadow-red-950/30" : "bg-slate-700"}`} style={{ height: `${height}px` }} /><strong className="mt-2 block text-red-400">{value}</strong><span className="text-slate-600">{year}</span></div>)}</div></div>
            <Analysis tone="green">배당금과 배당 수익률이 안정적인 범위에서 유지되고 있습니다. 현금흐름과 배당 성향을 고려하면 배당 지속 가능성은 높은 수준입니다.</Analysis>
        </div>
    );
}

function Peers() {
    return <div><SectionTitle title="동종 업계 비교" subtitle="가전·전자·반도체 주요 5개 기업" badge="업종 상대가치" /><DataTable headers={["종목명", "현재가", "시가총액", "PER", "52주 수익률"]} rows={PEER_ROWS} redLast /><Analysis tone="green">삼성전자는 업종 내 가장 큰 시가총액과 안정적인 밸류에이션을 유지하고 있습니다. SK하이닉스 대비 상승 탄력은 낮지만 변동성 역시 상대적으로 낮습니다.</Analysis></div>;
}

function Analysts() {
    return (
        <div>
            <SectionTitle title="애널리스트 컨센서스" subtitle="최근 3개 리포트 및 목표주가" badge="매수 우위" />
            <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_300px]">
                <div className="space-y-3">{ANALYSTS.map((analyst) => <article key={analyst.name} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white ${analyst.tone === "green" ? "bg-emerald-500/90" : "bg-amber-500/90"}`}>{analyst.opinion}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong>{analyst.name}</strong><span className="text-[10px] text-slate-600">{analyst.firm} · {analyst.date}</span></div><p className="mt-2 text-xs text-slate-400">목표가 <em className="text-sm font-black not-italic text-red-400">{analyst.target}</em>　현재 대비 <span className="text-emerald-400">{analyst.upside}</span></p></div><span className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${analyst.tone === "green" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{analyst.opinion === "BUY" ? "매수" : "중립"}</span></article>)}</div>
                <aside className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-[#101d2e] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Consensus</p><h3 className="mt-2 font-bold">투자의견</h3><div className="mt-5 flex items-end gap-2"><strong className="text-3xl font-black text-emerald-400">매수</strong><span className="mb-1 text-xs text-slate-500">21 / 28</span></div><div className="mt-5 flex h-2 overflow-hidden rounded-full"><span className="w-3/4 bg-emerald-500" /><span className="w-[21%] bg-amber-500" /><span className="flex-1 bg-red-500" /></div><div className="mt-2 flex justify-between text-[10px] text-slate-600"><span>매수 21</span><span>중립 6</span><span>매도 1</span></div><div className="mt-6 border-t border-slate-800 pt-5"><p className="text-[10px] text-slate-600">평균 목표가</p><strong className="mt-2 block text-2xl text-red-400">$94.00</strong><span className="mt-1 block text-xs text-emerald-400">현재 대비 +20.5%</span></div></aside>
            </div>
        </div>
    );
}

function KpiStrip({ items, positive }: { items: string[][]; positive?: boolean }) {
    return <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{items.map(([label, value, meta], index) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"><p className="text-[10px] text-slate-600">{label}</p><strong className="mt-2 block text-lg tabular-nums">{value}</strong><span className={`mt-1 block text-[10px] ${positive || index === 3 ? "text-emerald-400" : "text-slate-600"}`}>{meta}</span></div>)}</div>;
}

function DataTable({ headers, rows, blueColumns, redLast, redMiddle }: { headers: readonly string[]; rows: readonly (readonly string[])[]; blueColumns?: boolean; redLast?: boolean; redMiddle?: boolean }) {
    return <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-xs tabular-nums"><thead className="bg-slate-900/80 text-slate-500"><tr>{headers.map((header, index) => <th key={header} className={`px-4 py-3.5 font-medium ${index === 0 ? "text-left" : "text-right"}`}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className={`${rowIndex === 0 && headers[0] === "종목명" ? "bg-red-500/5" : "bg-[#0d1929]"} border-t border-slate-800 transition-colors hover:bg-slate-800/50`}>{row.map((cell, index) => <td key={index} className={`px-4 py-4 ${index === 0 ? "text-left font-semibold text-slate-200" : "text-right text-slate-400"} ${blueColumns && index > 0 && index < 4 ? "text-blue-400" : ""} ${redLast && index === row.length - 1 ? Number.parseFloat(cell) < 0 ? "text-blue-400" : "text-red-400" : ""} ${redMiddle && index === 2 ? "font-bold text-red-400" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function Analysis({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
    return <div className={`mt-6 rounded-2xl border p-5 text-sm ${tone === "green" ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}><strong className={tone === "green" ? "text-emerald-400" : "text-red-400"}>AI STOCK 분석</strong><p className="mt-2 leading-7 text-slate-400">{children}</p></div>;
}
