"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

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
  const color = label.includes("완료") || label === "활성" ? "bg-emerald-500/15 text-emerald-400" : label.includes("대기") ? "bg-amber-500/15 text-amber-400" : label.includes("거절") || label === "정지" || label === "취소" ? "bg-red-500/15 text-red-400" : "bg-zinc-500/20 text-zinc-400";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-white/8 bg-[#101010] ${className}`}>{children}</section>;
}

function StatCard({ label, value, change, tone = "green" }: { label: string; value: string; change?: string; tone?: "green" | "red" }) {
  return <Card className="min-w-0 p-5"><p className="text-sm text-zinc-500">{label}</p><div className="mt-3 flex items-end justify-between gap-2"><strong className="truncate text-2xl font-semibold">{value}</strong>{change && <span className={`text-xs ${tone === "green" ? "text-emerald-400" : "text-red-400"}`}>{change}</span>}</div></Card>;
}

function Login({ onLogin }: { onLogin: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); onLogin(); };
  return <main className="min-h-screen bg-[#f2f4f6] text-zinc-950">
    <header className="flex h-16 items-center justify-between bg-black px-6 lg:px-10"><img src="/Logo.png" alt="AI STOCK" className="h-11 w-auto" /><span className="text-sm font-semibold text-white">관리자 전용</span></header>
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-12">
      <form onSubmit={submit} className="w-full max-w-[440px] rounded-2xl bg-white px-8 py-10 shadow-[0_16px_50px_rgba(0,0,0,.08)]">
        <h1 className="text-center text-2xl font-bold">관리자 로그인</h1><p className="mt-2 text-center text-sm text-zinc-500">관리자 계정으로 로그인해 주세요.</p>
        <label className="mt-8 block text-sm font-semibold">아이디<input required defaultValue="admin" className="mt-2 h-12 w-full rounded-lg border border-zinc-200 px-4 font-normal outline-none focus:border-zinc-900" /></label>
        <label className="mt-5 block text-sm font-semibold">비밀번호<input required type="password" defaultValue="admin1234" className="mt-2 h-12 w-full rounded-lg border border-zinc-200 px-4 font-normal outline-none focus:border-zinc-900" /></label>
        <button className="mt-7 h-12 w-full rounded-lg bg-black font-bold text-white hover:bg-zinc-800">로그인</button>
        <a href="/home" className="mt-6 block text-center text-sm text-zinc-500 hover:text-black">&lt; 뒤로가기</a>
      </form>
    </div>
  </main>;
}

function Shell({ section, setSection, logout, children }: { section: Section; setSection: (v: Section) => void; logout: () => void; children: ReactNode }) {
  const [title, subtitle] = sectionMeta[section];
  const nav: [Section, string, string][] = [["dashboard", "▦", "대시보드"], ["transactions", "↔", "거래 내역"], ["accounts", "▣", "가상계좌 관리"], ["users", "♙", "회원 관리"]];
  return <div className="min-h-screen bg-[#191919] text-zinc-100 lg:flex">
    <aside className="border-b border-white/8 bg-[#090909] lg:fixed lg:inset-y-0 lg:w-[264px] lg:border-b-0 lg:border-r">
      <div className="flex h-20 items-center px-6"><img src="/Logo.png" alt="AI STOCK" className="h-11 w-auto" /></div>
      <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-2 lg:px-4 lg:pb-0">
        {nav.map(([key, icon, label]) => <button key={key} onClick={() => setSection(key)} className={`flex min-w-max items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition lg:w-full ${section === key ? "bg-white text-black" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</button>)}
      </nav>
      <div className="hidden border-t border-white/8 p-5 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block"><p className="font-semibold">관리자</p><p className="mt-1 text-xs text-zinc-600">admin@aistock.kr</p></div>
    </aside>
    <div className="min-w-0 flex-1 lg:ml-[264px]">
      <header className="sticky top-0 z-20 flex min-h-20 flex-wrap items-center gap-4 border-b border-white/8 bg-[#090909]/95 px-5 py-4 backdrop-blur lg:px-8"><div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold">{title} <span className="ml-2 text-xs font-normal text-zinc-600">{subtitle}</span></h1></div><input aria-label="전체 검색" placeholder="검색어를 입력하세요" className="hidden h-10 w-52 rounded-lg border border-white/10 bg-[#151515] px-4 text-sm outline-none placeholder:text-zinc-600 focus:border-zinc-500 md:block" /><span className="text-sm text-zinc-400">관리자님</span><button onClick={logout} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white">로그아웃</button></header>
      <main className="p-5 lg:p-8">{children}</main>
    </div>
  </div>;
}

function Dashboard({ open, go }: { open: (detail: Detail) => void; go: (section: Section) => void }) {
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="총 사용자" value="1,284" change="+12%" /><StatCard label="활성 거래" value="452" change="-3%" tone="red" /><StatCard label="총 거래량" value="₩124억" change="+24%" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]"><Card className="p-5"><div className="flex items-center justify-between"><h2 className="font-bold">거래량 추이</h2><span className="text-xs text-zinc-600">최근 7일</span></div><div className="relative mt-8 h-56 overflow-hidden border-b border-l border-white/10"><div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_24%,rgba(255,255,255,.04)_25%,transparent_26%,transparent_49%,rgba(255,255,255,.04)_50%,transparent_51%,transparent_74%,rgba(255,255,255,.04)_75%,transparent_76%)]"/><svg viewBox="0 0 700 220" className="absolute inset-0 h-full w-full" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs><path d="M0 175 C70 165 95 110 160 125 S255 155 315 90 S410 145 470 75 S585 100 700 25 V220 H0Z" fill="url(#chartFill)"/><path d="M0 175 C70 165 95 110 160 125 S255 155 315 90 S410 145 470 75 S585 100 700 25" fill="none" stroke="white" strokeWidth="3"/></svg></div><div className="mt-3 flex justify-between text-xs text-zinc-600"><span>07.14</span><span>07.16</span><span>07.18</span><span>07.20</span></div></Card>
      <Card className="p-5"><h2 className="font-bold">최근 활동</h2><div className="mt-5 space-y-5">{[["신규 회원 가입", "김철수님이 가입했습니다.", "3분 전"], ["거래 체결", "SK하이닉스 매도 체결", "8분 전"], ["캐시 충전 요청", "박지성 · ₩100,000,000", "14분 전"], ["계정 상태 변경", "USR-10282 계정 정지", "32분 전"]].map(([a,b,c]) => <div key={a} className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-white"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{a}</p><p className="truncate text-xs text-zinc-500">{b}</p></div><span className="text-xs text-zinc-600">{c}</span></div>)}</div></Card></div>
    <Card><div className="flex items-center justify-between border-b border-white/8 p-5"><h2 className="font-bold">캐시 충전 요청</h2><button onClick={() => go("accounts")} className="text-xs text-zinc-500 hover:text-white">전체보기 →</button></div><Table head={["요청번호", "사용자", "요청 금액", "요청 시간", "상태", "관리"]}>{cashRequests.slice(0,3).map(r => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td strong>{r.amount}</Td><Td>{r.requested}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"account", id:r.id})}>심사</Action></Td></tr>)}</Table></Card>
    <Card><div className="flex items-center justify-between border-b border-white/8 p-5"><h2 className="font-bold">최근 거래</h2><button onClick={() => go("transactions")} className="text-xs text-zinc-500 hover:text-white">전체보기 →</button></div><Table head={["거래번호", "사용자", "구분", "종목", "거래금액", "상태"]}>{transactions.slice(0,4).map(r => <tr key={r.id} onClick={() => open({kind:"transaction", id:r.id})} className="cursor-pointer"><Td>{r.id}</Td><Td>{r.user}</Td><Td><span className={r.type === "매수" ? "text-red-400" : "text-blue-400"}>{r.type}</span></Td><Td strong>{r.stock}</Td><Td>{r.amount}</Td><Td><Status>{r.status}</Status></Td></tr>)}</Table></Card>
  </div>;
}

function Table({ head, children }: { head: string[]; children: ReactNode }) { return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-white/[.025] text-xs text-zinc-500"><tr>{head.map(x => <th key={x} className="px-5 py-4 font-medium">{x}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{children}</tbody></table></div>; }
function Td({ children, strong = false }: { children: ReactNode; strong?: boolean }) { return <td className={`whitespace-nowrap px-5 py-4 ${strong ? "font-semibold text-white" : "text-zinc-400"}`}>{children}</td>; }
function Action({ children, onClick, danger = false }: { children: ReactNode; onClick?: () => void; danger?: boolean }) { return <button onClick={onClick} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${danger ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-white/15 text-zinc-300 hover:bg-white/5"}`}>{children}</button>; }

function Transactions({ open }: { open: (d: Detail) => void }) {
  const [filter, setFilter] = useState("전체");
  const rows = filter === "전체" ? transactions : transactions.filter(r => filter === "대기중" ? r.status === "승인 대기" : r.type === filter);
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><StatCard label="오늘의 거래량" value="1,284건" change="+8.2%"/><StatCard label="총 거래 대금" value="₩45,210,000" change="+13.5%"/><StatCard label="대기중인 승인" value="12건" change="확인 필요" tone="red"/></div><Card><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 p-5"><div className="flex gap-2">{["전체","매수","매도","대기중"].map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-4 py-2 text-xs font-semibold ${filter === x ? "bg-white text-black" : "bg-white/5 text-zinc-500"}`}>{x}</button>)}</div><input placeholder="거래번호 또는 사용자 검색" className="h-9 rounded-lg border border-white/10 bg-transparent px-3 text-xs outline-none"/></div><Table head={["거래번호", "사용자", "구분", "종목", "수량", "거래금액", "상태", "관리"]}>{rows.map((r,i) => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td><span className={r.type === "매수" ? "text-red-400" : "text-blue-400"}>{r.type}</span></Td><Td strong>{r.stock}</Td><Td>{[24,50,15,30,20,10][i] ?? 10}주</Td><Td>{r.amount}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"transaction",id:r.id})}>상세</Action></Td></tr>)}</Table></Card></div>;
}

function Accounts({ open }: { open: (d: Detail) => void }) {
  const [filter,setFilter] = useState("전체"); const rows = filter === "전체" ? cashRequests : cashRequests.filter(r => r.status === filter);
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><StatCard label="오늘 충전 요청" value="18건" change="+4건"/><StatCard label="대기중인 요청" value="7건" change="심사 필요" tone="red"/><StatCard label="오늘 충전 금액" value="₩128,500,000" change="+21.4%"/></div><Card><div className="flex flex-wrap items-center gap-2 border-b border-white/8 p-5">{["전체","승인 대기","충전 완료","충전 거절"].map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-4 py-2 text-xs font-semibold ${filter===x?"bg-white text-black":"bg-white/5 text-zinc-500"}`}>{x}</button>)}<input placeholder="요청번호 또는 사용자 검색" className="ml-auto h-9 rounded-lg border border-white/10 bg-transparent px-3 text-xs outline-none"/></div><Table head={["요청번호","사용자","입금 계좌","요청 금액","요청 시간","상태","관리"]}>{rows.map(r => <tr key={r.id}><Td>{r.id}</Td><Td>{r.user}</Td><Td>{r.bank}</Td><Td strong>{r.amount}</Td><Td>{r.requested}</Td><Td><Status>{r.status}</Status></Td><Td><Action onClick={() => open({kind:"account",id:r.id})}>{r.status === "승인 대기" ? "심사" : "상세"}</Action></Td></tr>)}</Table></Card></div>;
}

function Users({ open }: { open: (d: Detail) => void }) {
  const [query,setQuery]=useState(""); const [status,setStatus]=useState("전체 상태");
  const rows=useMemo(()=>users.filter(u=>(!query || `${u.name}${u.email}${u.id}`.toLowerCase().includes(query.toLowerCase())) && (status==="전체 상태"||u.status===status)),[query,status]);
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><StatCard label="총 사용자" value="1,280" change="+12명"/><StatCard label="활성 세션" value="42" change="현재 접속"/><StatCard label="불량행위 탐지" value="2건" change="확인 필요" tone="red"/></div><Card><div className="grid gap-3 border-b border-white/8 p-5 md:grid-cols-[1fr_180px_220px]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름, 이메일 또는 회원번호" className="h-10 rounded-lg border border-white/10 bg-transparent px-4 text-sm outline-none"/><select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-[#101010] px-3 text-sm text-zinc-400"><option>전체 상태</option><option>활성</option><option>정지</option><option>휴면</option></select><input type="date" aria-label="가입일" className="h-10 rounded-lg border border-white/10 bg-transparent px-3 text-sm text-zinc-500"/></div><Table head={["회원번호","이름","이메일","가입일","보유 캐시","계정 상태","관리"]}>{rows.map(u=><tr key={u.id}><Td>{u.id}</Td><Td strong>{u.name}</Td><Td>{u.email}</Td><Td>{u.joined}</Td><Td>{u.balance}</Td><Td><Status>{u.status}</Status></Td><Td><Action onClick={()=>open({kind:"user",id:u.id})}>상세</Action></Td></tr>)}</Table>{rows.length===0&&<p className="py-16 text-center text-sm text-zinc-600">검색 결과가 없습니다.</p>}</Card></div>;
}

function DetailPage({ detail, back }: { detail: NonNullable<Detail>; back: () => void }) {
  const [result,setResult]=useState<null|"approved"|"rejected"|"suspended"|"activated">(null);
  if (detail.kind === "account") {
    const r=cashRequests.find(x=>x.id===detail.id)??cashRequests[0];
    if(result) return <Result title={result==="approved"?"캐시 충전 승인":"캐시 충전 거절"} message={`요청 ${r.id} · ${r.user}님의 충전 요청이 ${result==="approved"?"승인":"거절"}되었습니다.`} success={result==="approved"} back={back}>{result==="rejected"&&<div className="mt-5 rounded-lg bg-red-500/10 p-4 text-left text-sm text-red-300"><b>거절 사유</b><p className="mt-2 text-zinc-400">누적 지급액 한도 초과 (₩200,000,000). 계정 정지 이력이 존재합니다.</p></div>}</Result>;
    return <div><Crumb text={`가상계좌 관리 > 충전 요청 > ${r.id} 심사`} back={back}/><h2 className="mb-5 text-xl font-bold">캐시 충전 요청 심사</h2><div className="grid gap-5 xl:grid-cols-2"><InfoCard title="요청 정보" items={[["요청번호",r.id],["요청자",r.user],["입금 계좌",r.bank],["요청 일시",r.requested]]}/><InfoCard title="충전 정보" items={[["요청 금액",r.amount],["현재 잔액","₩0"],["누적 충전액","₩200,000,000"],["계정 상태","정지 이력 1회"]]}/></div><Card className="mt-5 p-6"><h3 className="font-bold">입금 확인 및 처리</h3><p className="mt-2 text-sm text-zinc-500">입금 내역과 요청 정보를 확인한 뒤 처리해 주세요. 처리 후에는 되돌릴 수 없습니다.</p><textarea placeholder="거절 시 사유를 입력하세요." className="mt-5 h-24 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-sm outline-none"/><div className="mt-4 flex justify-end gap-3"><button onClick={()=>setResult("rejected")} className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400">충전 거절</button><button onClick={()=>setResult("approved")} className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black">충전 승인</button></div></Card></div>;
  }
  if(detail.kind==="transaction") { const r=transactions.find(x=>x.id===detail.id)??transactions[0]; return <div><Crumb text={`거래 관리 > ${r.id}`} back={back}/><h2 className="mb-5 text-xl font-bold">거래 상세</h2><div className="grid gap-5 xl:grid-cols-2"><InfoCard title="거래 정보" items={[["거래번호",r.id],["거래 구분",r.type],["종목",r.stock],["거래 금액",r.amount],["거래 일시",r.date],["처리 상태",r.status]]}/><InfoCard title="주문자 정보" items={[["이름",r.user],["회원번호","USR-10283"],["이메일","younghee.lee@email.com"],["보유 캐시","₩8,320,000"],["계정 상태","활성"]]}/></div><Card className="mt-5 p-6"><h3 className="font-bold">처리 이력</h3><div className="mt-6 border-l border-white/15 pl-6">{[["주문 접수","2026.07.20 14:31:42"],["거래 승인","2026.07.20 14:31:58"],["체결 완료","2026.07.20 14:32:03"]].map(([a,b])=><div key={a} className="relative mb-6 last:mb-0"><span className="absolute -left-[29px] top-1 h-2 w-2 rounded-full bg-white"/><p className="text-sm font-semibold">{a}</p><p className="mt-1 text-xs text-zinc-600">{b}</p></div>)}</div></Card></div>; }
  const u=users.find(x=>x.id===detail.id)??users[0]; if(result) return <Result title={result==="suspended"?"계정 정지 완료":"계정 활성화 완료"} message={`${u.name}님의 계정 상태가 변경되었습니다.`} success={result==="activated"} back={back}/>;
  return <div><Crumb text={`회원 관리 > ${u.id}`} back={back}/><h2 className="mb-5 text-xl font-bold">회원 상세 정보</h2><div className="grid gap-5 xl:grid-cols-2"><InfoCard title="기본 정보" items={[["회원번호",u.id],["이름",u.name],["이메일",u.email],["가입일",u.joined],["계정 상태",u.status]]}/><InfoCard title="자산 및 활동" items={[["보유 캐시",u.balance],["보유 종목","7종목"],["누적 거래","128건"],["최근 접속","2026.07.20 14:22"],["신고 이력","0건"]]}/></div><Card className="mt-5 p-6"><h3 className="font-bold">계정 관리</h3><p className="mt-2 text-sm text-zinc-500">정지된 계정은 로그인과 신규 거래가 제한됩니다.</p><div className="mt-5 flex gap-3">{u.status==="정지"?<button onClick={()=>setResult("activated")} className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black">계정 활성화</button>:<button onClick={()=>setResult("suspended")} className="rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-semibold text-red-400">계정 정지</button>}</div></Card></div>;
}

function Crumb({text,back}:{text:string;back:()=>void}){return <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-600">{text}</p><button onClick={back} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400">← 목록으로</button></div>}
function InfoCard({title,items}:{title:string;items:string[][]}){return <Card className="p-6"><h3 className="border-b border-white/8 pb-4 font-bold">{title}</h3><dl className="mt-2">{items.map(([k,v])=><div key={k} className="grid grid-cols-[120px_1fr] gap-4 border-b border-white/5 py-4 last:border-0"><dt className="text-sm text-zinc-600">{k}</dt><dd className="text-sm font-medium text-zinc-200">{v}</dd></div>)}</dl></Card>}
function Result({title,message,success,back,children}:{title:string;message:string;success:boolean;back:()=>void;children?:ReactNode}){return <div><Crumb text={`${title} 완료`} back={back}/><Card className="mx-auto max-w-2xl px-8 py-14 text-center"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${success?"bg-emerald-500/15 text-emerald-400":"bg-red-500/15 text-red-400"}`}>{success?"✓":"×"}</div><h2 className="mt-6 text-2xl font-bold">{title}</h2><p className="mt-3 text-sm text-zinc-500">{message}</p><div className="mt-8 grid grid-cols-2 gap-3 rounded-lg bg-black/30 p-4 text-left text-sm"><span className="text-zinc-600">요청자</span><b>박지성</b><span className="text-zinc-600">요청 금액</span><b>₩100,000,000</b><span className="text-zinc-600">현재 잔액</span><b>₩0</b><span className="text-zinc-600">누적 지급액</span><b>₩200,000,000</b></div>{children}<button onClick={back} className={`mt-7 rounded-lg px-6 py-3 text-sm font-bold ${success?"bg-white text-black":"bg-red-500 text-white"}`}>목록으로 돌아가기</button></Card></div>}

export default function AdminApp(){ const [authenticated,setAuthenticated]=useState(false); const [section,setSection]=useState<Section>("dashboard"); const [detail,setDetail]=useState<Detail>(null); if(!authenticated)return <Login onLogin={()=>setAuthenticated(true)}/>; const change=(s:Section)=>{setSection(s);setDetail(null)}; return <Shell section={section} setSection={change} logout={()=>{setAuthenticated(false);setDetail(null)}}>{detail?<DetailPage detail={detail} back={()=>setDetail(null)}/>:section==="dashboard"?<Dashboard open={setDetail} go={change}/>:section==="transactions"?<Transactions open={setDetail}/>:section==="accounts"?<Accounts open={setDetail}/>:<Users open={setDetail}/>}</Shell>}
