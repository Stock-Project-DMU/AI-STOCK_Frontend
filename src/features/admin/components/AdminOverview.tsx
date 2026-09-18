"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";

type Summary = { totalUserCount: number; onlineUserCount: number; totalTradeCount: number; totalTradeAmount: number };
type Point = { period: string; value: number };
type Page<T> = { content: T[]; totalElements: number };
type Charge = { requestId: number; userName: string; amount: number; requestedAt: string };
type User = { userId: number; name: string; loginId: string; createdAt: string };
type Trade = { userName: string; order: { orderId: number; stockName: string; orderType: string; status: string; quantity: number; orderedAt: string } };
type Data = { summary?: Summary; charges?: Page<Charge>; pending?: Page<Trade>; users?: Page<User>; trades?: Page<Trade>; orders?: Point[]; amounts?: Point[]; signups?: Point[] };
type Props = { navigate: (section: "accounts" | "transactions" | "users", status?: string) => void; open: (kind: "account" | "transaction" | "user", id: number) => void };
const number = (value?: number) => value == null ? "—" : value.toLocaleString("ko-KR");
const date = (value: string) => value.replace("T", " ").slice(5, 16);
const labels: Record<string, string> = { PENDING: "미체결", EXECUTED: "체결", CANCELLED: "취소" };
export function koreaDays(days: number) {
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
    return Array.from({ length: days }, (_, index) => {
        const value = new Date(`${today}T00:00:00Z`);
        value.setUTCDate(value.getUTCDate() - days + 1 + index);
        return value.toISOString().slice(0, 10);
    });
}

export default function AdminOverview({ navigate, open }: Props) {
    const [days, setDays] = useState(7);
    const [metric, setMetric] = useState<"orders" | "amounts" | "signups">("orders");
    const [revision, setRevision] = useState(0);
    const [data, setData] = useState<Data>({});
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [updated, setUpdated] = useState("");
    const [dates, setDates] = useState<string[]>([]);
    useEffect(() => {
        const controller = new AbortController();
        const calendar = koreaDays(days);
        const query = `from=${calendar[0]}&to=${calendar.at(-1)}&interval=DAY`;
        const endpoints = {
            summary: "/api/admin/dashboard",
            charges: "/api/admin/charge-requests?status=PENDING&size=4&sort=requestedAt,asc",
            pending: "/api/admin/trades?status=PENDING&size=1",
            users: "/api/admin/users?size=4&sort=createdAt,desc",
            trades: "/api/admin/trades?size=5&sort=orderedAt,desc",
            orders: `/api/admin/statistics/orders?${query}`,
            amounts: `/api/admin/statistics/amounts?${query}`,
            signups: `/api/admin/statistics/users?${query}`,
        };
        async function load() {
            setLoading(true); setErrors([]); setData({}); setDates(calendar);
            const entries = Object.entries(endpoints);
            const responses = await Promise.allSettled(entries.map(([, url]) => apiRequest(url, { signal: controller.signal })));
            if (controller.signal.aborted) return;
            const next: Record<string, unknown> = {};
            const failures: string[] = [];
            responses.forEach((result, index) => {
                if (result.status === "fulfilled") next[entries[index][0]] = result.value;
                else failures.push(getApiErrorMessage(result.reason, "일부 운영 정보를 불러오지 못했습니다."));
            });
            setData(next as Data); setErrors([...new Set(failures)]); setLoading(false);
            setUpdated(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
        }
        void load();
        return () => controller.abort();
    }, [days, revision]);
    const series = data[metric];
    const chart = dates.map(period => ({ period: period.slice(5), value: series?.find(point => point.period === period)?.value ?? 0 }));
    const total = series?.reduce((sum, point) => sum + point.value, 0);
    const cards = [
        { label: "전체 회원", value: number(data.summary?.totalUserCount), unit: "명", note: "탈퇴하지 않은 가입 회원", icon: "01" },
        { label: "현재 접속", value: number(data.summary?.onlineUserCount), unit: "명", note: "실시간 연결 사용자 기준", icon: "02" },
        { label: "누적 거래", value: number(data.summary?.totalTradeCount), unit: "건", note: "전체 기간 체결 완료 주문", icon: "03" },
        { label: "누적 거래대금", value: number(data.summary?.totalTradeAmount), unit: "원", note: "체결 완료 주문 금액 합계", icon: "04" },
    ];
    return <div className="ao-overview" aria-busy={loading}>
        <div className="ao-heading"><div><span className="ao-eyebrow">OPERATIONS OVERVIEW</span><h2>운영 현황</h2><p>오늘 확인할 업무와 서비스 흐름을 한눈에 살펴보세요.</p></div><div className="ao-update"><span>{loading ? "데이터 조회 중…" : `${updated} 조회 · 한국 시간`}</span><button disabled={loading} onClick={() => setRevision(value => value + 1)}>↻ 새로고침</button></div></div>
        {!!errors.length && <div className="ao-error" role="alert">{errors.join(" ")} <button onClick={() => setRevision(value => value + 1)}>다시 시도</button></div>}
        <div className="ao-kpis">{cards.map(card => <article className="ao-kpi" key={card.label}><div><span>{card.label}</span><span className="ao-number-icon">{card.icon}</span></div><strong>{card.value}<small>{card.unit}</small></strong><p>{card.note}</p></article>)}</div>
        <div className="ao-middle">
            <section className="ao-card ao-chart"><div className="ao-card-heading"><div><h3>서비스 활동 추이</h3><p>{dates[0]} — {dates.at(-1)}</p></div><div className="ao-segment" aria-label="조회 기간">{[7, 30].map(value => <button key={value} aria-pressed={days === value} onClick={() => setDays(value)}>{value}일</button>)}</div></div>
                <div className="ao-chart-tools"><div className="ao-tabs">{([["orders", "주문 수"], ["amounts", "체결 금액"], ["signups", "신규 가입"]] as const).map(([key, label]) => <button key={key} aria-pressed={metric === key} onClick={() => setMetric(key)}>{label}</button>)}</div><strong>{number(total)}<small>{metric === "amounts" ? "원" : metric === "signups" ? "명" : "건"}</small></strong></div>
                <div className="ao-chart-canvas">{!series ? <div className="ao-empty" role="status">{loading ? "통계를 불러오고 있습니다…" : "통계를 불러오지 못했습니다."}</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 15, right: 12, left: 0, bottom: 0 }} accessibilityLayer><defs><linearGradient id="admin-volume" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#386cf6" stopOpacity={0.23}/><stop offset="100%" stopColor="#386cf6" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e9edf5"/><XAxis dataKey="period" tickLine={false} axisLine={false} minTickGap={35} tick={{ fontSize: 11, fill: "#8490a5" }}/><YAxis width={48} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "#8490a5" }} tickFormatter={value => new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value)}/><Tooltip formatter={value => [number(Number(value)), metric === "amounts" ? "체결 금액 (원)" : metric === "signups" ? "가입 (명)" : "주문 (건)"]} contentStyle={{ borderRadius: 12, border: "1px solid #e7ebf2", fontSize: 12 }}/><Area type="monotone" dataKey="value" stroke="#386cf6" strokeWidth={2.5} fill="url(#admin-volume)" isAnimationActive={false}/></AreaChart></ResponsiveContainer>}</div>
                {series && total === 0 && <p className="ao-chart-note">선택한 기간에 집계된 활동이 없습니다.</p>}
            </section>
            <section className="ao-card ao-tasks"><span className="ao-eyebrow">ACTION CENTER</span><h3>처리가 필요한 업무</h3><p>대기 중인 요청을 확인해 주세요.</p><button onClick={() => navigate("accounts", "PENDING")}><span className="ao-task-icon amber">₩</span><span><b>충전 승인 대기</b><small>요청 검토 및 승인·거절</small></span><strong>{number(data.charges?.totalElements)}<small>건 →</small></strong></button><button onClick={() => navigate("transactions", "PENDING")}><span className="ao-task-icon blue">⇄</span><span><b>미체결 주문</b><small>주문 상태 및 취소 관리</small></span><strong>{number(data.pending?.totalElements)}<small>건 →</small></strong></button><div className="ao-task-note">충전 요청은 오래된 순서로 표시됩니다. 요청 상세에서 내용을 확인한 후 처리하세요.</div></section>
        </div>
        <div className="ao-bottom"><section className="ao-card"><div className="ao-card-heading"><div><h3>충전 승인 대기 <span className="ao-count">{number(data.charges?.totalElements)}</span></h3><p>먼저 접수된 요청부터 확인하세요.</p></div><button className="ao-link" onClick={() => navigate("accounts", "PENDING")}>전체 보기 ↗</button></div><div className="ao-table-wrap"><table><thead><tr><th>요청자</th><th>요청 금액</th><th>접수 시간</th><th>처리</th></tr></thead><tbody>{data.charges?.content.map(item => <tr key={item.requestId}><td><b>{item.userName}</b><small>#{item.requestId}</small></td><td className="ao-money">{number(item.amount)}원</td><td>{date(item.requestedAt)}</td><td><button className="ao-review" onClick={() => open("account", item.requestId)}>검토 →</button></td></tr>)}</tbody></table></div>{!data.charges?.content.length && <div className="ao-empty">{loading ? "조회 중…" : data.charges ? "대기 중인 충전 요청이 없습니다." : "충전 요청을 불러오지 못했습니다."}</div>}</section>
            <section className="ao-card"><div className="ao-card-heading"><div><h3>최근 가입 회원</h3><p>새롭게 합류한 사용자</p></div><button className="ao-link" onClick={() => navigate("users")}>전체 보기 ↗</button></div><div className="ao-members">{data.users?.content.map(user => <button key={user.userId} onClick={() => open("user", user.userId)}><span className="ao-avatar">{user.name.slice(0, 1)}</span><span><b>{user.name}</b><small>{user.loginId}</small></span><time>{date(user.createdAt)}</time><span>↗</span></button>)}</div>{!data.users?.content.length && <div className="ao-empty">{loading ? "조회 중…" : data.users ? "가입 회원이 없습니다." : "회원을 불러오지 못했습니다."}</div>}</section></div>
        <section className="ao-card"><div className="ao-card-heading"><div><h3>최근 거래</h3><p>가장 최근에 접수된 주문 5건</p></div><button className="ao-link" onClick={() => navigate("transactions")}>거래 관리 ↗</button></div><div className="ao-table-wrap"><table><thead><tr><th>종목 / 주문번호</th><th>사용자</th><th>유형</th><th>수량</th><th>상태</th><th>주문 시간</th><th>상세</th></tr></thead><tbody>{data.trades?.content.map(({ order, userName }) => <tr key={order.orderId}><td><b>{order.stockName}</b><small>#{order.orderId}</small></td><td>{userName}</td><td><span className={`ao-badge ${order.orderType === "BUY" ? "red" : "blue"}`}>{order.orderType === "BUY" ? "매수" : "매도"}</span></td><td>{number(order.quantity)}주</td><td><span className={`ao-badge ${order.status === "EXECUTED" ? "green" : order.status === "PENDING" ? "amber" : "gray"}`}>{labels[order.status] ?? order.status}</span></td><td>{date(order.orderedAt)}</td><td><button className="ao-link" aria-label={`주문 ${order.orderId} 상세`} onClick={() => open("transaction", order.orderId)}>보기 ↗</button></td></tr>)}</tbody></table></div>{!data.trades?.content.length && <div className="ao-empty">{loading ? "조회 중…" : data.trades ? "아직 접수된 주문이 없습니다." : "거래 내역을 불러오지 못했습니다."}</div>}</section>
    </div>;
}
