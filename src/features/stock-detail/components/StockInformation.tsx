"use client";

import { useState } from "react";
import { ANALYSTS, DIVIDEND_ROWS, EARNINGS_ROWS, FINANCE_ROWS, INFORMATION_TABS, PEER_ROWS } from "../constants/stockData";
import type { InformationTab } from "../types";

export default function StockInformation() {
    const [tab, setTab] = useState<InformationTab>("overview");

    return (
        <div className="mx-auto flex max-w-[1160px] bg-white">
            <nav className="w-36 shrink-0 border-r py-2">
                {INFORMATION_TABS.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`block w-full border-l-2 px-5 py-4 text-left text-xs ${tab === item.id ? "border-red-500 bg-red-50 font-bold text-red-500" : "border-transparent text-gray-500"}`}>{item.label}</button>)}
            </nav>
            <div className="min-h-[650px] min-w-0 flex-1 p-7">{renderTab(tab)}</div>
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

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return <div><h2 className="text-xl font-black">{title}</h2><p className="mt-1 text-xs text-gray-400">{subtitle}</p></div>;
}

function Overview() {
    return <div><div className="flex justify-between"><SectionTitle title="삼성전자" subtitle="한국 · 005930 · KOSPI" /><button className="h-9 rounded-lg border px-4 text-xs">↗ 홈페이지</button></div><p className="mt-5 rounded-lg bg-gray-50 p-4 text-xs">반도체, 모바일, 디스플레이, 가전 등 다양한 사업을 영위하는 글로벌 전자·IT 기업</p><dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border text-xs"><Info label="시가총액" value="19조 3,123억원" /><Info label="실제 기업 가치" value="19조 8,737억원" /><Info label="기업명" value="삼성전자" /><Info label="대표이사" value="한종희" /><Info label="상장일" value="1975년 6월 11일" /><Info label="발행주식수" value="5,969,782,550주" /></dl><h3 className="mt-8 font-bold">매출 · 산업 구성</h3><div className="mt-8 flex items-center justify-center gap-10"><div className="h-36 w-36 rounded-full border-[24px] border-blue-600" /><p className="text-xs"><i className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-600" />전자 제품 및 관련 부품 제조업　100.00%</p></div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
    return <div className="flex justify-between border-b border-r p-4"><dt className="text-gray-400">{label}</dt><dd className="font-bold">{value}</dd></div>;
}

function Financials() {
    return <div><SectionTitle title="재무 정보" subtitle="최근 실적 기준: [연결, 백만원]" /><DataTable headers={["항목", "24.Q1", "24.Q2", "24.Q3", "24.Q4"]} rows={FINANCE_ROWS} blueColumns /><Analysis tone="red">지표는 꾸준히 성장 중이나 아직 투자 구간입니다. 영업현금흐름이 마이너스이므로 BEP(손익분기점) 도달 가능성에 주목할 필요가 있습니다.</Analysis></div>;
}

function Earnings() {
    return <div><SectionTitle title="실적 발표" subtitle="최근 실적 | 실제 vs 컨센서스" /><DataTable headers={["분기", "발표일", "EPS 예상", "EPS 실제", "서프라이즈"]} rows={EARNINGS_ROWS} redLast /><Analysis tone="green">최근 3분기 연속 예상 서프라이즈를 기록하고 있어 전자 부품 및 반도체 업종에서 주목 받고 있습니다.</Analysis></div>;
}

function Dividend() {
    return <div><SectionTitle title="배당 정보 · 삼성전자 (005930)" subtitle="출처: 연합인포맥스 및 기업 IR자료 · 26년 기준" /><div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["현재 배당금", "$1.44"], ["배당 수익률", "2.32%"], ["배당 성향", "26.0%"], ["배당 주기", "분기"]].map(([label, value]) => <div key={label} className="rounded-xl border bg-gray-50 p-5 text-center"><p className="text-xs text-gray-400">{label}</p><strong className="mt-2 block text-xl">{value}</strong></div>)}</div><div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm"><strong>📅 다음 배당 일정</strong><p className="mt-2 font-bold">2026년 4월 15일 지급 예정</p></div><h3 className="mt-6 font-bold">배당 지급 내역</h3><DataTable headers={["지급일", "배당락일", "주당 배당금", "배당 수익률", "배당 유형"]} rows={DIVIDEND_ROWS} redMiddle /><h3 className="mt-7 font-bold">연간 배당금 추이</h3><div className="mt-5 flex h-36 items-end justify-around border-b pb-2">{[["2023", 70, "$1.20"], ["2024", 85, "$1.32"], ["2025", 100, "$1.44"]].map(([year, height, value]) => <div key={year} className="text-center text-xs"><div className={`mx-auto w-10 rounded-t ${year === "2025" ? "bg-red-500" : "bg-gray-100"}`} style={{ height: `${height}px` }} /><strong className="mt-2 block text-red-500">{value}</strong><span className="text-gray-400">{year}</span></div>)}</div><Analysis tone="green">삼성전자는 안정적인 배당 수준을 유지하고 있으며, 배당 성장과 지속 가능성이 높은 것으로 판단됩니다.</Analysis></div>;
}

function Peers() {
    return <div><SectionTitle title="동종 업계 비교" subtitle="가전/전자 소프트웨어 · 5종" /><DataTable headers={["종목명", "현재가", "시가총액", "PER", "52주 수익률"]} rows={PEER_ROWS} redLast /></div>;
}

function Analysts() {
    return <div><SectionTitle title="애널리스트 분석" subtitle="최근 3개 보고서 및 목표가" /><div className="mt-6 space-y-4">{ANALYSTS.map((analyst) => <article key={analyst.name} className="flex items-center gap-5 rounded-xl border p-5"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-black text-white ${analyst.tone === "green" ? "bg-emerald-500" : "bg-amber-500"}`}>{analyst.opinion}</span><div className="flex-1"><strong>{analyst.name}</strong><p className="text-xs text-gray-400">{analyst.firm} · {analyst.date}</p><p className="mt-2 text-sm font-bold">목표가 <em className="not-italic text-red-500">{analyst.target}</em> <span className="text-xs">(현재 대비 {analyst.upside})</span></p></div><span className={`rounded px-3 py-1 text-xs font-bold ${analyst.tone === "green" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"}`}>{analyst.opinion === "BUY" ? "매수" : "중립"}</span></article>)}</div><div className="mt-5 rounded-xl bg-gray-100 p-5"><h3 className="font-bold">컨센서스</h3><p className="mt-2 text-sm">평균 목표가 <strong className="text-red-500">$94.00</strong> (현재 대비 +20.5%) · 매수 21 / 중립 6 / 매도 1</p></div></div>;
}

function DataTable({ headers, rows, blueColumns, redLast, redMiddle }: { headers: readonly string[]; rows: readonly (readonly string[])[]; blueColumns?: boolean; redLast?: boolean; redMiddle?: boolean }) {
    return <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b text-gray-400">{headers.map((header, index) => <th key={header} className={`px-3 py-3 font-normal ${index === 0 ? "text-left" : "text-right"}`}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className={rowIndex === 0 && headers[0] === "종목명" ? "bg-red-50" : "border-b border-gray-100"}>{row.map((cell, index) => <td key={index} className={`px-3 py-4 ${index === 0 ? "text-left font-semibold" : "text-right"} ${blueColumns && index > 0 && index < 4 ? "text-blue-500" : ""} ${redLast && index === row.length - 1 ? "text-red-500" : ""} ${redMiddle && index === 2 ? "text-red-500" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Analysis({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
    return <div className={`mt-6 rounded-xl border p-4 text-sm ${tone === "green" ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}><strong className={tone === "green" ? "text-emerald-600" : "text-red-500"}>✓ AI 분석 코멘트</strong><p className="mt-2 text-gray-700">{children}</p></div>;
}
