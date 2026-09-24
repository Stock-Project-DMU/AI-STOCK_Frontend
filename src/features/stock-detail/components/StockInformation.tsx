"use client";
import { useEffect, useState } from "react";
import { getStockResearch } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format/dateTime";
const tabs = [["overview", "개요"], ["finance", "재무제표"], ["earnings", "최근 분기 실적"], ["dividend", "배당 공시"], ["peers", "시가총액 상위 비교"], ["analysts", "투자의견"]];
const labels: Record<string, string> = { stockCode: "종목코드", stockName: "종목명", currentPrice: "현재가", changeAmount: "등락 금액", changeRate: "등락률(%)", volume: "거래량", per: "주가수익비율", pbr: "주가순자산비율", high52w: "52주 최고가", low52w: "52주 최저가", listingShares: "상장주식수(천주)", foreignExhaustionRate: "외국인 보유한도 소진율(%)", updatedAt: "조회 시각", bizYear: "사업연도", revenue: "매출액", operatingProfit: "영업이익", netIncome: "당기순이익", totalAssets: "자산총계", totalLiabilities: "부채총계", totalEquity: "자본총계", rank: "순위", price: "현재가", extraInfo: "추가 정보", date: "기준일", targetPrice: "목표주가", opinion: "투자의견", broker: "증권사", high52wDate: "52주 최고가 기준일", low52wDate: "52주 최저가 기준일", securitiesFirm: "증권사", opinionBefore: "변경 전 투자의견", opinionAfter: "변경 후 투자의견", targetPriceBefore: "변경 전 목표주가", targetPriceAfter: "변경 후 목표주가", closePriceOnDate: "의견 발표일 종가", corp_name: "회사명", corp_cls: "시장 구분", stock_code: "종목코드", stock_knd: "주식 종류", bsns_year: "사업연도", reprt_code: "보고서 구분", se: "배당 항목", thstrm: "당기", frmtrm: "전기", lwfr: "전전기", stlm_dt: "결산일" };
const opinionLabels: Record<string, string> = {
    BUY: "매수", "STRONG BUY": "적극 매수", HOLD: "보유", SELL: "매도",
    "STRONG SELL": "적극 매도", NEUTRAL: "중립", OUTPERFORM: "시장수익률 상회",
    UNDERPERFORM: "시장수익률 하회", "MARKET PERFORM": "시장수익률 수준",
    OVERWEIGHT: "비중 확대", UNDERWEIGHT: "비중 축소", "NOT RATED": "평가 없음",
};
function formatResearchValue(key: string, value: unknown): string {
    const text = String(value);
    if (key === "updatedAt") return formatDateTime(text);
    if (["opinion", "opinionBefore", "opinionAfter"].includes(key)) {
        return opinionLabels[text.trim().replace(/[_-]/g, " ").replace(/\s+/g, " ").toUpperCase()] ?? text;
    }
    if (key === "corp_cls") return ({ Y: "유가증권시장", K: "코스닥시장", N: "코넥스시장", E: "기타" } as Record<string, string>)[text] ?? text;
    if (key === "reprt_code") return ({ "11011": "사업보고서", "11012": "반기보고서", "11013": "1분기보고서", "11014": "3분기보고서" } as Record<string, string>)[text] ?? text;
    return text;
}
export default function StockInformation({ stockCode }: { stockCode: string }) {
    const [tab, setTab] = useState("overview");
    const [result, setResult] = useState<unknown>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let active = true;
        async function load() { setLoading(true); setError(""); try { const result = await getStockResearch(stockCode, tab); if (active) setResult(result); } catch (error) { if (active) { setResult(null); setError(getApiErrorMessage(error, "자료를 불러오지 못했습니다.")); } } finally { if (active) setLoading(false); } }
        void load(); return () => { active = false; };
    }, [stockCode, tab]);
    const records: Record<string, unknown>[] = Array.isArray(result) ? result : result && typeof result === "object" ? [result as Record<string, unknown>] : [];
    return <div className="cq-stock-information mx-auto flex max-w-[1500px] flex-col gap-3 p-4"><nav className="cq-stock-information-nav flex gap-2 overflow-auto">{tabs.map(([key, title]) => <button key={key} onClick={() => setTab(key)} className={`shrink-0 rounded p-3 text-left text-sm ${tab === key ? "bg-primary text-white" : "bg-canvas"}`}>{title}</button>)}</nav><section className="min-w-0 flex-1 rounded-lg border border-hairline bg-canvas p-5">
        <h2 className="mb-4 text-lg font-bold">{tabs.find(([key]) => key === tab)?.[1]}</h2>
        {loading && <p role="status">자료 조회 중...</p>}{error && <p role="alert" className="text-red-500">{error}</p>}
        {!loading && !error && !records.length && <p className="text-sm text-muted">해당 기간에 제공된 자료가 없습니다.</p>}
        {!loading && records.map((record, index) => <dl key={index} className="mb-4 grid gap-2 rounded border border-hairline p-4 sm:grid-cols-2">{Object.entries(record).filter(([key]) => !["corpCode", "rcept_no", "corp_code"].includes(key)).map(([key, value]) => <div key={key} className="border-b border-hairline py-2 text-sm"><dt className="text-muted">{labels[key] ?? key}</dt><dd className="mt-1 break-words font-semibold">{value == null ? "미제공" : typeof value === "number" ? value.toLocaleString("ko-KR") : formatResearchValue(key, value)}</dd></div>)}</dl>)}
    </section></div>;
}
