"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { CheckIcon, CloseIcon, DashboardIcon, SwapIcon, WalletIcon, UsersGroupIcon, ChevronLeftIcon, ChevronRightSmallIcon } from "@/components/icons/Icon";
import type { ReactElement } from "react";

type Section = "dashboard" | "transactions" | "accounts" | "users";
type Detail = { kind: "transaction" | "account" | "user"; id: string } | null;

const transactions = [
  { id: "TX-90822", user: "이영희", type: "매도", stock: "SK하이닉스", amount: "₩7,440,000", status: "체결 완료", date: "2026.07.20 14:32" },
  { id: "TX-90821", user: "김철수", type: "매수", stock: "삼성전자", amount: "₩2,184,000", status: "승인 대기", date: "2026.07.20 14:28" },
  { id: "TX-90820", user: "박지성", type: "매수", stock: "NAVER", amount: "₩1,725,000", status: "체결 완료", date: "2026.07.20 14:05" },
  { id: "TX-90819", user: "최유진", type: "매도", stock: "카카오", amount: "₩945,000", status: "승인 대기", date: "2026.07.20 13:54" },
  { id: "TX-90818", user: "정민수", type: "매수", stock: "현대차", amount: "₩4,910,000", status: "승인 대기", date: "2026.07.20 13:42" },
  { id: "TX-90817", user: "한서연", type: "매도", stock: "LG에너지솔루션", amount: "₩3,620,000", status: "취소", date: "2026.07.20 13:31" },
];

const cashRequests = [
  { id: "CR-10043", user: "박지성", bank: "국민은행 302-****-1291", amount: "₩100,000,000", requested: "2026.07.20 13:42", status: "승인 대기" },
  { id: "CR-10042", user: "김철수", bank: "신한은행 110-****-8832", amount: "₩3,000,000", requested: "2026.07.20 12:18", status: "승인 대기" },
  { id: "CR-10041", user: "이영희", bank: "우리은행 1002-****-5621", amount: "₩5,500,000", requested: "2026.07.20 11:04", status: "충전 완료" },
  { id: "CR-10040", user: "최유진", bank: "하나은행 620-****-0027", amount: "₩1,000,000", requested: "2026.07.20 10:22", status: "충전 거절" },
];

const users = [
  { id: "USR-10284", name: "김철수", email: "chulsoo.kim@email.com", joined: "2026.06.12", balance: "₩12,450,000", status: "활성" },
  { id: "USR-10283", name: "이영희", email: "younghee.lee@email.com", joined: "2026.06.11", balance: "₩8,320,000", status: "활성" },
  { id: "USR-10282", name: "박지성", email: "jisung.park@email.com", joined: "2026.06.10", balance: "₩0", status: "정지" },
  { id: "USR-10281", name: "최유진", email: "yujin.choi@email.com", joined: "2026.06.09", balance: "₩3,770,000", status: "활성" },
  { id: "USR-10280", name: "정민수", email: "minsoo.jung@email.com", joined: "2026.06.08", balance: "₩1,920,000", status: "휴면" },
];

const sectionMeta: Record<Section, [string, string]> = {
  dashboard: ["메인 대시보드", "Dashboard Overview"],
  transactions: ["거래 관리 페이지", "Transactions"],
  accounts: ["가상계좌 관리 페이지", "Virtual Account"],
  users: ["사용자관리 페이지", "User Management"],
};

function Status({ children }: { children: ReactNode }) {
  const label = String(children);
  const color = label.includes("완료") || label === "활성" ? "bg-emerald-500/10 text-emerald-600" : label.includes("대기") ? "bg-amber-500/10 text-amber-600" : label.includes("거절") || label === "정지" || label === "취소" ? "bg-red-500/10 text-red-600" : "bg-surface-strong text-muted";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-hairline bg-white shadow-[0_1px_2px_rgba(10,11,13,.04)] ${className}`}>{children}</section>;
}

function StatCard({ label, value, change, tone = "green" }: { label: string; value: string; change?: string; tone?: "green" | "red" }) {
  return <Card className="min-w-0 p-4"><p className="text-xs text-muted">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><strong className="num truncate text-xl font-semibold text-ink">{value}</strong>{change && <span className={`num text-xs ${tone === "green" ? "text-emerald-600" : "text-red-600"}`}>{change}</span>}</div></Card>;
}

function Login({ onLogin }: { onLogin: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onLogin(); };
  return <main className="market-theme auth-shell min-h-screen text-ink">
    <header className="flex h-16 items-center border-b border-hairline bg-white px-6 lg:px-10"><img src="/Logo.png" alt="AI STOCK" className="h-11 w-auto" /><span className="ml-3 text-sm font-bold text-ink">관리자</span></header>
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
      <form onSubmit={submit} className="auth-card w-full max-w-[440px] rounded-3xl px-8 py-10">
        <h1 className="text-center text-2xl font-bold">관리자 로그인</h1>
        <label className="mt-8 block text-sm font-semibold">아이디<input required defaultValue="admin" className="mt-2 h-12 w-full rounded-lg border border-hairline px-4 font-normal outline-none focus:border-ink" /></label>
        <label className="mt-5 block text-sm font-semibold">비밀번호<input required type="password" defaultValue="admin1234" className="mt-2 h-12 w-full rounded-lg border border-hairline px-4 font-normal outline-none focus:border-ink" /></label>
        <button className="admin-button-primary mt-7 h-12 w-full rounded-xl font-bold">로그인</button>
        <a href="/home" className="mt-6 flex items-center justify-center gap-1 text-center text-sm text-body hover:text-ink"><ChevronLeftIcon className="h-3.5 w-3.5" /> 뒤로가기</a>
      </form>
    </div>
  </main>;
}

function Shell({ section, setSection, logout, children }: { section: Section; setSection: (v: Section) => void; logout: () => void; children: ReactNode }) {
  const [title, subtitle] = sectionMeta[section];
  const nav: [Section, ReactElement, string][] = [["dashboard", <DashboardIcon key="d" className="h-4 w-4" />, "대시보드"], ["transactions", <SwapIcon key="t" className="h-4 w-4" />, "거래 내역"], ["accounts", <WalletIcon key="a" className="h-4 w-4" />, "가상계좌 관리"], ["users", <UsersGroupIcon key="u" className="h-4 w-4" />, "회원 관리"]];
  return <div className="market-theme market-grid min-h-screen text-ink lg:flex">
    <aside className="border-b border-hairline bg-white lg:fixed lg:inset-y-0 lg:w-[264px] lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center px-6"><img src="/Logo.png" alt="AI STOCK" className="h-11 w-auto" /></div>
      <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1.5 lg:px-4 lg:pb-0">
        {nav.map(([key, icon, label]) => <button key={key} onClick={() => setSection(key)} className={`flex min-w-max items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition lg:w-full ${section === key ? "admin-button-primary" : "admin-button-secondary"}`}><span className="flex w-5 items-center justify-center">{icon}</span>{label}</button>)}
      </nav>
      <div className="hidden border-t border-hairline p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block"><p className="font-semibold">관리자</p><p className="mt-1 text-xs text-muted">admin@aistock.kr</p></div>
    </aside>
    <div className="min-w-0 flex-1 lg:ml-[264px]">
      <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center gap-4 border-b border-hairline bg-white/95 px-4 py-3 backdrop-blur lg:px-6"><div className="min-w-0 flex-1"><h1 className="truncate text-base font-bold">{title} <span className="ml-2 text-xs font-normal text-muted">{subtitle}</span></h1></div><input aria-label="전체 검색" placeholder="검색어를 입력하세요" className="hidden h-9 w-52 rounded-lg border border-hairline bg-surface-soft px-3.5 text-sm outline-none placeholder:text-muted focus:border-[var(--market-accent)] md:block" /><span className="text-sm text-body">관리자님</span><button onClick={logout} className="admin-button-secondary rounded-lg px-3 py-1.5 text-xs font-semibold">로그아웃</button></header>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  </div>;
}

function Dashboard({ open, go }: { open: (detail: Detail) => void; go: (section: Section) => void }) {
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3"><StatCard label="총 사용자" value="1,284" change="+12%" /><StatCard label="활성 거래" value="452" change="-3%" tone="red" /><StatCard label="총 거래량" value="₩124억" change="+24%" /></div>
    <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]"><Card className="p-4"><div className="flex items-center justify-between"><h2 className="font-bold">거래량 추이</h2><span className="text-xs text-muted">최근 7일</span></div><div className="relative mt-6 h-52 overflow-hidden border-b border-l border-hairline"><div className="admin-chart-grid absolute inset-0"/><svg viewBox="0 0 700 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-primary)" stopOpacity=".22"/><stop offset="1" stopColor="var(--chart-primary)" stopOpacity="0"/></linearGradient></defs><path d="M0 175 C70 165 95 110 160 125 S255 155 315 90 S410 145 470 75 S585 100 700 25 V220 H0Z" fill="url(#chartFill)"/><path d="M0 175 C70 165 95 110 160 125 S255 155 315 90 S410 145 470 75 S585 100 700 25" fill="none" stroke="var(--chart-primary)" strokeWidth="3"/></svg></div><div className="mt-2 flex justify-between text-xs text-muted"><span>07.14</span><span>07.16</span><span>07.18</span><span>07.20</span></div></Card>
      <Card className="p-4"><h2 className="font-bold">최근 활동</h2><div className="mt-3 space-y-3.5">{[["신규 회원 가입", "김철수님이 가입했습니다.", "3분 전"], ["거래 체결", "SK하이닉스 매도 체결", "8분 전"], ["캐시 충전 요청", "박지성 · ₩100,000,000", "14분 전"], ["계정 상태 변경", "USR-10282 계정 정지", "32분 전"]].map(([a,b,c]) => <div key={a} className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{a}</p><p className="truncate text-xs text-muted">{b}</p></div><span className="text-xs text-muted">{c}</span></div>)}</div></Card></div>
    <Card><div className="flex items-center justify-between border-b border-hairline p-4"><h2 className="font-bold">캐시 충전 요청</h2><button onClick={() => go("accounts")} className="admin-link-button flex items-center gap-0.5 text-xs font-semibold">전체보기 <ChevronRightSmallIcon className="h-3.5 w-3.5" /></button></div><Table head={["요청번호", "사용자", "요청 금액", "요청 시간", "상태", "관리"]}>{cashRequests.slice(0,3).map(r => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td strong num>{r.amount}</Td><Td>{r.requested}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"account", id:r.id})}>심사</Action></Td></tr>)}</Table></Card>
    <Card><div className="flex items-center justify-between border-b border-hairline p-4"><h2 className="font-bold">최근 거래</h2><button onClick={() => go("transactions")} className="admin-link-button flex items-center gap-0.5 text-xs font-semibold">전체보기 <ChevronRightSmallIcon className="h-3.5 w-3.5" /></button></div><Table head={["거래번호", "사용자", "구분", "종목", "거래금액", "상태"]}>{transactions.slice(0,4).map(r => <tr key={r.id} onClick={() => open({kind:"transaction", id:r.id})} className="cursor-pointer"><Td>{r.id}</Td><Td>{r.user}</Td><Td><span className={r.type === "매수" ? "text-up" : "text-down"}>{r.type}</span></Td><Td strong>{r.stock}</Td><Td num>{r.amount}</Td><Td><Status>{r.status}</Status></Td></tr>)}</Table></Card>
  </div>;
}

function Table({ head, children }: { head: string[]; children: ReactNode }) { return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface-soft text-xs text-muted"><tr>{head.map(x => <th key={x} className="px-4 py-2 font-medium">{x}</th>)}</tr></thead><tbody className="divide-y divide-hairline">{children}</tbody></table></div>; }
function Td({ children, strong = false, num = false }: { children: ReactNode; strong?: boolean; num?: boolean }) { return <td className={`whitespace-nowrap px-4 py-2 ${strong ? "font-semibold text-ink" : "text-body"} ${num ? "num text-right" : ""}`}>{children}</td>; }
function Action({ children, onClick, danger = false }: { children: ReactNode; onClick?: () => void; danger?: boolean }) { return <button onClick={onClick} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${danger ? "border border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/20" : "admin-button-secondary"}`}>{children}</button>; }

function Transactions({ open }: { open: (d: Detail) => void }) {
  const [filter, setFilter] = useState("전체");
  const rows = filter === "전체" ? transactions : transactions.filter(r => filter === "대기중" ? r.status === "승인 대기" : r.type === filter);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><StatCard label="오늘의 거래량" value="1,284건" change="+8.2%"/><StatCard label="총 거래 대금" value="₩45,210,000" change="+13.5%"/><StatCard label="대기중인 승인" value="12건" change="확인 필요" tone="red"/></div><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-4"><div className="flex gap-2">{["전체","매수","매도","대기중"].map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${filter === x ? "admin-filter-button-active" : "admin-filter-button"}`}>{x}</button>)}</div><input placeholder="거래번호 또는 사용자 검색" className="h-9 rounded-lg border border-hairline bg-transparent px-3 text-xs outline-none"/></div><Table head={["거래번호", "사용자", "구분", "종목", "수량", "거래금액", "상태", "관리"]}>{rows.map((r,i) => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td><span className={r.type === "매수" ? "text-up" : "text-down"}>{r.type}</span></Td><Td strong>{r.stock}</Td><Td num>{[24,50,15,30,20,10][i] ?? 10}주</Td><Td num>{r.amount}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"transaction",id:r.id})}>상세</Action></Td></tr>)}</Table></Card></div>;
}

function Accounts({ open }: { open: (d: Detail) => void }) {
  const [filter,setFilter] = useState("전체"); const rows = filter === "전체" ? cashRequests : cashRequests.filter(r => r.status === filter);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><StatCard label="오늘 충전 요청" value="18건" change="+4건"/><StatCard label="대기중인 요청" value="7건" change="심사 필요" tone="red"/><StatCard label="오늘 충전 금액" value="₩128,500,000" change="+21.4%"/></div><Card><div className="flex flex-wrap items-center gap-2 border-b border-hairline p-4">{["전체","승인 대기","충전 완료","충전 거절"].map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${filter===x?"admin-filter-button-active":"admin-filter-button"}`}>{x}</button>)}<input placeholder="요청번호 또는 사용자 검색" className="ml-auto h-9 rounded-lg border border-hairline bg-transparent px-3 text-xs outline-none"/></div><Table head={["요청번호","사용자","입금 계좌","요청 금액","요청 시간","상태","관리"]}>{rows.map(r => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td>{r.bank}</Td><Td strong num>{r.amount}</Td><Td>{r.requested}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"account",id:r.id})}>{r.status === "승인 대기" ? "심사" : "상세"}</Action></Td></tr>)}</Table></Card></div>;
}

function Users({ open }: { open: (d: Detail) => void }) {
  const [query,setQuery]=useState(""); const [status,setStatus]=useState("전체 상태");
  const rows=useMemo(()=>users.filter(u=>(!query || `${u.name}${u.email}${u.id}`.toLowerCase().includes(query.toLowerCase())) && (status==="전체 상태"||u.status===status)),[query,status]);
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><StatCard label="총 사용자" value="1,280" change="+12명"/><StatCard label="활성 세션" value="42" change="현재 접속"/><StatCard label="불량행위 탐지" value="2건" change="확인 필요" tone="red"/></div><Card><div className="grid gap-3 border-b border-hairline p-4 md:grid-cols-[1fr_180px_220px]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름, 이메일 또는 회원번호" className="h-9 rounded-lg border border-hairline bg-transparent px-3.5 text-sm outline-none"/><select value={status} onChange={e=>setStatus(e.target.value)} className="h-9 rounded-lg border border-hairline bg-white px-3 text-sm text-body"><option>전체 상태</option><option>활성</option><option>정지</option><option>휴면</option></select><input type="date" aria-label="가입일" className="h-9 rounded-lg border border-hairline bg-transparent px-3 text-sm text-body"/></div><Table head={["회원번호","이름","이메일","가입일","보유 캐시","계정 상태","관리"]}>{rows.map(u=><tr key={u.id}><Td>{u.id}</Td><Td strong>{u.name}</Td><Td>{u.email}</Td><Td>{u.joined}</Td><Td num>{u.balance}</Td><Td><Status>{u.status}</Status></Td><Td><Action onClick={()=>open({kind:"user",id:u.id})}>상세</Action></Td></tr>)}</Table>{rows.length===0&&<p className="py-12 text-center text-sm text-muted">검색 결과가 없습니다.</p>}</Card></div>;
}

function DetailPage({ detail, back }: { detail: NonNullable<Detail>; back: () => void }) {
  const [result,setResult]=useState<null|"approved"|"rejected"|"suspended"|"activated">(null);
  if (detail.kind === "account") {
    const r=cashRequests.find(x=>x.id===detail.id)??cashRequests[0];
    if(result) return <Result title={result==="approved"?"캐시 충전 승인":"캐시 충전 거절"} message={`요청 ${r.id} · ${r.user}님의 충전 요청이 ${result==="approved"?"승인":"거절"}되었습니다.`} success={result==="approved"} back={back}>{result==="rejected"&&<div className="mt-4 rounded-lg bg-red-500/10 p-3.5 text-left text-sm text-red-600"><b>거절 사유</b><p className="mt-2 text-body">누적 지급액 한도 초과 (₩200,000,000). 계정 정지 이력이 존재합니다.</p></div>}</Result>;
    return <div><Crumb text={`가상계좌 관리 > 충전 요청 > ${r.id} 심사`} back={back}/><h2 className="mb-4 text-lg font-bold">캐시 충전 요청 심사</h2><div className="grid gap-3 xl:grid-cols-2"><InfoCard title="요청 정보" items={[["요청번호",r.id],["요청자",r.user],["입금 계좌",r.bank],["요청 일시",r.requested]]}/><InfoCard title="충전 정보" items={[["요청 금액",r.amount],["현재 잔액","₩0"],["누적 충전액","₩200,000,000"],["계정 상태","정지 이력 1회"]]}/></div><Card className="mt-3 p-4"><h3 className="font-bold">입금 확인 및 처리</h3><p className="mt-2 text-sm text-body">입금 내역과 요청 정보를 확인한 뒤 처리해 주세요. 처리 후에는 되돌릴 수 없습니다.</p><textarea placeholder="거절 시 사유를 입력하세요." className="mt-4 h-24 w-full resize-none rounded-lg border border-hairline bg-surface-soft p-3 text-sm outline-none"/><div className="mt-3 flex justify-end gap-3"><button onClick={()=>setResult("rejected")} className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20">충전 거절</button><button onClick={()=>setResult("approved")} className="admin-button-primary rounded-lg px-4 py-2 text-sm font-bold">충전 승인</button></div></Card></div>;
  }
  if(detail.kind==="transaction") { const r=transactions.find(x=>x.id===detail.id)??transactions[0]; return <div><Crumb text={`거래 관리 > ${r.id}`} back={back}/><h2 className="mb-4 text-lg font-bold">거래 상세</h2><div className="grid gap-3 xl:grid-cols-2"><InfoCard title="거래 정보" items={[["거래번호",r.id],["거래 구분",r.type],["종목",r.stock],["거래 금액",r.amount],["거래 일시",r.date],["처리 상태",r.status]]}/><InfoCard title="주문자 정보" items={[["이름",r.user],["회원번호","USR-10283"],["이메일","younghee.lee@email.com"],["보유 캐시","₩8,320,000"],["계정 상태","활성"]]}/></div><Card className="mt-3 p-4"><h3 className="font-bold">처리 이력</h3><div className="mt-4 border-l border-hairline pl-5">{[["주문 접수","2026.07.20 14:31:42"],["거래 승인","2026.07.20 14:31:58"],["체결 완료","2026.07.20 14:32:03"]].map(([a,b])=><div key={a} className="relative mb-4 last:mb-0"><span className="absolute -left-[25px] top-1 h-2 w-2 rounded-full bg-primary"/><p className="text-sm font-semibold text-ink">{a}</p><p className="mt-1 text-xs text-muted">{b}</p></div>)}</div></Card></div>; }
  const u=users.find(x=>x.id===detail.id)??users[0]; if(result) return <Result title={result==="suspended"?"계정 정지 완료":"계정 활성화 완료"} message={`${u.name}님의 계정 상태가 변경되었습니다.`} success={result==="activated"} back={back}/>;
  return <div><Crumb text={`회원 관리 > ${u.id}`} back={back}/><h2 className="mb-4 text-lg font-bold">회원 상세 정보</h2><div className="grid gap-3 xl:grid-cols-2"><InfoCard title="기본 정보" items={[["회원번호",u.id],["이름",u.name],["이메일",u.email],["가입일",u.joined],["계정 상태",u.status]]}/><InfoCard title="자산 및 활동" items={[["보유 캐시",u.balance],["보유 종목","7종목"],["누적 거래","128건"],["최근 접속","2026.07.20 14:22"],["신고 이력","0건"]]}/></div><Card className="mt-3 p-4"><h3 className="font-bold">계정 관리</h3><p className="mt-2 text-sm text-body">정지된 계정은 로그인과 신규 거래가 제한됩니다.</p><div className="mt-4 flex gap-3">{u.status==="정지"?<button onClick={()=>setResult("activated")} className="admin-button-primary rounded-lg px-4 py-2 text-sm font-bold">계정 활성화</button>:<button onClick={()=>setResult("suspended")} className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20">계정 정지</button>}</div></Card></div>;
}

function Crumb({text,back}:{text:string;back:()=>void}){return <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">{text}</p><button onClick={back} className="admin-button-secondary flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold"><ChevronLeftIcon className="h-3.5 w-3.5" /> 목록으로</button></div>}
function InfoCard({title,items}:{title:string;items:string[][]}){return <Card className="p-4"><h3 className="border-b border-hairline pb-3 font-bold">{title}</h3><dl className="mt-1">{items.map(([k,v])=><div key={k} className="grid grid-cols-[120px_1fr] gap-4 border-b border-hairline-soft py-2.5 last:border-0"><dt className="text-sm text-muted">{k}</dt><dd className="text-sm font-medium text-ink">{v}</dd></div>)}</dl></Card>}
function Result({title,message,success,back,children}:{title:string;message:string;success:boolean;back:()=>void;children?:ReactNode}){return <div><Crumb text={`${title} 완료`} back={back}/><Card className="mx-auto max-w-2xl px-6 py-10 text-center"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${success?"bg-emerald-500/10 text-emerald-600":"bg-red-500/10 text-red-600"}`}>{success?<CheckIcon className="h-6 w-6"/>:<CloseIcon className="h-6 w-6"/>}</div><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mt-2 text-sm text-body">{message}</p><div className="mt-6 grid grid-cols-2 gap-2.5 rounded-lg bg-surface-soft p-3.5 text-left text-sm"><span className="text-muted">요청자</span><b>박지성</b><span className="text-muted">요청 금액</span><b className="num">₩100,000,000</b><span className="text-muted">현재 잔액</span><b className="num">₩0</b><span className="text-muted">누적 지급액</span><b className="num">₩200,000,000</b></div>{children}<button onClick={back} className={`mt-6 rounded-lg px-5 py-2.5 text-sm font-bold ${success?"admin-button-primary":"bg-red-500 text-white hover:bg-red-600"}`}>목록으로 돌아가기</button></Card></div>}

export default function AdminApp(){ const [authenticated,setAuthenticated]=useState(false); const [section,setSection]=useState<Section>("dashboard"); const [detail,setDetail]=useState<Detail>(null); if(!authenticated)return <Login onLogin={()=>setAuthenticated(true)}/>; const change=(s:Section)=>{setSection(s);setDetail(null)}; return <Shell section={section} setSection={change} logout={()=>{setAuthenticated(false);setDetail(null)}}>{detail?<DetailPage detail={detail} back={()=>setDetail(null)}/>:section==="dashboard"?<Dashboard open={setDetail} go={change}/>:section==="transactions"?<Transactions open={setDetail}/>:section==="accounts"?<Accounts open={setDetail}/>:<Users open={setDetail}/>}</Shell>}
