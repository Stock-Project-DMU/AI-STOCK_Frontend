"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import AdminOverview from "./AdminOverview";
import UserStatusAction from "./UserStatusAction";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DashboardIcon, SwapIcon, WalletIcon, UsersGroupIcon } from "@/components/icons/Icon";
import { apiRequest, getApiErrorMessage, isAuthenticated, clearAuthTokens } from "@/lib/api/client";
import { logout } from "@/lib/api/auth";
import { getMyInfo } from "@/lib/api/user";
import type { AccountInfoResponse, HoldingResponse, OrderHistoryResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";
type Section = "dashboard" | "transactions" | "accounts" | "users";
type Detail = { kind: "transaction" | "account" | "user"; id: number } | null;
const sectionMeta: Record<Section, [string, string]> = { dashboard: ["메인 대시보드", "Dashboard"], transactions: ["거래 관리", "Transactions"], accounts: ["가상계좌 관리", "Virtual Account"], users: ["회원 관리", "Users"] };
type Page<T> = { content: T[]; totalPages: number; totalElements: number };
type AdminUser = { userId: number; loginId: string; name: string; email: string | null; status: "ACTIVE" | "SUSPENDED"; createdAt: string };
type AdminTrade = { userName: string; loginId: string; order: OrderHistoryResponse };
type Charge = { requestId: number; accountId: number; accountNumber: string; userName: string; amount: number; reason: string; status: "PENDING" | "APPROVED" | "REJECTED"; requestedAt: string; decisionReason: string | null };
type UserDetail = AdminUser & { suspensionReason?: string | null; suspendedUntil?: string | null; accounts: AccountInfoResponse[]; holdings: HoldingResponse[]; orders: OrderHistoryResponse[] };

const statusText: Record<string, string> = { ACTIVE: "활성", SUSPENDED: "정지", PENDING: "대기", APPROVED: "승인", REJECTED: "거절", EXECUTED: "체결 완료", CANCELLED: "취소", BUY: "매수", SELL: "매도" };
const won = (amount: number) => amount.toLocaleString("ko-KR") + "원";

function StatusBadge({ value }: { value: string }) {
    const tone = ["ACTIVE", "APPROVED", "EXECUTED"].includes(value) ? "green"
        : value === "PENDING" ? "amber" : ["SUSPENDED", "REJECTED", "BUY"].includes(value) ? "red"
        : value === "SELL" ? "blue" : "gray";
    return <span className={`ao-badge ${tone}`}>{statusText[value] ?? value}</span>;
}
function Shell({ section, setSection, logout, children }: { section: Section; setSection: (v: Section) => void; logout: () => void; children: ReactNode }) {
  const [title, subtitle] = sectionMeta[section];
  const nav: [Section, ReactElement, string][] = [["dashboard", <DashboardIcon key="d" className="h-4 w-4" />, "대시보드"], ["transactions", <SwapIcon key="t" className="h-4 w-4" />, "거래 내역"], ["accounts", <WalletIcon key="a" className="h-4 w-4" />, "가상계좌 관리"], ["users", <UsersGroupIcon key="u" className="h-4 w-4" />, "회원 관리"]];
  return <div className="market-theme admin-workspace">
    <aside className="ao-sidebar">
      <Link href="/home" className="ao-brand"><span className="ao-brand-mark">A<span>↗</span></span><span>AI STOCK<small>ADMIN WORKSPACE</small></span></Link>
      <p className="ao-nav-label">WORKSPACE</p>
      <nav aria-label="관리자 메뉴">{nav.map(([key, icon, label]) => <button key={key} onClick={() => setSection(key)} aria-current={section === key ? "page" : undefined}><span>{icon}</span>{label}{section === key && <i />}</button>)}</nav>
      <div className="ao-sidebar-footer"><div className="ao-admin-identity"><span className="ao-avatar">A</span><span><b>관리자 계정</b><small>Administrator</small></span></div><Link href="/home">사용자 서비스로 이동 ↗</Link></div>
    </aside>
    <div className="ao-workspace-main"><header className="ao-topbar"><div><span>워크스페이스</span><span>/</span><strong>{title}</strong></div><div><span className="ao-access"><i />관리자 권한</span><button onClick={logout}>로그아웃 ↗</button></div></header>
      <main className="ao-main">{section !== "dashboard" && <div className="ao-heading"><div><span className="ao-eyebrow">{subtitle.toUpperCase()}</span><h2>{title}</h2><p>사용자 요청과 운영 내역을 확인하고 관리하세요.</p></div></div>}{children}</main>
      <footer className="ao-footer">AI STOCK <span>모의투자 서비스 · 관리자 워크스페이스</span></footer>
    </div>
  </div>;
}
function DataTable({ headings, children }: { headings: string[]; children: ReactNode }) {
    return <div className="overflow-auto rounded-lg border border-hairline bg-white"><table className="w-full text-left text-sm"><thead className="bg-surface-soft"><tr>{headings.map(heading => <th key={heading} className="whitespace-nowrap p-3">{heading}</th>)}</tr></thead><tbody className="[&_td]:whitespace-nowrap [&_td]:p-3 [&_tr]:border-b [&_tr]:border-hairline">{children}</tbody></table></div>;
}
function DetailPanel({ detail, back }: { detail: NonNullable<Detail>; back: () => void }) {
    const [item, setItem] = useState<AdminTrade | Charge | UserDetail | null>(null);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const path = detail.kind === "transaction" ? "trades" : detail.kind === "account" ? "charge-requests" : "users";
    useEffect(() => {
        let active = true;
        apiRequest<AdminTrade | Charge | UserDetail>(`/api/admin/${path}/${detail.id}`).then(item => { if (active) setItem(item); }).catch(error => { if (active) setError(getApiErrorMessage(error, "상세 조회에 실패했습니다.")); });
        return () => { active = false; };
    }, [detail.id, path]);
    async function mutate(action: string, body: object) {
        if (busy) return; setBusy(true); setError("");
        try { await apiRequest(`/api/admin/${path}/${detail.id}/${action}`, { method: "PATCH", body: JSON.stringify(body) }); back(); }
        catch (error) { setError(getApiErrorMessage(error, "처리에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    const charge = detail.kind === "account" ? item as Charge | null : null;
    const trade = detail.kind === "transaction" ? item as AdminTrade | null : null;
    const user = detail.kind === "user" ? item as UserDetail | null : null;
    return <section className="rounded-lg border border-hairline bg-white p-5">
        <button onClick={back} className="mb-5 text-primary">← 목록으로</button>
        {error && <p role="alert" className="my-3 text-red-500">{error}</p>}
        {!item && !error && <p>불러오는 중...</p>}
        {charge && <><h2 className="text-lg font-bold">충전 요청 #{charge.requestId}</h2><p className="mt-3">{charge.userName} · {charge.accountNumber}</p><p className="mt-2">{won(charge.amount)} · <StatusBadge value={charge.status} /></p><p className="mt-3">요청 사유: {charge.reason}</p>{charge.decisionReason && <p className="mt-3">처리 사유: {charge.decisionReason}</p>}
            {charge.status === "PENDING" && <><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} placeholder="처리 사유" className="mt-4 w-full rounded border p-3" /><div className="mt-3 flex gap-3"><button disabled={busy || !reason.trim()} onClick={() => void mutate("decision", { decision: "APPROVED", reason })} className="admin-button-primary rounded px-4 py-2 disabled:opacity-50">충전 승인</button><button disabled={busy || !reason.trim()} onClick={() => void mutate("decision", { decision: "REJECTED", reason })} className="rounded border border-red-500 px-4 py-2 text-red-500 disabled:opacity-50">충전 거절</button></div></>}
        </>}
        {trade && <><h2 className="text-lg font-bold">주문 #{trade.order.orderId}</h2><p className="mt-3">{trade.userName} · {trade.order.stockName} ({trade.order.stockCode})</p><p className="mt-3"><StatusBadge value={trade.order.orderType} /> {trade.order.quantity}주 · {won(trade.order.execPrice ?? trade.order.orderPrice)} · <StatusBadge value={trade.order.status} /></p><p className="mt-3">{formatDateTime(trade.order.orderedAt)}</p>{trade.order.status === "PENDING" && <><textarea value={reason} onChange={event => setReason(event.target.value)} placeholder="취소 사유" className="mt-4 w-full rounded border p-3" /><button disabled={busy || !reason.trim()} onClick={() => void mutate("cancel", { reason })} className="mt-3 rounded border border-red-500 px-4 py-2 text-red-500 disabled:opacity-50">미체결 주문 취소</button></>}</>}
        {user && <><h2 className="text-lg font-bold">{user.name} ({user.loginId})</h2><p className="mt-3">{user.email} · <StatusBadge value={user.status} /></p><p className="mt-3">가입일 {formatDateTime(user.createdAt)}</p><h3 className="mt-5 font-bold">보유 계좌</h3>{user.accounts.map(account => <p className="mt-2" key={account.accountId}>{account.accountName} · {account.accountNumber} · {won(account.balance)}</p>)}<p className="mt-3">보유 종목 {user.holdings.length}개 · 주문 {user.orders.length}건</p><UserStatusAction user={user} onChanged={back} /></>}
    </section>;
}
export default function AdminApp() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [section, setSection] = useState<Section>("dashboard");
    const [detail, setDetail] = useState<Detail>(null);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [trades, setTrades] = useState<AdminTrade[]>([]);
    const [charges, setCharges] = useState<Charge[]>([]);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        if (!isAuthenticated()) { router.replace("/login"); return; }
        getMyInfo().then(user => {
            if (!active) return;
            if (user.role === "ADMIN") setAuthenticated(true);
            else router.replace("/home");
        }).catch(() => {
            if (!active) return;
            clearAuthTokens();
            router.replace("/login");
        });
        return () => { active = false; };
    }, [router]);
    useEffect(() => {
        if (!authenticated || detail || section === "dashboard") return;
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try {
                const params = new URLSearchParams({ page: String(page), size: "20" });
                if (search) params.set("query", search);
                if (status) params.set("status", status);
                if (section === "users") {
                    const result = await apiRequest<Page<AdminUser>>(`/api/admin/users?${params}`);
                    if (active) { setUsers(result.content); setTotalPages(result.totalPages); }
                } else if (section === "transactions") {
                    const result = await apiRequest<Page<AdminTrade>>(`/api/admin/trades?${params}`);
                    if (active) { setTrades(result.content); setTotalPages(result.totalPages); }
                } else {
                    const result = await apiRequest<Page<Charge>>(`/api/admin/charge-requests?${params}`);
                    if (active) { setCharges(result.content); setTotalPages(result.totalPages); }
                }
            } catch (error) { if (active) setError(getApiErrorMessage(error, "관리자 정보를 불러오지 못했습니다.")); }
            finally { if (active) setLoading(false); }
        }
        void load(); return () => { active = false; };
    }, [authenticated, section, detail, page, search, status, revision]);
    if (!authenticated) return <main className="market-theme min-h-screen p-8"><p role="status">접근 권한을 확인하고 있습니다...</p></main>;
    const changeSection = (next: Section) => { setSection(next); setDetail(null); setQuery(""); setSearch(""); setStatus(""); setPage(0); };
    const statuses = section === "users" ? ["ACTIVE", "SUSPENDED"] : section === "transactions" ? ["PENDING", "EXECUTED", "CANCELLED"] : ["PENDING", "APPROVED", "REJECTED"];
    return <Shell section={section} setSection={changeSection} logout={() => { void logout().catch(() => {}).finally(() => { setAuthenticated(false); setDetail(null); router.replace("/login"); }); }}>
        {detail ? <DetailPanel key={detail.kind + detail.id} detail={detail} back={() => { setDetail(null); setRevision(value => value + 1); }} /> : section === "dashboard" ? <AdminOverview navigate={(next, filter) => { changeSection(next); setStatus(filter ?? ""); }} open={(kind, id) => setDetail({ kind, id })} /> : <div className="space-y-4">
            <form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(0); }} className="flex flex-wrap gap-2"><input aria-label="검색" placeholder="아이디 또는 이름 검색" value={query} onChange={event => setQuery(event.target.value)} className="rounded border border-hairline p-2" /><select aria-label="상태 필터" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }} className="rounded border border-hairline p-2"><option value="">전체 상태</option>{statuses.map(value => <option key={value} value={value}>{statusText[value]}</option>)}</select><button className="admin-button-primary rounded px-4 py-2">검색</button></form>
            {error && <p role="alert" className="text-red-500">{error}</p>}
            {loading ? <p role="status">불러오는 중...</p> : <>
                {section === "accounts" && <><h2 className="font-bold">캐시 충전 요청</h2><DataTable headings={["요청번호", "사용자", "계좌", "요청 금액", "상태", "관리"]}>{charges.map(item => <tr key={item.requestId}><td>{item.requestId}</td><td>{item.userName}</td><td>{item.accountNumber}</td><td>{won(item.amount)}</td><td><StatusBadge value={item.status} /></td><td><button onClick={() => setDetail({ kind: "account", id: item.requestId })} className="text-primary">상세 / 심사</button></td></tr>)}</DataTable>{!charges.length && <p className="text-sm text-muted">충전 요청이 없습니다.</p>}</>}
                {section === "transactions" && <><h2 className="font-bold">거래 내역</h2><DataTable headings={["주문번호", "사용자", "종목", "구분", "수량", "금액", "상태", "관리"]}>{trades.map(item => <tr key={item.order.orderId}><td>{item.order.orderId}</td><td>{item.userName}</td><td>{item.order.stockName}</td><td><StatusBadge value={item.order.orderType} /></td><td>{item.order.quantity}</td><td>{won((item.order.execPrice ?? item.order.orderPrice) * item.order.quantity)}</td><td><StatusBadge value={item.order.status} /></td><td><button onClick={() => setDetail({ kind: "transaction", id: item.order.orderId })} className="text-primary">상세</button></td></tr>)}</DataTable>{!trades.length && <p className="text-sm text-muted">거래 내역이 없습니다.</p>}</>}
                {section === "users" && <><DataTable headings={["회원번호", "아이디", "이름", "이메일", "가입일", "상태", "관리"]}>{users.map(user => <tr key={user.userId}><td>{user.userId}</td><td>{user.loginId}</td><td>{user.name}</td><td>{user.email ?? "—"}</td><td>{user.createdAt?.slice(0, 10)}</td><td><StatusBadge value={user.status} /></td><td><button onClick={() => setDetail({ kind: "user", id: user.userId })} className="text-primary">상세</button></td></tr>)}</DataTable>{!users.length && <p>검색 결과가 없습니다.</p>}</>}
                <div className="flex justify-center gap-4"><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>이전</button><span>{page + 1} / {Math.max(1, totalPages)}</span><button disabled={page + 1 >= totalPages} onClick={() => setPage(value => value + 1)}>다음</button></div>
            </>}
        </div>}
    </Shell>;
}
