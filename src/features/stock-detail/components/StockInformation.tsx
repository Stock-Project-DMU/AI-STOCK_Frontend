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
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 p-3 lg:flex-row lg:p-4">
            <nav className="flex shrink-0 overflow-x-auto rounded-lg border border-hairline bg-canvas p-2 lg:w-48 lg:flex-col lg:self-start">
                <p className="hidden px-3 pb-2 pt-1 text-[12px] font-bold uppercase tracking-[0.18em] text-muted-soft lg:block">Research Menu</p>
                {INFORMATION_TABS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setTab(item.id)}
                        className={`relative shrink-0 rounded-md px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                            tab === item.id
                                ? "bg-surface-strong text-ink"
                                : "text-muted hover:bg-surface-soft hover:text-ink"
                        }`}
                    >
                        {tab === item.id && <span className="absolute bottom-2.5 left-0 top-2.5 w-0.5 rounded-full bg-primary" />}
                        {item.label}
                    </button>
                ))}
            </nav>

            <main className="min-h-[720px] min-w-0 flex-1 rounded-lg border border-hairline bg-canvas p-4 sm:p-5">
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
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-4">
            <div><h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2><p className="mt-1 text-xs text-muted">{subtitle}</p></div>
            {badge && <span className="rounded-pill border border-hairline bg-surface-soft px-3 py-1 text-[12px] font-bold text-muted">{badge}</span>}
        </div>
    );
}

function Overview() {
    return (
        <div>
            <SectionTitle title="기업 개요" subtitle="삼성전자 · 005930 · KOSPI" badge="전자·반도체" />
            <div className="theme-accent-border mt-5 rounded-lg border bg-[linear-gradient(90deg,var(--market-accent-soft),transparent)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="theme-accent-text text-[12px] font-bold uppercase tracking-[0.16em]">Company Profile</p><h3 className="mt-2 text-base font-bold text-ink">삼성전자</h3></div><button type="button" className="rounded-lg border border-hairline bg-surface-soft px-4 py-2 text-xs text-body hover:border-primary hover:text-ink">기업 홈페이지 ↗</button></div>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-body">반도체, 모바일, 디스플레이, 가전 등 다양한 사업을 영위하는 글로벌 전자·IT 기업입니다. 메모리 반도체와 스마트폰 시장에서 높은 글로벌 점유율을 확보하고 있습니다.</p>
            </div>

            <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <Info label="시가총액" value="19조 3,123억원" change="KOSPI 1위" />
                <Info label="기업 가치" value="19조 8,737억원" change="EV 기준" />
                <Info label="대표이사" value="한종희" change="CEO" />
                <Info label="상장일" value="1975.06.11" change="51년" />
                <Info label="발행주식수" value="5,969,782,550주" change="보통주" />
                <Info label="외국인 지분율" value="51.37%" change="+0.18%p" positive />
            </dl>

            <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_1.4fr]">
                <section className="rounded-lg border border-hairline bg-surface-soft p-4"><h3 className="text-sm font-bold text-ink">투자 지표</h3><div className="mt-4 grid grid-cols-2 gap-3"><MiniMetric label="PER" value="10.85배" /><MiniMetric label="PBR" value="1.42배" /><MiniMetric label="ROE" value="13.7%" positive /><MiniMetric label="배당수익률" value="2.32%" positive /></div></section>
                <section className="rounded-lg border border-hairline bg-surface-soft p-4"><h3 className="text-sm font-bold text-ink">사업 구성</h3><div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"><div className="relative h-32 w-32 rounded-full bg-[conic-gradient(#0052ff_0_55%,#8b5cf6_55%_78%,#14b8a6_78%_100%)]"><div className="absolute inset-4 flex items-center justify-center rounded-full bg-canvas text-center text-xs font-bold text-ink">매출<br />100%</div></div><div className="space-y-2.5 text-xs"><Legend color="bg-[#0052ff]" label="반도체" value="55%" /><Legend color="bg-violet-500" label="모바일·네트워크" value="23%" /><Legend color="bg-teal-500" label="디스플레이·가전" value="22%" /></div></div></section>
            </div>
        </div>
    );
}

function Info({ label, value, change, positive }: { label: string; value: string; change: string; positive?: boolean }) {
    return <div className="rounded-lg border border-hairline bg-surface-soft p-3"><dt className="text-[12px] text-muted">{label}</dt><dd className="num mt-1.5 text-sm font-bold text-ink">{value}</dd><span className={`mt-1.5 block text-[12px] ${positive ? "text-up" : "text-muted-soft"}`}>{change}</span></div>;
}

function MiniMetric({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
    return <dl><dt className="text-[12px] text-muted">{label}</dt><dd className={`num mt-1 text-base font-bold ${positive ? "text-up" : "text-ink"}`}>{value}</dd></dl>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
    return <div className="flex min-w-44 items-center"><i className={`mr-2 h-2.5 w-2.5 rounded-full ${color}`} /><span className="flex-1 text-body">{label}</span><strong className="num text-ink">{value}</strong></div>;
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(207,32,47,0.2)] bg-[rgba(207,32,47,0.05)] p-4"><div><p className="text-xs font-bold text-up">다음 배당 일정</p><p className="mt-2 text-sm font-bold text-ink">2026년 4월 15일 지급 예정</p><span className="mt-1 block text-[12px] text-muted">배당락일 2026년 3월 30일</span></div><div className="text-right"><p className="text-[12px] text-muted">예상 배당금</p><strong className="num mt-1 block text-lg text-up">$0.36</strong></div></div>
            <h3 className="mt-6 text-sm font-bold text-ink">배당 지급 내역</h3><DataTable headers={["지급일", "배당락일", "주당 배당금", "배당 수익률", "배당 유형"]} rows={DIVIDEND_ROWS} redMiddle />
            <div className="mt-6 rounded-lg border border-hairline bg-surface-soft p-4"><h3 className="text-sm font-bold text-ink">연간 배당금 추이</h3><div className="mt-4 flex h-40 items-end justify-around border-b border-hairline pb-3">{[["2023", 62, "$1.20"], ["2024", 88, "$1.32"], ["2025", 114, "$1.44"]].map(([year, height, value]) => <div key={year} className="text-center text-xs"><div className={`mx-auto w-10 rounded-t-sm ${year === "2025" ? "bg-[var(--market-up)]" : "bg-muted-soft"}`} style={{ height: `${height}px` }} /><strong className="num mt-2 block text-up">{value}</strong><span className="text-muted">{year}</span></div>)}</div></div>
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
            <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_280px]">
                <div className="space-y-2.5">{ANALYSTS.map((analyst) => <article key={analyst.name} className="flex items-center gap-4 rounded-lg border border-hairline bg-surface-soft p-4 transition-colors hover:border-muted-soft"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${analyst.tone === "green" ? "bg-emerald-500" : "bg-amber-500"}`}>{analyst.opinion}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><strong className="text-ink">{analyst.name}</strong><span className="text-[12px] text-muted">{analyst.firm} · {analyst.date}</span></div><p className="mt-1.5 text-xs text-body">목표가 <em className="num text-sm font-bold not-italic text-up">{analyst.target}</em>　현재 대비 <span className="num text-up">{analyst.upside}</span></p></div><span className={`rounded-md px-3 py-1.5 text-[12px] font-bold ${analyst.tone === "green" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>{analyst.opinion === "BUY" ? "매수" : "중립"}</span></article>)}</div>
                <aside className="rounded-lg border border-hairline bg-surface-soft p-4"><p className="text-[12px] font-bold uppercase tracking-[0.16em] text-muted">Consensus</p><h3 className="mt-2 font-bold text-ink">투자의견</h3><div className="mt-4 flex items-end gap-2"><strong className="text-2xl font-bold text-up">매수</strong><span className="mb-1 text-xs text-muted">21 / 28</span></div><div className="mt-4 flex h-2 overflow-hidden rounded-pill"><span className="w-3/4 bg-[var(--market-up)]" /><span className="w-[21%] bg-amber-500" /><span className="flex-1 bg-[var(--market-down)]" /></div><div className="mt-2 flex justify-between text-[12px] text-muted"><span>매수 21</span><span>중립 6</span><span>매도 1</span></div><div className="mt-5 border-t border-hairline pt-4"><p className="text-[12px] text-muted">평균 목표가</p><strong className="num mt-2 block text-xl text-up">$94.00</strong><span className="num mt-1 block text-xs text-up">현재 대비 +20.5%</span></div></aside>
            </div>
        </div>
    );
}

function KpiStrip({ items, positive }: { items: string[][]; positive?: boolean }) {
    return <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">{items.map(([label, value, meta], index) => <div key={label} className="rounded-lg border border-hairline bg-surface-soft p-3"><p className="text-[12px] text-muted">{label}</p><strong className="num mt-1.5 block text-base text-ink">{value}</strong><span className={`mt-1 block text-[12px] ${positive || index === 3 ? "text-up" : "text-muted-soft"}`}>{meta}</span></div>)}</div>;
}

function DataTable({ headers, rows, blueColumns, redLast, redMiddle }: { headers: readonly string[]; rows: readonly (readonly string[])[]; blueColumns?: boolean; redLast?: boolean; redMiddle?: boolean }) {
    return <div className="mt-5 overflow-hidden rounded-lg border border-hairline"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-[13px]"><thead className="bg-surface-soft text-muted"><tr>{headers.map((header, index) => <th key={header} className={`px-3 py-2.5 font-medium ${index === 0 ? "text-left" : "text-right"}`}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className={`${rowIndex === 0 && headers[0] === "종목명" ? "bg-[rgba(207,32,47,0.05)]" : "bg-canvas"} border-t border-hairline transition-colors hover:bg-surface-soft`}>{row.map((cell, index) => <td key={index} className={`px-3 py-2 ${index === 0 ? "text-left font-semibold text-ink" : "num text-right text-body"} ${blueColumns && index > 0 && index < 4 ? "text-down" : ""} ${redLast && index === row.length - 1 ? (Number.parseFloat(cell) < 0 ? "text-down" : "text-up") : ""} ${redMiddle && index === 2 ? "font-bold text-up" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
}

function Analysis({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
    return <div className={`mt-5 rounded-lg border p-4 text-[13px] ${tone === "green" ? "border-[rgba(207,32,47,0.2)] bg-[rgba(207,32,47,0.05)]" : "border-[rgba(29,78,216,0.2)] bg-[rgba(29,78,216,0.05)]"}`}><strong className={tone === "green" ? "text-up" : "text-down"}>AI STOCK 분석</strong><p className="mt-2 leading-6 text-body">{children}</p></div>;
}
