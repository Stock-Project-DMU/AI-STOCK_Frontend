"use client";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { getStockResearch } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatEokWon } from "@/lib/format/money";
import StockDividendSchedule from "./StockDividendSchedule";
import type {
    InformationTab,
    StockAnalystsContent,
    StockDividendContent,
    StockEarningsContent,
    StockFinanceContent,
    StockFinancialIndicators,
    StockOverviewContent,
    StockPeersContent,
    StockResearchEnvelope,
} from "../types";

const tabs: [InformationTab, string][] = [
    ["overview", "개요"],
    ["finance", "재무제표"],
    ["earnings", "분기 실적"],
    ["dividend", "배당"],
    ["peers", "시가총액 상위 비교"],
    ["analysts", "투자의견"],
];

const opinionLabels: Record<string, string> = {
    BUY: "매수", "STRONG BUY": "적극 매수", HOLD: "보유", SELL: "매도",
    "STRONG SELL": "적극 매도", NEUTRAL: "중립", OUTPERFORM: "시장수익률 상회",
    UNDERPERFORM: "시장수익률 하회", "MARKET PERFORM": "시장수익률 수준",
    OVERWEIGHT: "비중 확대", UNDERWEIGHT: "비중 축소", "NOT RATED": "평가 없음",
};
function opinionLabel(value: string) {
    return opinionLabels[value.trim().replace(/[_-]/g, " ").replace(/\s+/g, " ").toUpperCase()] ?? value;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
    return <div className="flex items-center justify-between gap-3 border-b border-hairline py-2 text-sm">
        <dt className="text-muted">{label}</dt>
        <dd className="break-words text-right font-semibold">{value}</dd>
    </div>;
}

function growthText(current: number | null, previous: number | null, growthRate: number | null) {
    if (current == null || previous == null) return "-";
    if (growthRate != null) return `${growthRate >= 0 ? "+" : ""}${growthRate}%`;
    if (previous < 0 && current >= 0) return "흑자전환";
    if (previous >= 0 && current < 0) return "적자전환";
    if (previous < 0 && current < 0) return "적자지속";
    return "-";
}

function wonCell(v: number | null) {
    return v == null ? "-" : `${v.toLocaleString("ko-KR")}원`;
}
function percentCell(v: number | null) {
    return v == null ? "-" : `${v}%`;
}

// PER이 음수면 적자 상태라 배수로서 의미가 없어 "적자"로 표시한다.
function PerValue({ per }: { per: number | null }) {
    if (per == null) return <>-</>;
    if (per < 0) return <span className="text-muted" title="최근 순이익이 적자라 PER을 계산하지 않습니다">적자</span>;
    return <>{per}</>;
}

function OverviewSection({ content }: { content: StockOverviewContent }) {
    return <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline p-4">
            <h3 className="mb-2 text-sm font-bold text-muted">법인 정보</h3>
            {content.company ? <dl>
                <Row label="회사명" value={content.company.corpName} />
                {content.company.corpNameEng && <Row label="영문명" value={content.company.corpNameEng} />}
                <Row label="대표자" value={content.company.ceoName} />
                <Row label="설립일" value={content.company.establishedDate} />
                <Row label="결산월" value={content.company.settlementMonth} />
                <Row label="전화번호" value={content.company.phoneNumber ?? "-"} />
                <Row label="홈페이지" value={content.company.homepageUrl ? <a href={content.company.homepageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{content.company.homepageUrl}</a> : "-"} />
                <Row label="IR 페이지" value={content.company.irUrl ? <a href={content.company.irUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{content.company.irUrl}</a> : "-"} />
                <Row label="주소" value={content.company.address} />
                <Row label="법인등록번호" value={content.company.jurirNo ?? "-"} />
                <Row label="사업자등록번호" value={content.company.bizrNo ?? "-"} />
                <Row label="업종코드" value={content.company.indutyCode ?? "-"} />
            </dl> : <p className="text-sm text-muted">ETF는 법인 정보를 제공하지 않습니다.</p>}
            <dl className="mt-1"><Row label="상장주식수" value={content.listingShares != null ? `${content.listingShares.toLocaleString("ko-KR")}주` : "-"} /></dl>
        </div>
        <div className="rounded-lg border border-hairline p-4">
            <h3 className="mb-2 text-sm font-bold text-muted">재무 지표</h3>
            {content.financial ? <dl>
                <Row label="ROE" value={percentCell(content.financial.roe)} />
                <Row label="ROA" value={percentCell(content.financial.roa)} />
                <Row label="영업이익률" value={percentCell(content.financial.operatingMargin)} />
                <Row label="순이익률" value={percentCell(content.financial.netMargin)} />
                <Row label="EPS" value={wonCell(content.financial.eps)} />
                <Row label="부채비율" value={percentCell(content.financial.debtRatio)} />
                <Row label="유동비율" value={percentCell(content.financial.currentRatio)} />
            </dl> : <p className="text-sm text-muted">ETF는 재무 지표를 제공하지 않습니다.</p>}
        </div>
        <div className="rounded-lg border border-hairline p-4 sm:col-span-2">
            <h3 className="mb-2 text-sm font-bold text-muted">시세 지표</h3>
            <dl className="grid gap-x-6 sm:grid-cols-2">
                <Row label="시장" value={content.market} />
                <Row label="시가총액" value={formatEokWon(content.marketCap)} />
                <Row label="PER" value={<PerValue per={content.per} />} />
                <Row label="PBR" value={content.pbr ?? "-"} />
                <Row label="52주 최고가" value={content.high52w != null ? `${content.high52w.toLocaleString("ko-KR")}원 (${content.high52wDate})` : "-"} />
                <Row label="52주 최저가" value={content.low52w != null ? `${content.low52w.toLocaleString("ko-KR")}원 (${content.low52wDate})` : "-"} />
                <Row label="외국인 보유한도 소진율" value={content.foreignExhaustionRate != null ? `${content.foreignExhaustionRate}%` : "-"} />
            </dl>
        </div>
    </div>;
}

const FINANCE_GROUPS: { title: string; rows: [keyof StockFinancialIndicators, string, (v: number | null) => string][] }[] = [
    { title: "손익", rows: [
        ["revenue", "매출액", formatEokWon],
        ["grossProfit", "매출총이익", formatEokWon],
        ["operatingProfit", "영업이익", formatEokWon],
        ["profitBeforeTax", "세전이익", formatEokWon],
        ["netIncome", "당기순이익", formatEokWon],
        ["eps", "EPS", wonCell],
    ] },
    { title: "재무상태", rows: [
        ["currentAssets", "유동자산", formatEokWon],
        ["currentLiabilities", "유동부채", formatEokWon],
        ["cashAndEquivalents", "현금성자산", formatEokWon],
        ["totalAssets", "자산총계", formatEokWon],
        ["totalLiabilities", "부채총계", formatEokWon],
        ["issuedCapital", "자본금", formatEokWon],
        ["retainedEarnings", "이익잉여금", formatEokWon],
        ["totalEquity", "자본총계", formatEokWon],
    ] },
    { title: "현금흐름", rows: [
        ["operatingCashFlow", "영업활동현금흐름", formatEokWon],
        ["investingCashFlow", "투자활동현금흐름", formatEokWon],
        ["financingCashFlow", "재무활동현금흐름", formatEokWon],
    ] },
    { title: "비율", rows: [
        ["operatingMargin", "영업이익률", percentCell],
        ["netMargin", "순이익률", percentCell],
        ["roe", "ROE", percentCell],
        ["roa", "ROA", percentCell],
        ["debtRatio", "부채비율", percentCell],
        ["currentRatio", "유동비율", percentCell],
    ] },
];
function FinanceSection({ content }: { content: StockFinanceContent }) {
    if (!content.length) return <p className="text-sm text-muted">재무제표 정보가 없습니다.</p>;
    return <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface-strong text-muted"><tr><th className="px-4 py-3 font-semibold">사업연도</th>{content.map(year => <th key={year.bizYear} className="px-4 py-3 text-right font-semibold">{year.bizYear}</th>)}</tr></thead>
            <tbody>{FINANCE_GROUPS.map(group => <Fragment key={group.title}>
                <tr className="border-t border-hairline bg-surface-soft"><td colSpan={content.length + 1} className="px-4 py-2 font-bold">{group.title}</td></tr>
                {group.rows.map(([key, label, format]) => <tr key={key} className="border-t border-hairline">
                    <td className="px-4 py-3 text-muted">{label}</td>
                    {content.map(year => <td key={year.bizYear} className="px-4 py-3 text-right font-semibold">{format(year[key] as number | null)}</td>)}
                </tr>)}
            </Fragment>)}</tbody>
        </table>
    </div>;
}

function EarningsSection({ content }: { content: StockEarningsContent }) {
    const rows: [string, number | null, number | null, number | null][] = [
        ["매출액", content.revenue, content.previousRevenue, content.revenueGrowthRate],
        ["영업이익", content.operatingProfit, content.previousOperatingProfit, content.operatingProfitGrowthRate],
        ["당기순이익", content.netIncome, content.previousNetIncome, content.netIncomeGrowthRate],
    ];
    return <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-surface-strong text-muted"><tr>{["항목", "이번 분기", "전년 동기", "증감"].map((label, index) => <th key={label} className={`px-4 py-3 font-semibold ${index > 0 ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
            <tbody>{rows.map(([label, current, previous, growthRate]) => <tr key={label} className="border-t border-hairline">
                <td className="px-4 py-3 text-muted">{label}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatEokWon(current)}</td>
                <td className="px-4 py-3 text-right">{formatEokWon(previous)}</td>
                <td className="px-4 py-3 text-right font-semibold">{growthText(current, previous, growthRate)}</td>
            </tr>)}</tbody>
        </table>
    </div>;
}

function DividendSection({ content }: { content: StockDividendContent }) {
    return <div className="flex flex-col gap-6">
        <div>
            <h3 className="mb-3 text-sm font-bold text-muted">연간 배당 지표</h3>
            {content.annual ? <div className="overflow-x-auto rounded-lg border border-hairline">
                <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-surface-strong text-muted"><tr>{["항목", "주식 종류", "당기", "전기", "전전기"].map((label, index) => <th key={label} className={`px-4 py-3 font-semibold ${index >= 2 ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
                    <tbody>{content.annual.indicators.map((row, index) => <tr key={index} className="border-t border-hairline">
                        <td className="px-4 py-3">{row.label}</td>
                        <td className="px-4 py-3">{row.stockKind ?? "-"}</td>
                        <td className="px-4 py-3 text-right font-semibold">{row.currentValue?.toLocaleString("ko-KR") ?? "-"}</td>
                        <td className="px-4 py-3 text-right">{row.previousValue?.toLocaleString("ko-KR") ?? "-"}</td>
                        <td className="px-4 py-3 text-right">{row.beforePreviousValue?.toLocaleString("ko-KR") ?? "-"}</td>
                    </tr>)}</tbody>
                </table>
            </div> : <p className="text-sm text-muted">연간 배당 지표 정보가 없습니다.</p>}
        </div>
        <div>
            <h3 className="mb-3 text-sm font-bold text-muted">배당 일정</h3>
            <StockDividendSchedule items={content.schedules} />
        </div>
    </div>;
}

function PeersSection({ content }: { content: StockPeersContent }) {
    if (!content.items.length) return <p className="text-sm text-muted">비교할 종목 정보가 없습니다.</p>;
    return <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">현재 순위 <strong className="text-ink">{content.rank}</strong> / {content.totalCount}위</p>
        <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface-strong text-muted"><tr>{["순위", "종목명", "시가총액", "비중", "PER", "PBR"].map((label, index) => <th key={label} className={`px-4 py-3 font-semibold ${index >= 2 ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
            <tbody>{content.items.map(item => <tr key={item.stockCode} className={`border-t border-hairline ${item.rank === content.rank ? "bg-primary/10 font-bold" : ""}`}>
                <td className="px-4 py-3">{item.rank}</td>
                <td className="px-4 py-3">{item.stockName}</td>
                <td className="px-4 py-3 text-right">{formatEokWon(item.marketCap)}</td>
                <td className="px-4 py-3 text-right">{item.extraInfo ?? "-"}</td>
                <td className="px-4 py-3 text-right"><PerValue per={item.per} /></td>
                <td className="px-4 py-3 text-right">{item.pbr ?? "-"}</td>
            </tr>)}</tbody>
        </table>
        </div>
    </div>;
}

function AnalystsSection({ content }: { content: StockAnalystsContent }) {
    if (!content.length) return <p className="text-sm text-muted">투자의견 정보가 없습니다.</p>;
    return <ul className="flex flex-col gap-3">{content.map((item, index) => <li key={index} className="rounded-lg border border-hairline p-4 text-sm">
        <div className="flex items-center justify-between text-muted"><span>{item.securitiesFirm}</span><span>{item.date}</span></div>
        <div className="mt-2 flex items-center gap-2 text-base">
            {item.opinionBefore && <><span className="text-muted">{opinionLabel(item.opinionBefore)}</span><span className="text-muted">→</span></>}
            <span className="font-bold">{opinionLabel(item.opinionAfter)}</span>
        </div>
        <div className="mt-1 text-muted">
            목표주가 {item.targetPriceBefore != null && <>{item.targetPriceBefore.toLocaleString("ko-KR")}원 → </>}
            <span className="font-bold text-ink">{item.targetPriceAfter != null ? `${item.targetPriceAfter.toLocaleString("ko-KR")}원` : "-"}</span>
        </div>
    </li>)}</ul>;
}

export default function StockInformation({ stockCode }: { stockCode: string }) {
    const [tab, setTab] = useState<InformationTab>("overview");
    // 탭이 바뀐 직후 첫 렌더링에서 이전 탭의 envelope가 새 섹션 컴포넌트로 넘어가 터지는 걸 막기 위해,
    // 응답을 어느 탭 것인지와 함께 저장하고 tab과 일치할 때만 렌더링한다.
    const [result, setResult] = useState<{ tab: InformationTab; envelope: StockResearchEnvelope<unknown> } | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try {
                const envelope = await getStockResearch<StockResearchEnvelope<unknown>>(stockCode, tab);
                if (active) setResult({ tab, envelope });
            } catch (error) {
                if (active) { setResult(null); setError(getApiErrorMessage(error, "자료를 불러오지 못했습니다.")); }
            } finally {
                if (active) setLoading(false);
            }
        }
        void load();
        return () => { active = false; };
    }, [stockCode, tab]);
    const envelope = result?.tab === tab ? result.envelope : null;

    return <div className="cq-stock-information mx-auto flex max-w-[1500px] flex-col gap-3 p-4">
        <nav className="cq-stock-information-nav flex gap-2 overflow-auto">{tabs.map(([key, title]) => <button key={key} onClick={() => setTab(key)} className={`shrink-0 rounded p-3 text-left text-sm ${tab === key ? "bg-primary text-white" : "bg-canvas"}`}>{title}</button>)}</nav>
        <section className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas p-5">
            <h2 className="mb-2 text-lg font-bold">{tabs.find(([key]) => key === tab)?.[1]}</h2>
            {loading && <p role="status">자료 조회 중...</p>}
            {error && <p role="alert" className="text-red-500">{error}</p>}
            {!loading && !error && envelope && <>
                {(envelope.sourceName || envelope.isSimulated) && <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                    {envelope.sourceName && <span>출처: {envelope.sourceName}{envelope.sourceDetail ? ` · ${envelope.sourceDetail}` : ""}</span>}
                    {envelope.sourceUrl && <a href={envelope.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">원문 보기 ↗</a>}
                    {envelope.isSimulated && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">모의 데이터</span>}
                </div>}
                {envelope.notice && <p className="mb-4 rounded-lg bg-surface-soft px-3 py-2 text-xs text-muted">{envelope.notice}</p>}
                {envelope.content == null
                    ? (!envelope.notice && <p className="text-sm text-muted">해당 자료가 없습니다.</p>)
                    : tab === "overview" ? <OverviewSection content={envelope.content as StockOverviewContent} />
                    : tab === "finance" ? <FinanceSection content={envelope.content as StockFinanceContent} />
                    : tab === "earnings" ? <EarningsSection content={envelope.content as StockEarningsContent} />
                    : tab === "dividend" ? <DividendSection content={envelope.content as StockDividendContent} />
                    : tab === "peers" ? <PeersSection content={envelope.content as StockPeersContent} />
                    : <AnalystsSection content={envelope.content as StockAnalystsContent} />}
            </>}
        </section>
    </div>;
}
