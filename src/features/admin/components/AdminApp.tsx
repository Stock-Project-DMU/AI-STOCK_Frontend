"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import AdminOverview from "./AdminOverview";
import AdminActivity from "./AdminActivity";
import AdminTools from "./AdminTools";
import AdminPager from "./AdminPager";
import UserStatusAction from "./UserStatusAction";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { DashboardIcon, NewsIcon, SwapIcon, WalletIcon, UsersGroupIcon, GearIcon, SendIcon } from "@/components/icons/Icon";
import { NotificationPopups } from "@/components/layout/NotificationCenter";
import { apiRequest, getApiErrorMessage, isAuthenticated, clearAuthTokens } from "@/lib/api/client";
import { logout } from "@/lib/api/auth";
import { getMyInfo } from "@/lib/api/user";
import type { AccountInfoResponse, HoldingResponse, OrderHistoryResponse, WatchlistResponse, RecentViewedResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";
type Section = "dashboard" | "transactions" | "accounts" | "users" | "inquiries" | "activity" | "admin-tools";
type Detail = { kind: "transaction" | "account" | "charge" | "user" | "inquiry"; id: number } | null;
const sectionMeta: Record<Section, [string, string]> = { dashboard: ["메인 대시보드", "Dashboard"], transactions: ["거래 관리", "Transactions"], accounts: ["가상계좌 관리", "Virtual Account"], users: ["회원 관리", "Users"], inquiries: ["문의 관리", "Inquiries"], activity: ["최근 활동", "Activity"], "admin-tools": ["관리자 기능", "Admin Tools"] };
type Page<T> = { content: T[]; totalPages: number; totalElements: number };
type AdminUser = { userId: number; loginId: string; name: string; email: string | null; status: "ACTIVE" | "SUSPENDED"; createdAt: string };
type RealizedProfit = { averageCost: number; sellPrice: number; profitAmount: number; profitRate: number };
type BalanceChange = { type: string; amount: number; balanceBefore: number; balanceAfter: number; createdAt: string };
type AdminTrade = { userId: number; userName: string; loginId: string; accountNumber: string; executedAmount: number | null; cancelReason: string | null; cancelledByLoginId: string | null; cancelledAt: string | null; order: OrderHistoryResponse; realizedProfit: RealizedProfit | null; balanceChanges: BalanceChange[] };
type RecentChargeRequest = { requestId: number; amount: number; status: "PENDING" | "APPROVED" | "REJECTED"; requestedAt: string };
type Charge = { requestId: number; accountId: number; userId: number; accountNumber: string; userName: string; amount: number; reason: string; status: "PENDING" | "APPROVED" | "REJECTED"; requestedAt: string; decisionReason: string | null; decidedByName: string | null; decidedAt: string | null; accountBalance: number; depositRemaining: number; chargeCount: number; recentRequests: RecentChargeRequest[] };
type SocialAccount = { provider: "KAKAO" | "NAVER" | "GOOGLE"; linkedAt: string };
type UserInquiry = { inquiryId: number; title: string; content: string; status: string; answer: string | null; answeredAt: string | null; createdAt: string };
type AdminInquiry = { inquiryId: number; userId: number; userName: string; loginId: string; title: string; status: "PENDING" | "ANSWERED"; createdAt: string; answeredAt: string | null };
type AdminInquiryDetail = AdminInquiry & { content: string; answer: string | null; answeredByName: string | null };
type InvestmentProfile = { investmentTendency: number; fundTendency: number; investmentLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT"; updatedAt: string };
type NewsBriefingSetting = { outletDomain: string; briefingTime: string; lastAttemptAt: string | null };
// action: USER_STATUS_CHANGE(회원 정지/해제) | ACCOUNT_STATUS_CHANGE(계좌 정지/해제, accountNumber 포함).
type UserSuspensionHistoryEntry = { action: "USER_STATUS_CHANGE" | "ACCOUNT_STATUS_CHANGE"; beforeValue: string; afterValue: string; reason: string; adminLoginId: string; accountNumber: string | null; createdAt: string };
// 이 회원에게 관리자가 처리한 모든 내역 — 정확한 필드명은 백엔드 확인 필요(추정).
type AdminActionEntry = { action: string; reason: string | null; beforeValue: string | null; afterValue: string | null; adminLoginId: string; createdAt: string };
type UserDetail = AdminUser & {
    role: "USER" | "ADMIN";
    birthdate: string | null;
    suspensionReason?: string | null;
    suspendedUntil?: string | null;
    lastLoginAt: string | null;
    socialAccounts: SocialAccount[];
    investmentProfile: InvestmentProfile | null;
    totalAsset: number;
    profitAmount: number;
    profitRate: number;
    realizedProfit: number | null;
    accounts: AccountInfoResponse[];
    holdings: HoldingResponse[];
    orders: OrderHistoryResponse[];
    orderCount: number;
    recentChargeRequests: RecentChargeRequest[];
    inquiryCount: number;
    recentInquiries: UserInquiry[];
    watchlist: WatchlistResponse[];
    recentViewed: RecentViewedResponse[];
    newsBriefingSetting: NewsBriefingSetting | null;
    suspensionHistory: UserSuspensionHistoryEntry[];
    adminActionCount: number;
    recentAdminActions: AdminActionEntry[];
};
type AdminAccount = { accountId: number; accountName: string; accountNumber: string; userId: number; userName: string; loginId: string; balance: number; frozenBalance: number; baseBalance: number; chargeCount: number; maxChargeCount: number; interestRate: number; totalInterest: number; unlimitedCharge: boolean; status: "ACTIVE" | "SUSPENDED"; openedAt?: string };
type LedgerType = "AUTO_CHARGE" | "ADMIN_CHARGE" | "ADMIN_DEDUCTION" | "AUTO_DEDUCTION";
// relatedChargeRequest — 요청에서 시작된 승인입금/거절 건에 같이 붙어오는 원래 요청 정보.
type RelatedChargeRequest = { requestId: number; amount: number; reason: string; requestedAt: string; decidedByName: string | null; decisionReason: string | null };
// entryType: TRANSACTION(실제 잔고 변동) | REJECTED_REQUEST(거절, 잔고 변동 없음 — type/amount/balanceBefore/balanceAfter는 null, reason은 거절 사유).
type AccountTransaction = { transactionId: number | null; entryType: "TRANSACTION" | "REJECTED_REQUEST"; accountNumber: string; userId: number; loginId: string; userName: string; type: LedgerType | null; amount: number | null; balanceBefore: number | null; balanceAfter: number | null; processedByLoginId: string | null; reason: string | null; occurredAt: string; chargeRequest: RelatedChargeRequest | null };
type AccountLedgerEntry = { transactionId: number; type: LedgerType; amount: number; balanceBefore: number; balanceAfter: number; relatedChargeRequestId: number | null; processedByLoginId: string | null; reason: string | null; createdAt: string };
type SuspensionHistoryEntry = { beforeValue: string; afterValue: string; reason: string; adminLoginId: string; createdAt: string };
type AccountStats = { totalCharged: number; totalDeducted: number; totalFee: number; realizedProfit: number | null };
type AdminAccountDetail = AdminAccount & { holdings: HoldingResponse[]; totalAsset: number; profitAmount: number; profitRate: number; openedAt: string; recentOrders: OrderHistoryResponse[]; orderCount: number; recentChargeRequests: RecentChargeRequest[]; suspensionHistory: SuspensionHistoryEntry[]; stats: AccountStats };
// 계좌 상태(정지/해제)·지급/차감 조작 — 계좌 상세 화면과 회원 상세 화면(보유 계좌별)에서 공통으로 사용.
type AccountCardData = { accountId: number; accountName: string; accountNumber: string; balance: number; frozenBalance: number; baseBalance: number; chargeCount: number; maxChargeCount: number; interestRate: number; totalInterest: number; unlimitedCharge: boolean; status: "ACTIVE" | "SUSPENDED" };
const loginProviderLabel: Record<string, string> = { KAKAO: "카카오", NAVER: "네이버", GOOGLE: "구글" };
const roleLabel: Record<string, string> = { USER: "일반 회원", ADMIN: "관리자" };
const investmentLevelLabel: Record<string, string> = { BEGINNER: "입문자", INTERMEDIATE: "일반 투자자", EXPERT: "숙련 투자자" };
const fundTendencyLabel: Record<number, string> = { 1: "수익추구형", 2: "자유소비형", 3: "목표달성형" };
const investmentTendencyLabel: Record<number, string> = { 1: "안정형", 2: "안정추구형", 3: "위험중립형", 4: "적극투자형", 5: "공격투자형" };
const ledgerTypeLabel: Record<LedgerType, string> = { AUTO_CHARGE: "셀프 충전", ADMIN_CHARGE: "관리자 승인/지급", ADMIN_DEDUCTION: "관리자 차감", AUTO_DEDUCTION: "셀프 차감" };
const ledgerTypes: [string, string][] = [["", "전체 유형"], ["AUTO_CHARGE", "셀프 충전"], ["ADMIN_CHARGE", "관리자 승인/지급"], ["ADMIN_DEDUCTION", "관리자 차감"], ["AUTO_DEDUCTION", "셀프 차감"], ["REJECTED", "거절"]];

const statusText: Record<string, string> = { ACTIVE: "활성", SUSPENDED: "정지", PENDING: "대기", APPROVED: "승인", REJECTED: "거절", EXECUTED: "체결 완료", CANCELLED: "취소", BUY: "매수", SELL: "매도", ANSWERED: "답변 완료" };
const won = (amount: number) => amount.toLocaleString("ko-KR") + "원";

// 회원관리/거래내역/가상계좌관리(계좌·충전요청) 검색 항목 — 백엔드 field 파라미터값과 1:1.
const searchFields: Record<string, [string, string][]> = {
    users: [["ALL", "전체"], ["USER_ID", "회원번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["EMAIL", "이메일"]],
    transactions: [["ALL", "전체"], ["ORDER_ID", "주문번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["ACCOUNT_NUMBER", "계좌번호"], ["STOCK_CODE", "종목코드"], ["STOCK_NAME", "종목명"]],
    list: [["ALL", "전체"], ["ACCOUNT_ID", "계좌번호ID"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["ACCOUNT_NUMBER", "계좌번호"]],
    charges: [["ALL", "전체"], ["REQUEST_ID", "요청번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["ACCOUNT_NUMBER", "계좌번호"]],
    ledger: [["ALL", "전체"], ["TRANSACTION_ID", "거래ID"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["ACCOUNT_NUMBER", "계좌번호"]],
    inquiries: [["ALL", "전체"], ["INQUIRY_ID", "문의번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["TITLE", "제목"]],
};
const searchPlaceholders: Record<string, string> = {
    users: "회원번호·아이디·이름·이메일 검색",
    transactions: "주문번호·아이디·이름·계좌번호·종목코드·종목명 검색",
    list: "계좌ID·아이디·이름·계좌번호 검색",
    charges: "요청번호·아이디·이름·계좌번호 검색",
    ledger: "거래ID·아이디·이름·계좌번호 검색",
    inquiries: "문의번호·아이디·이름·제목 검색",
};
// 목록 정렬 — sortBy 파라미터값은 백엔드가 준 그대로. 화면별로 선택 가능한 옵션이 다르다.
const sortOptions: Record<string, [string, string][]> = {
    users: [["LATEST", "최신 가입순"], ["OLDEST", "오래된 가입순"], ["NAME", "이름순"]],
    transactions: [["LATEST", "최신순"], ["OLDEST", "오래된순"], ["AMOUNT_DESC", "금액 큰순"], ["AMOUNT_ASC", "금액 작은순"]],
    list: [["LATEST", "최신 개설순"], ["BALANCE_DESC", "잔고 많은순"], ["BALANCE_ASC", "잔고 적은순"]],
    charges: [["LATEST", "최신순"], ["OLDEST", "오래된순"], ["AMOUNT_DESC", "금액 큰순"], ["AMOUNT_ASC", "금액 작은순"]],
    ledger: [["LATEST", "최신순"], ["OLDEST", "오래된순"], ["AMOUNT_DESC", "금액 큰순"], ["AMOUNT_ASC", "금액 작은순"]],
    inquiries: [["PENDING_FIRST", "대기 먼저"], ["LATEST", "최신순"], ["OLDEST", "오래된순"]],
};

export function StatusBadge({ value }: { value: string }) {
    const tone = ["ACTIVE", "APPROVED", "EXECUTED", "ANSWERED"].includes(value) ? "green"
        : value === "PENDING" ? "amber" : ["SUSPENDED", "REJECTED", "BUY"].includes(value) ? "red"
        : value === "SELL" ? "blue" : "gray";
    return <span className={`ao-badge ${tone}`}>{statusText[value] ?? value}</span>;
}
// 문의 상태 전용 라벨 — 마이페이지 문의하기 화면과 문구를 맞춤("대기" 대신 "답변 대기").
const inquiryStatusText: Record<string, string> = { PENDING: "답변 대기", ANSWERED: "답변 완료" };
function InquiryStatusBadge({ value }: { value: string }) {
    return <span className={`ao-badge ${value === "ANSWERED" ? "green" : "amber"}`}>{inquiryStatusText[value] ?? value}</span>;
}
function Shell({ section, setSection, logout, children }: { section: Section; setSection: (v: Section) => void; logout: () => void; children: ReactNode }) {
  const [title, subtitle] = sectionMeta[section];
  const nav: [Section, ReactElement, string][] = [["dashboard", <DashboardIcon key="d" className="h-4 w-4" />, "대시보드"], ["transactions", <SwapIcon key="t" className="h-4 w-4" />, "거래 내역"], ["accounts", <WalletIcon key="a" className="h-4 w-4" />, "가상계좌 관리"], ["users", <UsersGroupIcon key="u" className="h-4 w-4" />, "회원 관리"], ["inquiries", <SendIcon key="q" className="h-4 w-4" />, "문의 관리"], ["activity", <NewsIcon key="l" className="h-4 w-4" />, "최근 활동"], ["admin-tools", <GearIcon key="g" className="h-4 w-4" />, "관리자 기능"]];
  return <div className="market-theme admin-workspace">
    <NotificationPopups />
    <aside className="ao-sidebar">
      <button type="button" onClick={() => setSection("dashboard")} className="ao-brand" aria-label="관리자 대시보드로 이동"><img src="/images/brand/logo-admin.png" alt="AI STOCK" className="ao-brand-logo" /><small>ADMIN WORKSPACE</small></button>
      <p className="ao-nav-label">WORKSPACE</p>
      <nav aria-label="관리자 메뉴">{nav.map(([key, icon, label]) => <button key={key} onClick={() => setSection(key)} aria-current={section === key ? "page" : undefined}><span>{icon}</span>{label}{section === key && <i />}</button>)}</nav>
      <div className="ao-sidebar-footer"><div className="ao-admin-identity"><span className="ao-avatar">A</span><span><b>관리자 계정</b><small>Administrator</small></span></div></div>
    </aside>
    <div className="ao-workspace-main"><header className="ao-topbar"><div><span>워크스페이스</span><span>/</span><strong>{title}</strong></div><div><Link href="/home" className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-hairline px-3 text-[12px] font-semibold text-body hover:bg-surface-soft hover:text-ink">사용자 서비스로 이동 ↗</Link><span className="ao-access"><i />관리자 권한</span><button onClick={logout}>로그아웃 ↗</button></div></header>
      <main className="ao-main">{section !== "dashboard" && <div className="ao-heading"><div><span className="ao-eyebrow">{subtitle.toUpperCase()}</span><h2>{title}</h2><p>사용자 요청과 운영 내역을 확인하고 관리하세요.</p></div></div>}{children}</main>
      <footer className="ao-footer">AI STOCK <span>모의투자 서비스 · 관리자 워크스페이스</span></footer>
    </div>
  </div>;
}
export function CharCount({ value, max }: { value: string; max: number }) {
    return <p className="mt-1 text-right text-xs text-muted">{value.length}/{max}</p>;
}
export function DataTable({ headings, children }: { headings: ReactNode[]; children: ReactNode }) {
    return <div className="overflow-auto rounded-lg border border-hairline bg-white"><table className="w-full text-left text-sm"><thead className="bg-surface-soft"><tr>{headings.map((heading, index) => <th key={index} className="whitespace-nowrap p-3">{heading}</th>)}</tr></thead><tbody className="[&_td]:whitespace-nowrap [&_td]:p-3 [&_tr]:border-b [&_tr]:border-hairline">{children}</tbody></table></div>;
}
// 표 컬럼 클릭 정렬 — ▼(DESC) → ▲(ASC) → 해제, 3단계 순환. sortColumn/direction은 sortBy와 같이 보내되 있으면 sortBy보다 우선 적용됨(백엔드 확인).
export type SortState = { column: string; direction: "ASC" | "DESC" } | null;
export function SortHeader({ label, column, sort, onSort }: { label: string; column: string; sort: SortState; onSort: (column: string) => void }) {
    const active = sort?.column === column;
    return <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 font-semibold hover:text-primary">{label}<span className="text-[10px]">{active ? (sort.direction === "DESC" ? "▼" : "▲") : "⇕"}</span></button>;
}
function AccountLedgerTable({ accountId }: { accountId: number }) {
    const [page, setPage] = useState(0);
    const [result, setResult] = useState<Page<AccountLedgerEntry> | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        async function load() {
            setResult(null); setError("");
            try {
                const result = await apiRequest<Page<AccountLedgerEntry>>(`/api/admin/accounts/${accountId}/transactions?page=${page}&size=10`);
                if (active) setResult(result);
            } catch (error) { if (active) setError(getApiErrorMessage(error, "거래내역을 불러오지 못했습니다.")); }
        }
        void load();
        return () => { active = false; };
    }, [accountId, page]);
    if (error) return <p role="alert" className="mt-2 text-red-500">{error}</p>;
    if (!result) return <p className="mt-2 text-sm text-muted">불러오는 중...</p>;
    return <>
        <DataTable headings={["거래ID", "유형", "금액", "거래전 잔액", "거래후 잔액", "관련 요청", "처리자", "사유", "시각"]}>
            {result.content.map(item => <tr key={item.transactionId}><td>{item.transactionId}</td><td><span className={`ao-badge ${item.type.includes("CHARGE") ? "green" : "red"}`}>{ledgerTypeLabel[item.type]}</span></td><td className={item.amount < 0 ? "text-blue-500" : "text-red-500"}>{item.amount < 0 ? "−" : "+"}{won(Math.abs(item.amount))}</td><td>{won(item.balanceBefore)}</td><td>{won(item.balanceAfter)}</td><td>{item.relatedChargeRequestId != null ? `#${item.relatedChargeRequestId}` : "—"}</td><td>{item.processedByLoginId ?? "—"}</td><td className="max-w-48 break-words">{item.reason ?? "—"}</td><td>{formatDateTime(item.createdAt)}</td></tr>)}
        </DataTable>
        {!result.content.length && <p className="mt-2 text-sm text-muted">거래내역이 없습니다.</p>}
        <AdminPager page={page} totalPages={result.totalPages} onChange={setPage} />
    </>;
}
function AccountCard({ account, onChanged }: { account: AccountCardData; onChanged: () => void }) {
    const [statusReason, setStatusReason] = useState("");
    const [adjustType, setAdjustType] = useState<"ADMIN_CHARGE" | "ADMIN_DEDUCTION">("ADMIN_CHARGE");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustReason, setAdjustReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    async function mutate(action: string, body: object, method: "PATCH" | "POST" = "PATCH") {
        if (busy) return; setBusy(true); setError("");
        try { await apiRequest(`/api/admin/accounts/${account.accountId}/${action}`, { method, body: JSON.stringify(body) }); setStatusReason(""); setAdjustAmount(""); setAdjustReason(""); onChanged(); }
        catch (error) { setError(getApiErrorMessage(error, "처리에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="mt-3 rounded border border-hairline p-4">
        <p className="font-semibold">{account.accountName} · {account.accountNumber} · <StatusBadge value={account.status} /></p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
            <div><dt className="text-muted">현재 잔액</dt><dd>{won(account.balance)}</dd></div>
            <div><dt className="text-muted">주문 동결 금액</dt><dd>{won(account.frozenBalance)}</dd></div>
            <div><dt className="text-muted">기준 자산</dt><dd>{won(account.baseBalance)}</dd></div>
            <div><dt className="text-muted">셀프 충전 횟수</dt><dd>{account.chargeCount}/{account.unlimitedCharge ? "무제한" : account.maxChargeCount}</dd></div>
            <div><dt className="text-muted">예치 이자율</dt><dd>연 {account.interestRate.toFixed(2)}%</dd></div>
            <div><dt className="text-muted">누적 이자</dt><dd>{won(account.totalInterest)}</dd></div>
        </dl>
        {error && <p role="alert" className="mt-2 text-red-500">{error}</p>}
        <textarea value={statusReason} onChange={event => setStatusReason(event.target.value)} maxLength={500} placeholder={account.status === "ACTIVE" ? "정지 사유" : "정지 해제 사유"} className="mt-3 w-full rounded border p-2 text-sm" />
        <CharCount value={statusReason} max={500} />
        <button disabled={busy || !statusReason.trim()} onClick={() => void mutate("status", { status: account.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE", reason: statusReason })} className={`mt-2 rounded border px-3 py-1.5 text-sm disabled:opacity-50 ${account.status === "ACTIVE" ? "border-red-500 text-red-500" : "admin-button-primary border-transparent"}`}>
            {account.status === "ACTIVE" ? "계좌 정지" : "정지 해제"}
        </button>
        <div className="mt-4 flex flex-wrap items-center gap-2">
            <select value={adjustType} onChange={event => setAdjustType(event.target.value as "ADMIN_CHARGE" | "ADMIN_DEDUCTION")} className="rounded border border-hairline p-2 text-sm">
                <option value="ADMIN_CHARGE">지급</option>
                <option value="ADMIN_DEDUCTION">차감</option>
            </select>
            <input value={adjustAmount} onChange={event => setAdjustAmount(event.target.value.replace(/[^0-9]/g, ""))} placeholder="금액" className="w-32 rounded border border-hairline p-2 text-sm" />
            <span className="text-sm">원</span>
        </div>
        <textarea value={adjustReason} onChange={event => setAdjustReason(event.target.value)} maxLength={500} placeholder="사유" className="mt-2 w-full rounded border p-2 text-sm" />
        <CharCount value={adjustReason} max={500} />
        <button disabled={busy || !adjustAmount || !adjustReason.trim()} onClick={() => void mutate("adjustments", { type: adjustType, amount: Number(adjustAmount), reason: adjustReason }, "POST")} className="admin-button-primary mt-2 rounded px-3 py-1.5 text-sm disabled:opacity-50">
            {adjustType === "ADMIN_CHARGE" ? "지급 실행" : "차감 실행"}
        </button>
    </div>;
}
function DetailPanel({ detail, back, open }: { detail: NonNullable<Detail>; back: () => void; open: (kind: "account" | "charge" | "transaction" | "user" | "inquiry", id: number) => void }) {
    const [item, setItem] = useState<AdminTrade | Charge | UserDetail | AdminAccountDetail | AdminInquiryDetail | null>(null);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [itemRevision, setItemRevision] = useState(0);
    const path = detail.kind === "transaction" ? "trades" : detail.kind === "charge" ? "charge-requests" : detail.kind === "account" ? "accounts" : detail.kind === "inquiry" ? "inquiries" : "users";
    const reload = () => setItemRevision(value => value + 1);
    useEffect(() => {
        let active = true;
        apiRequest<AdminTrade | Charge | UserDetail | AdminAccountDetail | AdminInquiryDetail>(`/api/admin/${path}/${detail.id}`).then(item => { if (active) setItem(item); }).catch(error => { if (active) setError(getApiErrorMessage(error, "상세 조회에 실패했습니다.")); });
        return () => { active = false; };
    }, [detail.id, path, itemRevision]);
    async function mutate(action: string, body: object, method: "PATCH" | "POST" = "PATCH") {
        if (busy) return; setBusy(true); setError("");
        try { await apiRequest(`/api/admin/${path}/${detail.id}/${action}`, { method, body: JSON.stringify(body) }); back(); }
        catch (error) { setError(getApiErrorMessage(error, "처리에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    const charge = detail.kind === "charge" ? item as Charge | null : null;
    const trade = detail.kind === "transaction" ? item as AdminTrade | null : null;
    const user = detail.kind === "user" ? item as UserDetail | null : null;
    const account = detail.kind === "account" ? item as AdminAccountDetail | null : null;
    const inquiry = detail.kind === "inquiry" ? item as AdminInquiryDetail | null : null;
    return <section className="rounded-lg border border-hairline bg-white p-5">
        <button onClick={back} className="mb-5 text-primary">← 목록으로</button>
        {error && <p role="alert" className="my-3 text-red-500">{error}</p>}
        {!item && !error && <p>불러오는 중...</p>}
        {charge && <>
            <h2 className="text-lg font-bold">충전 요청 #{charge.requestId}</h2>
            <p className="mt-3"><button onClick={() => open("user", charge.userId)} className="text-primary">{charge.userName}</button> · {charge.accountNumber}</p>
            <p className="mt-2">{won(charge.amount)} · <StatusBadge value={charge.status} /></p>
            <p className="mt-3">요청 사유: {charge.reason}</p>
            <p className="mt-1">요청 시각: {formatDateTime(charge.requestedAt)}</p>
            {charge.decisionReason && <p className="mt-3">처리 사유: {charge.decisionReason}</p>}
            {charge.status !== "PENDING" && <p className="mt-1">처리자: {charge.decidedByName ?? "—"} · 처리 시각: {charge.decidedAt ? formatDateTime(charge.decidedAt) : "—"}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">계좌 현재 잔고</dt><dd>{won(charge.accountBalance)}</dd></div>
                <div><dt className="text-muted">예치금 한도까지 남은 금액</dt><dd>{won(charge.depositRemaining)}</dd></div>
                <div><dt className="text-muted">셀프 충전 사용 횟수</dt><dd>{charge.chargeCount}회</dd></div>
            </dl>
            {!!charge.recentRequests?.length && <div className="mt-5">
                <h3 className="font-bold">같은 계좌의 최근 충전 요청</h3>
                <DataTable headings={["요청번호", "금액", "상태", "요청 시각"]}>
                    {charge.recentRequests.map(item => <tr key={item.requestId}><td>{item.requestId}</td><td>{won(item.amount)}</td><td><StatusBadge value={item.status} /></td><td>{formatDateTime(item.requestedAt)}</td></tr>)}
                </DataTable>
            </div>}
            {charge.status === "PENDING" && <><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} placeholder="처리 사유" className="mt-4 w-full rounded border p-3" /><CharCount value={reason} max={500} /><div className="mt-3 flex gap-3"><button disabled={busy || !reason.trim()} onClick={() => void mutate("decision", { decision: "APPROVED", reason })} className="admin-button-primary rounded px-4 py-2 disabled:opacity-50">충전 승인</button><button disabled={busy || !reason.trim()} onClick={() => void mutate("decision", { decision: "REJECTED", reason })} className="rounded border border-red-500 px-4 py-2 text-red-500 disabled:opacity-50">충전 거절</button></div></>}
        </>}
        {trade && <>
            <h2 className="text-lg font-bold">주문 #{trade.order.orderId}</h2>
            <p className="mt-3"><button onClick={() => open("user", trade.userId)} className="text-primary">{trade.userName}</button> ({trade.loginId}) · {trade.accountNumber}</p>
            <p className="mt-3">{trade.order.stockName} ({trade.order.stockCode})</p>
            <p className="mt-3"><StatusBadge value={trade.order.orderType} /> {trade.order.quantity}주 · <StatusBadge value={trade.order.status} /></p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">주문 유형</dt><dd>{trade.order.priceType === "MARKET" ? "시장가" : "지정가"}</dd></div>
                <div><dt className="text-muted">주문가</dt><dd>{won(trade.order.orderPrice)}</dd></div>
                <div><dt className="text-muted">체결가</dt><dd>{trade.order.execPrice != null ? won(trade.order.execPrice) : "—"}</dd></div>
                <div><dt className="text-muted">체결 금액</dt><dd>{trade.executedAmount != null ? won(trade.executedAmount) : "—"}</dd></div>
                <div><dt className="text-muted">수수료</dt><dd>{won(trade.order.fee)}</dd></div>
                <div><dt className="text-muted">주문 시간</dt><dd>{formatDateTime(trade.order.orderedAt)}</dd></div>
                <div><dt className="text-muted">체결 시간</dt><dd>{trade.order.executedAt ? formatDateTime(trade.order.executedAt) : "—"}</dd></div>
            </dl>
            {trade.order.status === "CANCELLED" && <div className="mt-4 rounded border border-hairline p-3 text-sm">
                <p><b>취소 사유</b> {trade.cancelReason ?? "—"}</p>
                <p className="mt-1"><b>취소 처리자</b> {trade.cancelledByLoginId ?? "—"}</p>
                <p className="mt-1"><b>취소 시간</b> {trade.cancelledAt ? formatDateTime(trade.cancelledAt) : "—"}</p>
            </div>}
            {trade.realizedProfit && <div className="mt-5">
                <h3 className="font-bold">실현 손익</h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                    <div><dt className="text-muted">평단가</dt><dd>{won(trade.realizedProfit.averageCost)}</dd></div>
                    <div><dt className="text-muted">매도가</dt><dd>{won(trade.realizedProfit.sellPrice)}</dd></div>
                    <div><dt className="text-muted">손익 금액</dt><dd className={trade.realizedProfit.profitAmount >= 0 ? "text-red-500" : "text-blue-500"}>{won(trade.realizedProfit.profitAmount)}</dd></div>
                    <div><dt className="text-muted">손익률</dt><dd className={trade.realizedProfit.profitRate >= 0 ? "text-red-500" : "text-blue-500"}>{trade.realizedProfit.profitRate.toFixed(2)}%</dd></div>
                </dl>
            </div>}
            <h3 className="mt-5 font-bold">잔고 변동내역</h3>
            <DataTable headings={["구분", "금액", "거래전 잔액", "거래후 잔액", "시각"]}>
                {(trade.balanceChanges ?? []).map((change, index) => <tr key={index}><td>{change.type}</td><td className={change.amount < 0 ? "text-blue-500" : "text-red-500"}>{change.amount < 0 ? "−" : "+"}{won(Math.abs(change.amount))}</td><td>{won(change.balanceBefore)}</td><td>{won(change.balanceAfter)}</td><td>{formatDateTime(change.createdAt)}</td></tr>)}
            </DataTable>
            {!trade.balanceChanges?.length && <p className="mt-2 text-sm text-muted">잔고 변동내역이 없습니다.</p>}
            {trade.order.status === "PENDING" && <><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} placeholder="취소 사유" className="mt-4 w-full rounded border p-3" /><CharCount value={reason} max={500} /><button disabled={busy || !reason.trim()} onClick={() => void mutate("cancel", { reason })} className="mt-3 rounded border border-red-500 px-4 py-2 text-red-500 disabled:opacity-50">미체결 주문 취소</button></>}
        </>}
        {user && <>
            <h2 className="text-lg font-bold">{user.name} ({user.loginId})</h2>
            <p className="mt-3">{user.email ?? "—"} · <StatusBadge value={user.status} /></p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">회원번호</dt><dd>#{user.userId}</dd></div>
                <div><dt className="text-muted">권한</dt><dd>{roleLabel[user.role] ?? user.role}</dd></div>
                <div><dt className="text-muted">생년월일</dt><dd>{user.birthdate ?? "—"}</dd></div>
                <div><dt className="text-muted">가입일</dt><dd>{formatDateTime(user.createdAt)}</dd></div>
                <div><dt className="text-muted">마지막 로그인</dt><dd>{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "기록 없음"}</dd></div>
                <div><dt className="text-muted">총 평가 자산</dt><dd>{won(user.totalAsset ?? 0)}</dd></div>
                <div><dt className="text-muted">평가 손익</dt><dd>{won(user.profitAmount ?? 0)} ({(user.profitRate ?? 0).toFixed(2)}%)</dd></div>
                <div><dt className="text-muted">실현 손익 합계</dt><dd>{user.realizedProfit != null ? won(user.realizedProfit) : "—"}</dd></div>
            </dl>

            <h3 className="mt-5 font-bold">소셜 로그인 연동</h3>
            {user.socialAccounts?.length ? <DataTable headings={["소셜", "연동일"]}>
                {user.socialAccounts.map(social => <tr key={social.provider}><td>{loginProviderLabel[social.provider] ?? social.provider}</td><td>{formatDateTime(social.linkedAt)}</td></tr>)}
            </DataTable> : <p className="mt-2 text-sm text-muted">연동된 소셜 계정이 없습니다 (일반 가입).</p>}

            <h3 className="mt-5 font-bold">투자 성향</h3>
            {user.investmentProfile ? <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">투자성향</dt><dd>{investmentTendencyLabel[user.investmentProfile.investmentTendency] ?? user.investmentProfile.investmentTendency}</dd></div>
                <div><dt className="text-muted">자금성향</dt><dd>{fundTendencyLabel[user.investmentProfile.fundTendency] ?? user.investmentProfile.fundTendency}</dd></div>
                <div><dt className="text-muted">투자레벨</dt><dd>{investmentLevelLabel[user.investmentProfile.investmentLevel]}</dd></div>
                <div><dt className="text-muted">설문 갱신일</dt><dd>{formatDateTime(user.investmentProfile.updatedAt)}</dd></div>
            </dl> : <p className="mt-2 text-sm text-muted">투자 성향 설문을 아직 완료하지 않았습니다.</p>}

            <h3 className="mt-5 font-bold">보유 계좌</h3>
            {(user.accounts ?? []).map(account => <AccountCard key={account.accountId} account={account} onChanged={reload} />)}
            {!user.accounts?.length && <p className="mt-2 text-sm text-muted">보유 계좌가 없습니다.</p>}

            <h3 className="mt-5 font-bold">보유 종목 ({user.holdings?.length ?? 0}개)</h3>
            <DataTable headings={["종목", "수량", "평균가", "현재가", "평가손익"]}>
                {(user.holdings ?? []).map(holding => <tr key={holding.stockCode}><td>{holding.stockName}</td><td>{holding.quantity}주</td><td>{won(holding.avgPrice)}</td><td>{won(holding.currentPrice)}</td><td className={holding.evaluationProfit >= 0 ? "text-red-500" : "text-blue-500"}>{won(holding.evaluationProfit)}</td></tr>)}
            </DataTable>
            {!user.holdings?.length && <p className="mt-2 text-sm text-muted">보유 종목이 없습니다.</p>}

            <h3 className="mt-5 font-bold">최근 주문내역 (전체 {user.orderCount ?? 0}건)</h3>
            <DataTable headings={["주문번호", "종목", "구분", "수량", "체결가", "상태", "주문 시간"]}>
                {(user.orders ?? []).map(order => <tr key={order.orderId}><td>{order.orderId}</td><td>{order.stockName}</td><td><StatusBadge value={order.orderType} /></td><td>{order.quantity}주</td><td>{order.execPrice != null ? won(order.execPrice) : "—"}</td><td><StatusBadge value={order.status} /></td><td>{formatDateTime(order.orderedAt)}</td></tr>)}
            </DataTable>
            {!user.orders?.length && <p className="mt-2 text-sm text-muted">주문 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">충전 요청 내역</h3>
            <DataTable headings={["요청번호", "금액", "상태", "요청 시각"]}>
                {(user.recentChargeRequests ?? []).map(item => <tr key={item.requestId}><td><button onClick={() => open("charge", item.requestId)} className="text-primary">{item.requestId}</button></td><td>{won(item.amount)}</td><td><StatusBadge value={item.status} /></td><td>{formatDateTime(item.requestedAt)}</td></tr>)}
            </DataTable>
            {!user.recentChargeRequests?.length && <p className="mt-2 text-sm text-muted">충전 요청 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">문의 내역 (전체 {user.inquiryCount ?? 0}건, 최근 5건 표시)</h3>
            <div className="mt-2 space-y-3">
                {(user.recentInquiries ?? []).map(item => <div key={item.inquiryId} className="rounded border border-hairline p-3 text-sm">
                    <p className="flex items-center justify-between gap-2"><b>{item.title}</b><StatusBadge value={item.status} /></p>
                    <p className="mt-1 text-muted">{formatDateTime(item.createdAt)}</p>
                    <p className="mt-2 whitespace-pre-wrap">{item.content}</p>
                    {item.answer ? <div className="mt-3 rounded bg-surface-soft p-2"><p className="text-xs text-muted">답변 {item.answeredAt ? formatDateTime(item.answeredAt) : ""}</p><p className="mt-1 whitespace-pre-wrap">{item.answer}</p></div> : <p className="mt-2 text-xs text-muted">답변 대기 중</p>}
                </div>)}
            </div>
            {!user.recentInquiries?.length && <p className="mt-2 text-sm text-muted">문의 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">관심 종목 ({user.watchlist?.length ?? 0}개)</h3>
            <DataTable headings={["종목", "추가일"]}>
                {(user.watchlist ?? []).map(item => <tr key={item.stockCode}><td>{item.stockName}</td><td>{formatDateTime(item.addedAt)}</td></tr>)}
            </DataTable>
            {!user.watchlist?.length && <p className="mt-2 text-sm text-muted">관심 종목이 없습니다.</p>}

            <h3 className="mt-5 font-bold">최근 조회 종목</h3>
            <DataTable headings={["종목", "조회일"]}>
                {(user.recentViewed ?? []).map(item => <tr key={item.stockCode}><td>{item.stockName}</td><td>{formatDateTime(item.viewedAt)}</td></tr>)}
            </DataTable>
            {!user.recentViewed?.length && <p className="mt-2 text-sm text-muted">최근 조회한 종목이 없습니다.</p>}

            <h3 className="mt-5 font-bold">뉴스 브리핑 설정</h3>
            {user.newsBriefingSetting ? <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">언론사</dt><dd>{user.newsBriefingSetting.outletDomain}</dd></div>
                <div><dt className="text-muted">브리핑 시각</dt><dd>{user.newsBriefingSetting.briefingTime}</dd></div>
                <div><dt className="text-muted">마지막 발송 시도</dt><dd>{user.newsBriefingSetting.lastAttemptAt ? formatDateTime(user.newsBriefingSetting.lastAttemptAt) : "—"}</dd></div>
            </dl> : <p className="mt-2 text-sm text-muted">뉴스 브리핑을 설정하지 않았습니다.</p>}

            <h3 className="mt-5 font-bold">정지·해제 이력</h3>
            <DataTable headings={["구분", "변경", "사유", "처리자", "시각"]}>
                {(user.suspensionHistory ?? []).map((item, index) => <tr key={index}><td>{item.action === "ACCOUNT_STATUS_CHANGE" ? `계좌 ${item.accountNumber ?? ""}` : "회원"}</td><td><StatusBadge value={item.beforeValue} /> → <StatusBadge value={item.afterValue} /></td><td className="max-w-48 break-words">{item.reason}</td><td>{item.adminLoginId}</td><td>{formatDateTime(item.createdAt)}</td></tr>)}
            </DataTable>
            {!user.suspensionHistory?.length && <p className="mt-2 text-sm text-muted">정지·해제 이력이 없습니다.</p>}

            <h3 className="mt-5 font-bold">관리자 처리 내역 (전체 {user.adminActionCount ?? 0}건)</h3>
            <DataTable headings={["처리", "변경", "사유", "처리자", "시각"]}>
                {(user.recentAdminActions ?? []).map((item, index) => <tr key={index}><td>{item.action}</td><td>{item.beforeValue ?? "—"} → {item.afterValue ?? "—"}</td><td className="max-w-48 break-words">{item.reason ?? "—"}</td><td>{item.adminLoginId}</td><td>{formatDateTime(item.createdAt)}</td></tr>)}
            </DataTable>
            {!user.recentAdminActions?.length && <p className="mt-2 text-sm text-muted">관리자 처리 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">회원 상태</h3>
            <UserStatusAction user={user} onChanged={back} />
        </>}
        {account && <>
            <h2 className="text-lg font-bold">{account.accountName} ({account.accountNumber})</h2>
            <p className="mt-3"><button onClick={() => open("user", account.userId)} className="text-primary">{account.userName}</button> ({account.loginId}) · <StatusBadge value={account.status} /></p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">현재 잔액</dt><dd>{won(account.balance)}</dd></div>
                <div><dt className="text-muted">주문 동결 금액</dt><dd>{won(account.frozenBalance)}</dd></div>
                <div><dt className="text-muted">기준 자산</dt><dd>{won(account.baseBalance)}</dd></div>
                <div><dt className="text-muted">총 평가 자산</dt><dd>{won(account.totalAsset ?? 0)}</dd></div>
                <div><dt className="text-muted">평가 손익</dt><dd>{won(account.profitAmount ?? 0)} ({(account.profitRate ?? 0).toFixed(2)}%)</dd></div>
                <div><dt className="text-muted">셀프 충전 횟수</dt><dd>{account.chargeCount}/{account.unlimitedCharge ? "무제한" : account.maxChargeCount}</dd></div>
                <div><dt className="text-muted">예치 이자율</dt><dd>연 {account.interestRate.toFixed(2)}%</dd></div>
                <div><dt className="text-muted">누적 이자</dt><dd>{won(account.totalInterest)}</dd></div>
                <div><dt className="text-muted">개설일</dt><dd>{formatDateTime(account.openedAt)}</dd></div>
            </dl>

            <h3 className="mt-5 font-bold">통계</h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <div><dt className="text-muted">총 충전액</dt><dd>{won(account.stats?.totalCharged ?? 0)}</dd></div>
                <div><dt className="text-muted">총 차감액</dt><dd>{won(account.stats?.totalDeducted ?? 0)}</dd></div>
                <div><dt className="text-muted">총 수수료</dt><dd>{won(account.stats?.totalFee ?? 0)}</dd></div>
                <div><dt className="text-muted">실현 손익 합계</dt><dd>{account.stats?.realizedProfit != null ? won(account.stats.realizedProfit) : "—"}</dd></div>
            </dl>

            <h3 className="mt-5 font-bold">정지·해제 이력</h3>
            <DataTable headings={["변경", "사유", "처리자", "시각"]}>
                {(account.suspensionHistory ?? []).map((item, index) => <tr key={index}><td><StatusBadge value={item.beforeValue} /> → <StatusBadge value={item.afterValue} /></td><td className="max-w-48 break-words">{item.reason}</td><td>{item.adminLoginId}</td><td>{formatDateTime(item.createdAt)}</td></tr>)}
            </DataTable>
            {!account.suspensionHistory?.length && <p className="mt-2 text-sm text-muted">정지·해제 이력이 없습니다.</p>}

            <h3 className="mt-5 font-bold">보유 종목</h3>
            <DataTable headings={["종목", "수량", "평균가", "현재가", "평가손익"]}>
                {(account.holdings ?? []).map(holding => <tr key={holding.stockCode}><td>{holding.stockName}</td><td>{holding.quantity}주</td><td>{won(holding.avgPrice)}</td><td>{won(holding.currentPrice)}</td><td className={holding.evaluationProfit >= 0 ? "text-red-500" : "text-blue-500"}>{won(holding.evaluationProfit)}</td></tr>)}
            </DataTable>
            {!account.holdings?.length && <p className="mt-2 text-sm text-muted">보유 종목이 없습니다.</p>}

            <h3 className="mt-5 font-bold">최근 주문 (전체 {account.orderCount ?? 0}건)</h3>
            <DataTable headings={["주문번호", "종목", "구분", "수량", "체결가", "상태", "주문 시간"]}>
                {(account.recentOrders ?? []).map(order => <tr key={order.orderId}><td>{order.orderId}</td><td>{order.stockName}</td><td><StatusBadge value={order.orderType} /></td><td>{order.quantity}주</td><td>{order.execPrice != null ? won(order.execPrice) : "—"}</td><td><StatusBadge value={order.status} /></td><td>{formatDateTime(order.orderedAt)}</td></tr>)}
            </DataTable>
            {!account.recentOrders?.length && <p className="mt-2 text-sm text-muted">주문 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">최근 충전 요청</h3>
            <DataTable headings={["요청번호", "금액", "상태", "요청 시각"]}>
                {(account.recentChargeRequests ?? []).map(item => <tr key={item.requestId}><td><button onClick={() => open("charge", item.requestId)} className="text-primary">{item.requestId}</button></td><td>{won(item.amount)}</td><td><StatusBadge value={item.status} /></td><td>{formatDateTime(item.requestedAt)}</td></tr>)}
            </DataTable>
            {!account.recentChargeRequests?.length && <p className="mt-2 text-sm text-muted">충전 요청 내역이 없습니다.</p>}

            <h3 className="mt-5 font-bold">거래내역(잔고 변동)</h3>
            <AccountLedgerTable accountId={account.accountId} />

            <h3 className="mt-5 font-bold">계좌 상태 / 지급·차감</h3>
            <AccountCard account={account} onChanged={reload} />
        </>}
        {inquiry && <>
            <h2 className="text-lg font-bold">문의 #{inquiry.inquiryId}</h2>
            <p className="mt-3"><button onClick={() => open("user", inquiry.userId)} className="text-primary">{inquiry.userName}</button> ({inquiry.loginId})</p>
            <p className="mt-3"><InquiryStatusBadge value={inquiry.status} /> · 등록 {formatDateTime(inquiry.createdAt)}</p>
            <h3 className="mt-4 font-bold">{inquiry.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm">{inquiry.content}</p>
            {inquiry.answer && <div className="mt-4 rounded border border-hairline bg-surface-soft p-3 text-sm">
                <p className="text-xs text-muted">답변{inquiry.answeredAt ? ` · ${formatDateTime(inquiry.answeredAt)}` : ""}{inquiry.answeredByName ? ` · ${inquiry.answeredByName}` : ""}</p>
                <p className="mt-2 whitespace-pre-wrap">{inquiry.answer}</p>
            </div>}
            {inquiry.status === "PENDING" && <><textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={500} placeholder="답변 내용" className="mt-4 w-full rounded border p-3" /><CharCount value={reason} max={500} /><button disabled={busy || !reason.trim()} onClick={() => void mutate("answer", { answer: reason })} className="admin-button-primary mt-3 rounded px-4 py-2 disabled:opacity-50">답변 등록</button></>}
        </>}
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
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [accountsList, setAccountsList] = useState<AdminAccount[]>([]);
    const [ledger, setLedger] = useState<AccountTransaction[]>([]);
    const [accountsTab, setAccountsTab] = useState<"list" | "ledger" | "charges">("charges");
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [field, setField] = useState("ALL");
    const [matchType, setMatchType] = useState<"CONTAINS" | "EXACT">("CONTAINS");
    const [status, setStatus] = useState("");
    const [ledgerType, setLedgerType] = useState("");
    const [sortBy, setSortBy] = useState("LATEST");
    const [sort, setSort] = useState<SortState>(null);
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
        if (!authenticated || detail || section === "dashboard" || section === "activity" || section === "admin-tools") return;
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try {
                const params = new URLSearchParams({ page: String(page), size: "10", sortBy });
                if (sort) { params.set("sortColumn", sort.column); params.set("direction", sort.direction); }
                if (search) { params.set("query", search); params.set("field", field); params.set("matchType", matchType); }
                if (status) params.set("status", status);
                if (section === "users") {
                    const result = await apiRequest<Page<AdminUser>>(`/api/admin/users?${params}`);
                    if (active) { setUsers(result.content); setTotalPages(result.totalPages); }
                } else if (section === "transactions") {
                    const result = await apiRequest<Page<AdminTrade>>(`/api/admin/trades?${params}`);
                    if (active) { setTrades(result.content); setTotalPages(result.totalPages); }
                } else if (section === "accounts" && accountsTab === "list") {
                    const result = await apiRequest<Page<AdminAccount>>(`/api/admin/accounts?${params}`);
                    if (active) { setAccountsList(result.content); setTotalPages(result.totalPages); }
                } else if (section === "accounts" && accountsTab === "ledger") {
                    if (ledgerType) params.set("type", ledgerType);
                    const result = await apiRequest<Page<AccountTransaction>>(`/api/admin/account-transactions?${params}`);
                    if (active) { setLedger(result.content); setTotalPages(result.totalPages); }
                } else if (section === "inquiries") {
                    const result = await apiRequest<Page<AdminInquiry>>(`/api/admin/inquiries?${params}`);
                    if (active) { setInquiries(result.content); setTotalPages(result.totalPages); }
                } else {
                    const result = await apiRequest<Page<Charge>>(`/api/admin/charge-requests?${params}`);
                    if (active) { setCharges(result.content); setTotalPages(result.totalPages); }
                }
            } catch (error) { if (active) setError(getApiErrorMessage(error, "관리자 정보를 불러오지 못했습니다.")); }
            finally { if (active) setLoading(false); }
        }
        void load(); return () => { active = false; };
    }, [authenticated, section, accountsTab, detail, page, search, field, matchType, status, ledgerType, sortBy, sort, revision]);
    if (!authenticated) return <main className="market-theme min-h-screen p-8"><p role="status">접근 권한을 확인하고 있습니다...</p></main>;
    const changeSection = (next: Section) => { setSection(next); setAccountsTab("charges"); setDetail(null); setQuery(""); setSearch(""); setField("ALL"); setMatchType("CONTAINS"); setStatus(""); setLedgerType(""); setSortBy(next === "inquiries" ? "PENDING_FIRST" : "LATEST"); setSort(null); setPage(0); };
    const changeAccountsTab = (next: "list" | "ledger" | "charges") => { setAccountsTab(next); setQuery(""); setSearch(""); setField("ALL"); setMatchType("CONTAINS"); setStatus(""); setLedgerType(""); setSortBy("LATEST"); setSort(null); setPage(0); };
    const handleSort = (column: string) => { setSort(current => !current || current.column !== column ? { column, direction: "DESC" } : current.direction === "DESC" ? { column, direction: "ASC" } : null); setPage(0); };
    const clearSearch = () => { setQuery(""); setSearch(""); setField("ALL"); setMatchType("CONTAINS"); setPage(0); };
    const searchContext = section === "accounts" ? accountsTab : section;
    const statuses = section === "users" ? ["ACTIVE", "SUSPENDED"]
        : section === "transactions" ? ["PENDING", "EXECUTED", "CANCELLED"]
        : section === "accounts" && accountsTab === "list" ? ["ACTIVE", "SUSPENDED"]
        : section === "inquiries" ? ["PENDING", "ANSWERED"]
        : ["PENDING", "APPROVED", "REJECTED"];
    return <Shell section={section} setSection={changeSection} logout={() => { void logout().catch(() => {}).finally(() => { setAuthenticated(false); setDetail(null); router.replace("/login"); }); }}>
        {detail ? <DetailPanel key={detail.kind + detail.id} detail={detail} back={() => { setDetail(null); setRevision(value => value + 1); }} open={(kind, id) => setDetail({ kind, id })} /> : section === "activity" ? <AdminActivity open={(kind, id) => setDetail({ kind, id })} /> : section === "admin-tools" ? <AdminTools /> : section === "dashboard" ? <AdminOverview navigate={(next, filter) => { changeSection(next); setStatus(filter ?? ""); }} open={(kind, id) => setDetail({ kind, id })} /> : <div className="space-y-4">
            <form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(0); }} className="flex flex-wrap gap-2">
                <select aria-label="검색 항목" value={field} onChange={event => { setField(event.target.value); setPage(0); }} className="rounded border border-hairline p-2">{(searchFields[searchContext] ?? []).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select aria-label="일치 방식" value={matchType} onChange={event => { setMatchType(event.target.value as "CONTAINS" | "EXACT"); setPage(0); }} className="rounded border border-hairline p-2"><option value="CONTAINS">포함</option><option value="EXACT">일치</option></select>
                <span className="relative inline-flex">
                    <input aria-label="검색" placeholder={searchPlaceholders[searchContext] ?? "검색"} value={query} onChange={event => setQuery(event.target.value)} className="rounded border border-hairline p-2 pr-7" />
                    {(query || search) && <button type="button" aria-label="검색어 지우기" onClick={clearSearch} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink">×</button>}
                </span>
                {section === "accounts" && accountsTab === "ledger"
                    ? <select aria-label="거래 유형" value={ledgerType} onChange={event => { setLedgerType(event.target.value); setPage(0); }} className="rounded border border-hairline p-2">{ledgerTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                    : <select aria-label="상태 필터" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }} className="rounded border border-hairline p-2"><option value="">전체 상태</option>{statuses.map(value => <option key={value} value={value}>{statusText[value]}</option>)}</select>}
                {sortOptions[searchContext] && <select aria-label="정렬" value={sortBy} onChange={event => { setSortBy(event.target.value); setPage(0); }} className="rounded border border-hairline p-2">{sortOptions[searchContext].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
                <button className="admin-button-primary rounded px-4 py-2">검색</button>
            </form>
            {error && <p role="alert" className="text-red-500">{error}</p>}
            {section === "accounts" && <div className="flex gap-2"><button onClick={() => changeAccountsTab("list")} className={accountsTab === "list" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>계좌 목록</button><button onClick={() => changeAccountsTab("ledger")} className={accountsTab === "ledger" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>충전·차감 이력</button><button onClick={() => changeAccountsTab("charges")} className={accountsTab === "charges" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>충전 요청</button></div>}
            {loading ? <p role="status">불러오는 중...</p> : <>
                {section === "accounts" && accountsTab === "list" && <><h2 className="font-bold">가상계좌 목록</h2><DataTable headings={[<SortHeader key="ACCOUNT_NUMBER" label="계좌번호" column="ACCOUNT_NUMBER" sort={sort} onSort={handleSort} />, <SortHeader key="USER" label="사용자" column="USER" sort={sort} onSort={handleSort} />, <SortHeader key="BALANCE" label="잔고" column="BALANCE" sort={sort} onSort={handleSort} />, <SortHeader key="OPENED_AT" label="개설일" column="OPENED_AT" sort={sort} onSort={handleSort} />, <SortHeader key="STATUS" label="상태" column="STATUS" sort={sort} onSort={handleSort} />, "관리"]}>{accountsList.map(item => <tr key={item.accountId}><td>{item.accountNumber}</td><td><button onClick={() => setDetail({ kind: "user", id: item.userId })} className="text-primary">{item.userName}</button></td><td>{won(item.balance)}</td><td>{item.openedAt ? formatDateTime(item.openedAt) : "—"}</td><td><StatusBadge value={item.status} /></td><td><button onClick={() => setDetail({ kind: "account", id: item.accountId })} className="text-primary">상세</button></td></tr>)}</DataTable>{!accountsList.length && <p className="text-sm text-muted">계좌가 없습니다.</p>}</>}
                {section === "accounts" && accountsTab === "ledger" && <><h2 className="font-bold">충전·차감 이력</h2><DataTable headings={[<SortHeader key="TRANSACTION_ID" label="거래ID" column="TRANSACTION_ID" sort={sort} onSort={handleSort} />, <SortHeader key="ACCOUNT_NUMBER" label="계좌번호" column="ACCOUNT_NUMBER" sort={sort} onSort={handleSort} />, <SortHeader key="USER" label="사용자" column="USER" sort={sort} onSort={handleSort} />, <SortHeader key="TYPE" label="유형" column="TYPE" sort={sort} onSort={handleSort} />, <SortHeader key="AMOUNT" label="금액" column="AMOUNT" sort={sort} onSort={handleSort} />, <SortHeader key="BALANCE_BEFORE" label="거래전 잔액" column="BALANCE_BEFORE" sort={sort} onSort={handleSort} />, <SortHeader key="BALANCE_AFTER" label="거래후 잔액" column="BALANCE_AFTER" sort={sort} onSort={handleSort} />, <SortHeader key="CHARGE_REQUEST_ID" label="관련 요청" column="CHARGE_REQUEST_ID" sort={sort} onSort={handleSort} />, <SortHeader key="PROCESSED_BY" label="처리자" column="PROCESSED_BY" sort={sort} onSort={handleSort} />, <SortHeader key="REASON" label="사유" column="REASON" sort={sort} onSort={handleSort} />, <SortHeader key="OCCURRED_AT" label="시각" column="OCCURRED_AT" sort={sort} onSort={handleSort} />]}>{ledger.map(item => <tr key={`${item.entryType}-${item.transactionId ?? item.chargeRequest?.requestId}`}><td>{item.transactionId ?? "—"}</td><td>{item.accountNumber}</td><td><button onClick={() => setDetail({ kind: "user", id: item.userId })} className="text-primary">{item.userName}</button></td><td>{item.entryType === "REJECTED_REQUEST" ? <span className="ao-badge red">요청 거절</span> : <span className={`ao-badge ${item.type?.includes("CHARGE") ? "green" : "red"}`}>{item.type ? ledgerTypeLabel[item.type] : "—"}</span>}</td><td className={item.amount != null ? (item.amount < 0 ? "text-blue-500" : "text-red-500") : ""}>{item.amount != null ? `${item.amount < 0 ? "−" : "+"}${won(Math.abs(item.amount))}` : item.chargeRequest ? `요청 ${won(item.chargeRequest.amount)}` : "—"}</td><td>{item.balanceBefore != null ? won(item.balanceBefore) : "—"}</td><td>{item.balanceAfter != null ? won(item.balanceAfter) : "—"}</td><td>{item.chargeRequest ? <button onClick={() => setDetail({ kind: "charge", id: item.chargeRequest!.requestId })} className="text-primary">#{item.chargeRequest.requestId}</button> : "—"}</td><td>{item.processedByLoginId ?? item.chargeRequest?.decidedByName ?? "—"}</td><td className="max-w-48 break-words">{item.reason ?? item.chargeRequest?.decisionReason ?? "—"}</td><td>{formatDateTime(item.occurredAt)}</td></tr>)}</DataTable>{!ledger.length && <p className="text-sm text-muted">충전·차감 이력이 없습니다.</p>}</>}
                {section === "accounts" && accountsTab === "charges" && <><h2 className="font-bold">캐시 충전 요청</h2><DataTable headings={[<SortHeader key="REQUEST_ID" label="요청번호" column="REQUEST_ID" sort={sort} onSort={handleSort} />, <SortHeader key="USER" label="사용자" column="USER" sort={sort} onSort={handleSort} />, <SortHeader key="ACCOUNT_NUMBER" label="계좌" column="ACCOUNT_NUMBER" sort={sort} onSort={handleSort} />, <SortHeader key="AMOUNT" label="요청 금액" column="AMOUNT" sort={sort} onSort={handleSort} />, <SortHeader key="REQUESTED_AT" label="요청 시각" column="REQUESTED_AT" sort={sort} onSort={handleSort} />, <SortHeader key="STATUS" label="상태" column="STATUS" sort={sort} onSort={handleSort} />, "관리"]}>{charges.map(item => <tr key={item.requestId}><td>{item.requestId}</td><td><button onClick={() => setDetail({ kind: "user", id: item.userId })} className="text-primary">{item.userName}</button></td><td>{item.accountNumber}</td><td>{won(item.amount)}</td><td>{formatDateTime(item.requestedAt)}</td><td><StatusBadge value={item.status} /></td><td><button onClick={() => setDetail({ kind: "charge", id: item.requestId })} className="text-primary">상세 / 심사</button></td></tr>)}</DataTable>{!charges.length && <p className="text-sm text-muted">충전 요청이 없습니다.</p>}</>}
                {section === "inquiries" && <DataTable headings={[<SortHeader key="INQUIRY_ID" label="문의번호" column="INQUIRY_ID" sort={sort} onSort={handleSort} />, <SortHeader key="USER" label="사용자" column="USER" sort={sort} onSort={handleSort} />, <SortHeader key="TITLE" label="제목" column="TITLE" sort={sort} onSort={handleSort} />, <SortHeader key="STATUS" label="상태" column="STATUS" sort={sort} onSort={handleSort} />, <SortHeader key="CREATED_AT" label="등록일" column="CREATED_AT" sort={sort} onSort={handleSort} />, <SortHeader key="ANSWERED_AT" label="답변일" column="ANSWERED_AT" sort={sort} onSort={handleSort} />, "관리"]}>{inquiries.map(item => <tr key={item.inquiryId}><td>{item.inquiryId}</td><td><button onClick={() => setDetail({ kind: "user", id: item.userId })} className="text-primary">{item.userName}</button></td><td>{item.title}</td><td><InquiryStatusBadge value={item.status} /></td><td>{formatDateTime(item.createdAt)}</td><td>{item.answeredAt ? formatDateTime(item.answeredAt) : "—"}</td><td><button onClick={() => setDetail({ kind: "inquiry", id: item.inquiryId })} className="text-primary">상세 / 답변</button></td></tr>)}</DataTable>}
                {section === "inquiries" && !inquiries.length && <p className="text-sm text-muted">문의가 없습니다.</p>}
                {section === "transactions" && <><h2 className="font-bold">거래 내역</h2><DataTable headings={[<SortHeader key="ORDER_ID" label="주문번호" column="ORDER_ID" sort={sort} onSort={handleSort} />, <SortHeader key="USER" label="사용자" column="USER" sort={sort} onSort={handleSort} />, <SortHeader key="STOCK" label="종목" column="STOCK" sort={sort} onSort={handleSort} />, <SortHeader key="ORDER_TYPE" label="구분" column="ORDER_TYPE" sort={sort} onSort={handleSort} />, <SortHeader key="QUANTITY" label="수량" column="QUANTITY" sort={sort} onSort={handleSort} />, <SortHeader key="AMOUNT" label="금액" column="AMOUNT" sort={sort} onSort={handleSort} />, <SortHeader key="STATUS" label="상태" column="STATUS" sort={sort} onSort={handleSort} />, <SortHeader key="ORDERED_AT" label="주문 시각" column="ORDERED_AT" sort={sort} onSort={handleSort} />, "관리"]}>{trades.map(item => <tr key={item.order.orderId}><td>{item.order.orderId}</td><td>{item.userName}</td><td>{item.order.stockName}</td><td><StatusBadge value={item.order.orderType} /></td><td>{item.order.quantity}</td><td>{won((item.order.execPrice ?? item.order.orderPrice) * item.order.quantity)}</td><td><StatusBadge value={item.order.status} /></td><td>{formatDateTime(item.order.orderedAt)}</td><td><button onClick={() => setDetail({ kind: "transaction", id: item.order.orderId })} className="text-primary">상세</button></td></tr>)}</DataTable>{!trades.length && <p className="text-sm text-muted">거래 내역이 없습니다.</p>}</>}
                {section === "users" && <><DataTable headings={[<SortHeader key="USER_ID" label="회원번호" column="USER_ID" sort={sort} onSort={handleSort} />, <SortHeader key="LOGIN_ID" label="아이디" column="LOGIN_ID" sort={sort} onSort={handleSort} />, <SortHeader key="NAME" label="이름" column="NAME" sort={sort} onSort={handleSort} />, <SortHeader key="EMAIL" label="이메일" column="EMAIL" sort={sort} onSort={handleSort} />, <SortHeader key="CREATED_AT" label="가입일" column="CREATED_AT" sort={sort} onSort={handleSort} />, <SortHeader key="STATUS" label="상태" column="STATUS" sort={sort} onSort={handleSort} />, "관리"]}>{users.map(user => <tr key={user.userId}><td>{user.userId}</td><td>{user.loginId}</td><td>{user.name}</td><td>{user.email ?? "—"}</td><td>{user.createdAt?.slice(0, 10)}</td><td><StatusBadge value={user.status} /></td><td><button onClick={() => setDetail({ kind: "user", id: user.userId })} className="text-primary">상세</button></td></tr>)}</DataTable>{!users.length && <p>검색 결과가 없습니다.</p>}</>}
                <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
            </>}
        </div>}
    </Shell>;
}
