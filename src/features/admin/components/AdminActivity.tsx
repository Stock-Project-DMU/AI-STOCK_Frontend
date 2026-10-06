"use client";

import { useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import AdminPager from "./AdminPager";

type Target = "charge" | "transaction" | "user" | "inquiry";
type Category = "member" | "trade" | "charge" | "inquiry";
type Activity = { key: string; category: Category; tone: "blue" | "green" | "amber" | "red" | "violet" | "gray"; title: string; detail: string; at: string; target?: [Target, number] };

const number = (value: number) => value.toLocaleString("ko-KR");
const date = (value: string) => value.replace("T", " ").slice(5, 16);
const statusText: Record<string, string> = { ACTIVE: "활성", SUSPENDED: "정지" };
const chargeStatus: Record<string, string> = { APPROVED: " (승인됨)", REJECTED: " (거절됨)" };
const PER_PAGE = 10;

function ago(value: string) {
    const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
    if (Number.isNaN(minutes)) return date(value);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return days < 7 ? `${days}일 전` : date(value);
}

export function ActivityList({ items, open, full }: { items: Activity[]; open: (kind: Target, id: number) => void; full?: boolean }) {
    return <ol className={`ao-activity${full ? " full" : ""}`}>{items.map(item => {
        const body = <><i className={`dot-${item.tone}`} /><span><b>{item.title}</b><small title={item.at.replace("T", " ").slice(0, 16)}>{item.detail} · {ago(item.at)}</small></span></>;
        const target = item.target;
        return <li key={item.key}>{target ? <button onClick={() => open(target[0], target[1])}>{body}</button> : <div>{body}</div>}</li>;
    })}</ol>;
}

const filters: [Category | "all", string][] = [["all", "전체"], ["member", "회원이력"], ["trade", "거래이력"], ["charge", "충전차감이력"], ["inquiry", "문의이력"]];
const searchFields: [string, string][] = [["ALL", "전체"], ["USER_ID", "회원번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["EMAIL", "이메일"]];

// 전체 활동 기록 전용 서버 페이지네이션 응답 — 종류별 세부정보는 member/trade/charge/balance/inquiry 중 해당하는 묶음 하나만 채워진다.
export type ActivityPage<T> = { content: T[]; totalElements: number; totalPages: number; number: number };
type MemberBundle = { beforeValue: string | null; afterValue: string | null; reason: string | null; adminLoginId: string | null; accountNumber: string | null };
type TradeBundle = { orderId: number; accountNumber: string; stockCode: string; stockName: string; orderType: "BUY" | "SELL"; priceType: "MARKET" | "LIMIT"; quantity: number; orderPrice: number; execPrice: number | null; executedAmount: number | null; status: "PENDING" | "EXECUTED" | "CANCELLED"; executedAt: string | null; cancelReason: string | null; cancelledByLoginId: string | null; cancelledAt: string | null };
type ChargeBundle = { requestId: number; accountNumber: string; requestedAmount: number; reason: string; status: "PENDING" | "APPROVED" | "REJECTED"; decidedByName: string | null; decisionReason: string | null; decidedAt: string | null; depositedAmount: number | null; balanceAfter: number | null };
type BalanceBundle = { transactionId: number; accountNumber: string; type: "AUTO_CHARGE" | "AUTO_DEDUCTION" | "ADMIN_CHARGE" | "ADMIN_DEDUCTION"; amount: number; balanceAfter: number; reason: string | null; processedByLoginId: string | null };
type InquiryBundle = { inquiryId: number; title: string; status: string; answer: string | null; answeredAt: string | null; answeredByName: string | null };
export type AdminActivityItem = {
    activityType: "SIGNUP" | "WITHDRAWAL" | "USER_STATUS" | "ACCOUNT_STATUS" | "ADMIN_CREATE" | "TRADE" | "CHARGE_REQUEST" | "SELF_BALANCE" | "ADMIN_BALANCE" | "INQUIRY";
    category: "MEMBER" | "TRADE" | "CHARGE" | "INQUIRY";
    id: number;
    occurredAt: string;
    userId: number | null;
    userName: string | null;
    loginId: string | null;
    member: MemberBundle | null;
    trade: TradeBundle | null;
    charge: ChargeBundle | null;
    balance: BalanceBundle | null;
    inquiry: InquiryBundle | null;
};

export function toActivity(item: AdminActivityItem): Activity {
    const category = item.category.toLowerCase() as Category;
    const target: [Target, number] | undefined = item.userId != null ? ["user", item.userId] : undefined;
    switch (item.activityType) {
        case "SIGNUP":
            return { key: `a${item.id}`, category, tone: "blue", title: "신규 회원 가입", detail: `${item.userName} · ${item.loginId}`, at: item.occurredAt, target };
        case "WITHDRAWAL":
            return { key: `a${item.id}`, category, tone: "gray", title: "회원 탈퇴", detail: `${item.userName} · ${item.loginId}`, at: item.occurredAt, target };
        case "USER_STATUS":
            return { key: `a${item.id}`, category, tone: item.member?.afterValue === "SUSPENDED" ? "red" : "green", title: "회원 상태 변경", detail: `${item.userName} · ${statusText[item.member?.beforeValue ?? ""] ?? item.member?.beforeValue} → ${statusText[item.member?.afterValue ?? ""] ?? item.member?.afterValue}${item.member?.reason ? ` · ${item.member.reason}` : ""} · 처리 ${item.member?.adminLoginId ?? "—"}`, at: item.occurredAt, target };
        case "ACCOUNT_STATUS":
            return { key: `a${item.id}`, category, tone: item.member?.afterValue === "SUSPENDED" ? "red" : "green", title: "계좌 상태 변경", detail: `${item.userName} · ${item.member?.accountNumber ?? ""} · ${statusText[item.member?.beforeValue ?? ""] ?? item.member?.beforeValue} → ${statusText[item.member?.afterValue ?? ""] ?? item.member?.afterValue} · 처리 ${item.member?.adminLoginId ?? "—"}`, at: item.occurredAt, target };
        case "ADMIN_CREATE":
            return { key: `a${item.id}`, category, tone: "violet", title: "관리자 계정 생성", detail: `${item.userName} · ${item.loginId}`, at: item.occurredAt, target };
        case "TRADE": {
            const t = item.trade;
            const cancelled = t?.status === "CANCELLED";
            const title = t?.status === "EXECUTED" ? `거래 체결: ${t.stockName}` : cancelled ? `주문 취소: ${t?.stockName ?? ""}` : `주문 접수: ${t?.stockName ?? ""}`;
            return { key: `a${item.id}`, category, tone: t?.status === "EXECUTED" ? "green" : t?.status === "PENDING" ? "amber" : "gray", title, detail: `${item.userName} · ${t?.orderType === "BUY" ? "매수" : "매도"} ${number(t?.quantity ?? 0)}주${t?.executedAmount != null ? ` · ${number(t.executedAmount)}원` : ""}${cancelled && t?.cancelReason ? ` · ${t.cancelledByLoginId ? "관리자 취소" : "취소"} (${t.cancelReason})` : ""}`, at: item.occurredAt, target: t ? ["transaction", t.orderId] : undefined };
        }
        case "CHARGE_REQUEST": {
            const c = item.charge;
            return { key: `a${item.id}`, category, tone: c?.status === "APPROVED" ? "green" : c?.status === "REJECTED" ? "gray" : "amber", title: `캐시 충전 요청${chargeStatus[c?.status ?? ""] ?? ""}`, detail: `${item.userName} · ${number(c?.requestedAmount ?? 0)}원${c?.decisionReason ? ` · ${c.decisionReason}` : ""}${c?.balanceAfter != null ? ` · 처리후 잔고 ${number(c.balanceAfter)}원` : ""}`, at: item.occurredAt, target: c ? ["charge", c.requestId] : undefined };
        }
        case "SELF_BALANCE":
        case "ADMIN_BALANCE": {
            const b = item.balance;
            const isCharge = b?.type === "AUTO_CHARGE" || b?.type === "ADMIN_CHARGE";
            const title = item.activityType === "SELF_BALANCE" ? (isCharge ? "셀프 충전" : "셀프 차감") : (isCharge ? "관리자 지급" : "관리자 차감");
            return { key: `a${item.id}`, category, tone: isCharge ? "green" : "red", title, detail: `${item.userName} · ${number(b?.amount ?? 0)}원 · 잔액 ${number(b?.balanceAfter ?? 0)}원${b?.processedByLoginId ? ` · 처리 ${b.processedByLoginId}` : ""}`, at: item.occurredAt, target };
        }
        case "INQUIRY": {
            const q = item.inquiry;
            return { key: `a${item.id}`, category, tone: q?.answer ? "green" : "amber", title: q?.answer ? "문의 답변 완료" : "문의 등록", detail: `${item.userName} · ${q?.title ?? ""}${q?.answer ? ` · 답변: ${q.answer}` : q?.answeredByName ? ` · 답변자 ${q.answeredByName}` : ""}`, at: item.occurredAt, target: q ? ["inquiry", q.inquiryId] : target };
        }
    }
}

export default function AdminActivity({ open }: { open: (kind: Target, id: number) => void }) {
    const [category, setCategory] = useState<Category | "all">("all");
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [field, setField] = useState("ALL");
    const [matchType, setMatchType] = useState<"CONTAINS" | "EXACT">("CONTAINS");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [result, setResult] = useState<{ items: Activity[]; totalPages: number; totalElements: number } | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        async function load() {
            setLoading(true); setError("");
            try {
                const params = new URLSearchParams({ category: category.toUpperCase(), page: String(page), size: String(PER_PAGE) });
                if (search) { params.set("query", search); params.set("field", field); params.set("matchType", matchType); }
                if (from) params.set("from", from);
                if (to) params.set("to", to);
                const response = await apiRequest<ActivityPage<AdminActivityItem>>(`/api/admin/activities?${params}`, { signal: controller.signal });
                if (controller.signal.aborted) return;
                setResult({ items: response.content.map(toActivity), totalPages: response.totalPages, totalElements: response.totalElements });
            } catch (err) {
                if (!controller.signal.aborted) setError(getApiErrorMessage(err, "활동 기록을 불러오지 못했습니다."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [category, page, search, field, matchType, from, to, revision]);
    const changeCategory = (next: Category | "all") => { setCategory(next); setPage(0); };
    const clearFilters = () => { setQuery(""); setSearch(""); setField("ALL"); setMatchType("CONTAINS"); setFrom(""); setTo(""); setPage(0); };
    return <section className="ao-card ao-activity-page">
        <div className="ao-card-heading"><div><h3>전체 활동 기록</h3><p>회원·거래·충전·문의 이력을 최신순으로 보여줍니다.</p></div><button className="ao-link" disabled={loading} onClick={() => setRevision(value => value + 1)}>↻ 새로고침</button></div>
        <div className="ao-activity-tools"><div className="ao-tabs" role="group" aria-label="활동 종류">{filters.map(([key, label]) => <button key={key} aria-pressed={category === key} onClick={() => changeCategory(key)}>{label}</button>)}</div><span>{result?.totalElements ?? 0}건</span></div>
        <form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(0); }} className="flex flex-wrap items-center gap-2 px-5 pb-4">
            <select aria-label="검색 항목" value={field} onChange={event => { setField(event.target.value); setPage(0); }} className="rounded border border-hairline p-2 text-sm">{searchFields.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select aria-label="일치 방식" value={matchType} onChange={event => { setMatchType(event.target.value as "CONTAINS" | "EXACT"); setPage(0); }} className="rounded border border-hairline p-2 text-sm"><option value="CONTAINS">포함</option><option value="EXACT">일치</option></select>
            <input aria-label="회원 검색" placeholder="회원번호·아이디·이름·이메일 검색" value={query} onChange={event => setQuery(event.target.value)} className="rounded border border-hairline p-2 text-sm" />
            <input aria-label="시작일" type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(0); }} className="rounded border border-hairline p-2 text-sm" />
            <span className="text-sm text-muted">~</span>
            <input aria-label="종료일" type="date" value={to} onChange={event => { setTo(event.target.value); setPage(0); }} className="rounded border border-hairline p-2 text-sm" />
            <button className="admin-button-primary rounded px-3 py-2 text-sm">검색</button>
            {(query || search || from || to) && <button type="button" onClick={clearFilters} className="rounded border border-hairline px-3 py-2 text-sm">초기화</button>}
        </form>
        {error && <div className="ao-error ao-activity-error" role="alert">{error} <button onClick={() => setRevision(value => value + 1)}>다시 시도</button></div>}
        {result && <ActivityList items={result.items} open={open} full />}
        {!loading && !result?.items.length && <div className="ao-empty">{loading ? "활동 기록을 불러오고 있습니다…" : "표시할 활동이 없습니다."}</div>}
        {!!result?.items.length && <AdminPager className="ao-activity-pager" page={page} totalPages={result.totalPages} onChange={setPage} />}
    </section>;
}
