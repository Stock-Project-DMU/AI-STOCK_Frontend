"use client";

import { useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import AdminPager from "./AdminPager";

type Page<T> = { content: T[]; totalElements: number };
type Target = "account" | "transaction" | "user";
export type ActivityUser = { userId: number; name: string; loginId: string; createdAt: string };
export type ActivityTrade = { userName: string; order: { orderId: number; stockName: string; orderType: string; status: string; quantity: number; orderedAt: string } };
export type ActivityCharge = { requestId: number; userName: string; amount: number; requestedAt: string; status?: string };
export type AuditLog = { auditLogId: number; adminLoginId: string | null; action: string; targetType: string; targetId: number | null; afterValue: string | null; createdAt: string };
type Category = "signup" | "trade" | "charge" | "admin";
type Activity = { key: string; category: Category; tone: "blue" | "green" | "amber" | "red" | "violet" | "gray"; title: string; detail: string; at: string; target?: [Target, number] };
type Sources = { users?: Page<ActivityUser>; trades?: Page<ActivityTrade>; charges?: Page<ActivityCharge>; logs?: Page<AuditLog> };

const number = (value: number) => value.toLocaleString("ko-KR");
const date = (value: string) => value.replace("T", " ").slice(5, 16);
const auditLabels: Record<string, string> = { USER_STATUS_CHANGE: "계정 상태 변경", ACCOUNT_STATUS_CHANGE: "계좌 상태 변경", ACCOUNT_ADJUSTMENT: "계좌 잔고 조정", ORDER_CANCEL: "주문 취소 처리", CHARGE_REQUEST_DECISION: "충전 요청 처리", ADMIN_CREATE: "관리자 계정 생성" };
const auditTargets: Record<string, Target> = { USER: "user", ORDER: "transaction", CHARGE_REQUEST: "account" };
const chargeStatus: Record<string, string> = { APPROVED: " (승인됨)", REJECTED: " (거절됨)" };
const PAGE_SIZE = 30;
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

// 가입·거래·충전 요청·관리자 처리 기록을 하나의 최신순 활동 목록으로 합친다.
export function buildActivities({ users, trades, charges, logs }: Sources) {
    return [
        ...(users?.content ?? []).map((user): Activity => ({ key: `u${user.userId}`, category: "signup", tone: "blue", title: "신규 회원 가입", detail: `${user.name} · ${user.loginId}`, at: user.createdAt, target: ["user", user.userId] })),
        ...(trades?.content ?? []).map(({ order, userName }): Activity => ({ key: `t${order.orderId}`, category: "trade", tone: order.status === "EXECUTED" ? "green" : order.status === "PENDING" ? "amber" : "gray", title: `${order.status === "EXECUTED" ? "거래 체결" : order.status === "PENDING" ? "주문 접수" : "주문 취소"}: ${order.stockName}`, detail: `${userName} · ${order.orderType === "BUY" ? "매수" : "매도"} ${number(order.quantity)}주`, at: order.orderedAt, target: ["transaction", order.orderId] })),
        ...(charges?.content ?? []).map((item): Activity => ({ key: `c${item.requestId}`, category: "charge", tone: item.status === "APPROVED" ? "green" : item.status === "REJECTED" ? "gray" : "amber", title: `캐시 충전 요청${chargeStatus[item.status ?? ""] ?? ""}`, detail: `${item.userName} · ${number(item.amount)}원 요청`, at: item.requestedAt, target: ["account", item.requestId] })),
        ...(logs?.content ?? []).map((log): Activity => ({ key: `a${log.auditLogId}`, category: "admin", tone: log.action === "USER_STATUS_CHANGE" && log.afterValue?.startsWith("SUSPENDED") ? "red" : "violet", title: auditLabels[log.action] ?? log.action, detail: `관리자 ${log.adminLoginId ?? "—"}${log.targetId == null ? "" : ` · 대상 #${log.targetId}`}`, at: log.createdAt, target: auditTargets[log.targetType] && log.targetId != null ? [auditTargets[log.targetType], log.targetId] : undefined })),
    ].sort((a, b) => b.at.localeCompare(a.at));
}

export function ActivityList({ items, open, full }: { items: Activity[]; open: (kind: Target, id: number) => void; full?: boolean }) {
    return <ol className={`ao-activity${full ? " full" : ""}`}>{items.map(item => {
        const body = <><i className={`dot-${item.tone}`} /><span><b>{item.title}</b><small title={item.at.replace("T", " ").slice(0, 16)}>{item.detail} · {ago(item.at)}</small></span></>;
        const target = item.target;
        return <li key={item.key}>{target ? <button onClick={() => open(target[0], target[1])}>{body}</button> : <div>{body}</div>}</li>;
    })}</ol>;
}

const filters: [Category | "all", string][] = [["all", "전체"], ["signup", "회원 가입"], ["trade", "거래"], ["charge", "충전 요청"], ["admin", "관리자 처리"]];

export default function AdminActivity({ open }: { open: (kind: Target, id: number) => void }) {
    const [size, setSize] = useState(PAGE_SIZE);
    const [category, setCategory] = useState<Category | "all">("all");
    const [page, setPage] = useState(0);
    const [revision, setRevision] = useState(0);
    const [sources, setSources] = useState<Sources>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        const endpoints = {
            users: `/api/admin/users?size=${size}&sort=createdAt,desc`,
            trades: `/api/admin/trades?size=${size}&sort=orderedAt,desc`,
            charges: `/api/admin/charge-requests?size=${size}&sort=requestedAt,desc`,
            logs: `/api/admin/audit-logs?size=${size}`,
        };
        async function load() {
            setLoading(true); setErrors([]);
            const entries = Object.entries(endpoints);
            const responses = await Promise.allSettled(entries.map(([, url]) => apiRequest(url, { signal: controller.signal })));
            if (controller.signal.aborted) return;
            const next: Record<string, unknown> = {};
            const failures: string[] = [];
            responses.forEach((result, index) => {
                if (result.status === "fulfilled") next[entries[index][0]] = result.value;
                else failures.push(getApiErrorMessage(result.reason, "일부 활동 기록을 불러오지 못했습니다."));
            });
            setSources(next as Sources); setErrors([...new Set(failures)]); setLoading(false);
        }
        void load();
        return () => controller.abort();
    }, [size, revision]);
    const all = buildActivities(sources);
    // 끝까지 불러오지 못한 출처가 있으면, 그 출처에서 받은 가장 오래된 기록보다 오래된 활동은 중간이 빠졌을 수 있어 숨긴다.
    const limits = [
        oldestIfTruncated(sources.users, user => user.createdAt),
        oldestIfTruncated(sources.trades, trade => trade.order.orderedAt),
        oldestIfTruncated(sources.charges, charge => charge.requestedAt),
        oldestIfTruncated(sources.logs, log => log.createdAt),
    ];
    const limit = limits.reduce((max, value) => value > max ? value : max, "");
    const visible = all.filter(item => item.at >= limit && (category === "all" || item.category === category));
    const more = limits.some(Boolean);
    const loadedPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
    // 불러온 범위 뒤 페이지로 넘어가면 기록을 더 받아온다. 받는 동안에는 마지막으로 불러온 페이지를 보여준다.
    const current = Math.min(page, loadedPages - 1);
    const changePage = (next: number) => { setPage(next); if (next >= loadedPages && more) setSize(value => value + PAGE_SIZE); };
    return <section className="ao-card ao-activity-page">
        <div className="ao-card-heading"><div><h3>전체 활동 기록</h3><p>가입·거래·충전 요청과 관리자 처리 기록을 최신순으로 보여줍니다.</p></div><button className="ao-link" disabled={loading} onClick={() => setRevision(value => value + 1)}>↻ 새로고침</button></div>
        <div className="ao-activity-tools"><div className="ao-tabs" role="group" aria-label="활동 종류">{filters.map(([key, label]) => <button key={key} aria-pressed={category === key} onClick={() => { setCategory(key); setPage(0); }}>{label}</button>)}</div><span>{visible.length}건</span></div>
        {!!errors.length && <div className="ao-error ao-activity-error" role="alert">{errors.join(" ")} <button onClick={() => setRevision(value => value + 1)}>다시 시도</button></div>}
        <ActivityList items={visible.slice(current * PER_PAGE, (current + 1) * PER_PAGE)} open={open} full />
        {!visible.length && <div className="ao-empty">{loading ? "활동 기록을 불러오고 있습니다…" : "표시할 활동이 없습니다."}</div>}
        {!!visible.length && <AdminPager className="ao-activity-pager" page={current} totalPages={loadedPages} onChange={changePage} more={more && !loading} />}
    </section>;
}

function oldestIfTruncated<T>(page: Page<T> | undefined, at: (item: T) => string) {
    const last = page?.content.at(-1);
    return page && last && page.totalElements > page.content.length ? at(last) : "";
}
