"use client";

import { useMemo, useState } from "react";
import { EmptyPortfolioIcon } from "@/components/icons/Icon";

type MyPageTab = "profile" | "account" | "orders" | "returns";
type AccountView = "summary" | "recharge" | "reason" | "history" | "detail";
type RechargeStatus = "승인" | "거절";

type RechargeRecord = {
  id: number;
  date: string;
  type: string;
  amount: number;
  balance: number;
  status: RechargeStatus;
  requester: string;
  note: string;
};

const navItems: { id: MyPageTab; label: string }[] = [
  { id: "profile", label: "내 정보" },
  { id: "account", label: "계좌관리" },
  { id: "orders", label: "주문내역" },
  { id: "returns", label: "수익률" },
];

const initialProfile = {
  userId: "jin050183",
  password: "**********",
  name: "김진우",
  birthday: "2000.05.01",
  email: "jin0501833@naver.com",
  investmentProfile: "적극투자형",
  fundProfile: "수익추구형",
  investmentLevel: "숙련 투자자",
};

const rechargeAmounts = [
  10_000_000,
  30_000_000,
  50_000_000,
  80_000_000,
  100_000_000,
  200_000_000,
  500_000_000,
  1_000_000_000,
];

const rechargeHistory: RechargeRecord[] = [
  {
    id: 1,
    date: "2023.10.27 14:35",
    type: "추가 충전",
    amount: 100_000_000,
    balance: 200_000_000,
    status: "승인",
    requester: "김철수",
    note: "학습 목적 정당 요청. 거래 패턴 정상, 수익률 양호. 승인 처리.",
  },
  {
    id: 2,
    date: "2023.10.27 14:35",
    type: "추가 충전",
    amount: 100_000_000,
    balance: 100_000_000,
    status: "거절",
    requester: "박지성",
    note: "누적 지급액 한도 초과 (₩200,000,000). 계정 정지 이력 존재.",
  },
  {
    id: 3,
    date: "2023.10.27 14:35",
    type: "추가 충전",
    amount: 500_000_000,
    balance: 100_000_000,
    status: "거절",
    requester: "김진우",
    note: "누적 지급액 한도를 확인해 주세요.",
  },
  {
    id: 4,
    date: "2023.10.27 14:35",
    type: "초기 지급",
    amount: 100_000_000,
    balance: 100_000_000,
    status: "승인",
    requester: "김진우",
    note: "초기 가상캐시 지급 완료.",
  },
];

const orders = [
  { id: 1, name: "삼성전자", side: "판매완료", quantity: "100주", price: "1,000,000원" },
  { id: 2, name: "삼성전자", side: "구매완료", quantity: "100주", price: "1,000,000원" },
  { id: 3, name: "SK하이닉스", side: "판매완료", quantity: "100주", price: "1,000,000원" },
  { id: 4, name: "SK하이닉스", side: "구매완료", quantity: "100주", price: "1,000,000원" },
];

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export default function MyPageDashboard() {
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const [accountView, setAccountView] = useState<AccountView>("summary");
  const [profile, setProfile] = useState(initialProfile);
  const [draftProfile, setDraftProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requestComplete, setRequestComplete] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RechargeRecord | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0].id);

  const requestedAmount = useMemo(
    () => selectedAmount ?? (Number(customAmount.replaceAll(",", "")) || 0),
    [customAmount, selectedAmount],
  );

  const changeTab = (tab: MyPageTab) => {
    setActiveTab(tab);
    if (tab === "account") setAccountView("summary");
  };

  const saveProfile = () => {
    setProfile(draftProfile);
    setIsEditing(false);
    setShowSaved(true);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#f2f4f6] text-[#111]">
      <aside className="hidden w-32 shrink-0 bg-white px-3 py-7 md:block lg:w-40">
        <nav aria-label="마이페이지 메뉴" className="flex flex-col gap-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`cursor-pointer text-left text-sm font-bold transition-colors lg:text-base ${
                activeTab === item.id ? "text-black" : "text-[#6e6f6f] hover:text-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:px-12">
        <div className="mb-4 flex gap-2 overflow-x-auto rounded-lg bg-white p-2 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`shrink-0 cursor-pointer rounded-md px-3 py-2 text-sm font-bold ${
                activeTab === item.id ? "bg-black text-white" : "text-[#6e6f6f]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto min-h-[640px] max-w-[1540px] rounded-lg border border-gray-300 bg-white px-5 py-8 sm:px-8 lg:px-16 lg:py-14">
          {activeTab === "profile" && (
            <ProfilePanel
              profile={profile}
              draftProfile={draftProfile}
              isEditing={isEditing}
              onDraftChange={setDraftProfile}
              onEdit={() => {
                setDraftProfile(profile);
                setIsEditing(true);
              }}
              onCancel={() => setIsEditing(false)}
              onSave={saveProfile}
            />
          )}

          {activeTab === "account" && (
            <AccountPanel
              view={accountView}
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              requestedAmount={requestedAmount}
              reason={reason}
              requestComplete={requestComplete}
              selectedHistory={selectedHistory}
              onViewChange={setAccountView}
              onSelectAmount={(amount) => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              onCustomAmount={(value) => {
                setCustomAmount(value.replace(/[^0-9]/g, ""));
                setSelectedAmount(null);
              }}
              onReasonChange={setReason}
              onRequest={() => setRequestComplete(true)}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={() => {
                setSelectedAmount(null);
                setCustomAmount("");
                setReason("");
                setRequestComplete(false);
                setAccountView("summary");
              }}
            />
          )}

          {activeTab === "orders" && (
            <OrdersPanel selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} />
          )}

          {activeTab === "returns" && <ReturnsPanel />}
        </div>
      </section>

      {showSaved && (
        <Modal onClose={() => setShowSaved(false)}>
          <p className="text-lg font-bold">변경되었습니다</p>
        </Modal>
      )}

      {requestComplete && (
        <Modal onClose={() => setRequestComplete(false)}>
          <p className="text-lg font-bold">충전 요청이 완료되었습니다</p>
          <p className="mt-2 text-sm text-gray-500">관리자 검토 후 계좌에 반영됩니다.</p>
          <button
            type="button"
            onClick={() => {
              setRequestComplete(false);
              setAccountView("history");
            }}
            className="mt-6 cursor-pointer rounded-md bg-black px-5 py-2 text-sm font-bold text-white"
          >
            이력 확인
          </button>
        </Modal>
      )}
    </div>
  );
}

function ProfilePanel({
  profile,
  draftProfile,
  isEditing,
  onDraftChange,
  onEdit,
  onCancel,
  onSave,
}: {
  profile: typeof initialProfile;
  draftProfile: typeof initialProfile;
  isEditing: boolean;
  onDraftChange: (profile: typeof initialProfile) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const rows: { key: keyof typeof initialProfile; label: string; tone?: string }[] = [
    { key: "userId", label: "아이디" },
    { key: "password", label: "비밀번호" },
    { key: "name", label: "이름" },
    { key: "birthday", label: "생년월일" },
    { key: "email", label: "이메일" },
    { key: "investmentProfile", label: "투자성향", tone: "text-red-500" },
    { key: "fundProfile", label: "자금성향", tone: "text-red-500" },
    { key: "investmentLevel", label: "투자레벨", tone: "text-[#633806]" },
  ];

  return (
    <div className="mx-auto max-w-[1314px]">
      <div className="mb-5 flex items-center justify-between px-1 sm:px-8">
        <h1 className="text-lg font-bold">내 정보</h1>
        <div className="flex gap-2">
          {isEditing && (
            <button type="button" onClick={onCancel} className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-bold">
              취소
            </button>
          )}
          <button
            type="button"
            onClick={isEditing ? onSave : onEdit}
            className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-700"
          >
            {isEditing ? "완료" : "정보 수정"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 px-5 py-5 sm:px-10 lg:px-12">
        <dl className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid min-h-10 grid-cols-[110px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <dt className="text-sm font-bold text-[#6e6f6f] sm:text-base">{row.label}</dt>
              <dd className="min-w-0 justify-self-stretch sm:justify-self-end sm:w-64">
                {isEditing ? (
                  <input
                    aria-label={row.label}
                    type={row.key === "password" ? "password" : "text"}
                    value={draftProfile[row.key]}
                    onChange={(event) => onDraftChange({ ...draftProfile, [row.key]: event.target.value })}
                    className={`w-full rounded-lg bg-[#f2f4f6] px-4 py-2 text-sm font-bold outline-none ring-black focus:ring-1 ${row.tone ?? "text-[#6e6f6f]"}`}
                  />
                ) : (
                  <span className={`block truncate text-sm font-bold sm:text-base ${row.tone ?? "text-[#6e6f6f]"}`}>
                    {profile[row.key]}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <button type="button" className="mt-6 cursor-pointer text-sm font-bold hover:underline sm:text-base">
        AI STOCK 탈퇴하기 &gt;
      </button>
    </div>
  );
}

function AccountPanel({
  view,
  selectedAmount,
  customAmount,
  requestedAmount,
  reason,
  selectedHistory,
  onViewChange,
  onSelectAmount,
  onCustomAmount,
  onReasonChange,
  onRequest,
  onSelectHistory,
  onResetRequest,
}: {
  view: AccountView;
  selectedAmount: number | null;
  customAmount: string;
  requestedAmount: number;
  reason: string;
  requestComplete: boolean;
  selectedHistory: RechargeRecord | null;
  onViewChange: (view: AccountView) => void;
  onSelectAmount: (amount: number) => void;
  onCustomAmount: (value: string) => void;
  onReasonChange: (value: string) => void;
  onRequest: () => void;
  onSelectHistory: (record: RechargeRecord) => void;
  onResetRequest: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1077px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-5">
        <h1 className="text-lg font-bold">계좌관리</h1>
        {view === "summary" && (
          <div className="flex gap-2">
            <button type="button" onClick={() => onViewChange("history")} className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-bold text-white">이력</button>
            <button type="button" onClick={() => onViewChange("recharge")} className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-bold text-white">가상캐시 재충전 요청</button>
          </div>
        )}
      </div>

      <div className="min-h-[430px] rounded-lg border border-gray-300 px-5 py-7 sm:px-12">
        {view === "summary" && <AccountSummary />}
        {view === "recharge" && (
          <RechargeAmount
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            onSelectAmount={onSelectAmount}
            onCustomAmount={onCustomAmount}
            onCancel={onResetRequest}
            onNext={() => requestedAmount > 0 && onViewChange("reason")}
          />
        )}
        {view === "reason" && (
          <RechargeReason
            amount={requestedAmount}
            reason={reason}
            onReasonChange={onReasonChange}
            onBack={() => onViewChange("recharge")}
            onRequest={onRequest}
          />
        )}
        {view === "history" && <RechargeHistory onBack={() => onViewChange("summary")} onSelect={onSelectHistory} />}
        {view === "detail" && selectedHistory && <RechargeDetail record={selectedHistory} onBack={() => onViewChange("history")} />}
      </div>
    </div>
  );
}

function AccountSummary() {
  const rows = [
    ["계좌", "829-342-001935"],
    ["이자율", "연1%"],
    ["거래 수수료", "0.1%"],
    ["계좌상태", "정상"],
    ["총 주문 가능 금액", "100,000,000원"],
    ["총 투자 금액", "0원"],
    ["판매 수익", "0원"],
    ["배당금", "0원"],
    ["이자", "0원"],
  ];

  return (
    <dl className="mx-auto max-w-xl space-y-3">
      {rows.map(([label, value], index) => (
        <div key={label} className={`grid grid-cols-2 gap-5 text-sm font-bold sm:text-base ${index === 4 ? "pt-4" : ""}`}>
          <dt className="text-[#6e6f6f]">{label}</dt>
          <dd className={label === "계좌상태" ? "text-[#00c73d]" : "text-[#6e6f6f]"}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RechargeAmount({ selectedAmount, customAmount, onSelectAmount, onCustomAmount, onCancel, onNext }: {
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmount: (value: string) => void;
  onCancel: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rechargeAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onSelectAmount(amount)}
            className={`min-h-20 cursor-pointer rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-28 ${selectedAmount === amount ? "border-black bg-black text-white" : "border-gray-300 bg-[#f2f4f6] text-[#6e6f6f] hover:border-gray-500"}`}
          >
            {won(amount)}
          </button>
        ))}
      </div>
      <label className="mt-6 flex items-center rounded-lg border border-gray-300 bg-[#f2f4f6] px-4">
        <input value={customAmount} onChange={(event) => onCustomAmount(event.target.value)} inputMode="numeric" placeholder="직접입력" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold outline-none" />
        <span className="text-sm font-bold text-[#6e6f6f]">원</span>
      </label>
      <div className="mt-7 flex justify-center gap-3">
        <button type="button" onClick={onCancel} className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm font-bold text-white">취소</button>
        <button type="button" onClick={onNext} className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300" disabled={!selectedAmount && !customAmount}>다음</button>
      </div>
    </div>
  );
}

function RechargeReason({ amount, reason, onReasonChange, onBack, onRequest }: { amount: number; reason: string; onReasonChange: (value: string) => void; onBack: () => void; onRequest: () => void }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-2 font-bold">목적 간략히 작성</p>
      <p className="mb-5 text-sm text-gray-500">요청 금액 {won(amount)}</p>
      <textarea value={reason} onChange={(event) => onReasonChange(event.target.value)} className="h-44 w-full resize-none rounded-lg border border-gray-300 bg-[#f2f4f6] p-4 outline-none focus:border-black" placeholder="가상캐시가 필요한 목적을 입력해 주세요." />
      <div className="mt-7 flex justify-center gap-3">
        <button type="button" onClick={onBack} className="cursor-pointer rounded-md border border-gray-300 px-5 py-2 text-sm font-bold">이전</button>
        <button type="button" onClick={onRequest} disabled={!reason.trim()} className="cursor-pointer rounded-md bg-black px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">요청</button>
      </div>
    </div>
  );
}

function RechargeHistory({ onBack, onSelect }: { onBack: () => void; onSelect: (record: RechargeRecord) => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-7 cursor-pointer text-sm font-bold hover:underline">&lt; 계좌관리</button>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-y-1 text-left text-xs sm:text-sm">
          <thead><tr>{["일시", "유형", "금액", "잔액 (충전 전)", "상태"].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}</tr></thead>
          <tbody>
            {rechargeHistory.map((record) => (
              <tr key={record.id} onClick={() => onSelect(record)} className="cursor-pointer rounded-lg bg-white outline outline-1 outline-gray-300 hover:bg-gray-50">
                <td className="px-3 py-4">{record.date}</td>
                <td className={`px-3 py-4 font-bold ${record.type === "초기 지급" ? "text-blue-500" : "text-amber-500"}`}>{record.type}</td>
                <td className="px-3 py-4 font-bold text-emerald-500">+{won(record.amount)}</td>
                <td className="px-3 py-4 font-bold">{won(record.balance)}</td>
                <td className={`px-3 py-4 font-bold ${record.status === "승인" ? "text-emerald-500" : "text-red-500"}`}>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RechargeDetail({ record, onBack }: { record: RechargeRecord; onBack: () => void }) {
  const approved = record.status === "승인";
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 cursor-pointer text-sm font-bold hover:underline">&lt; 뒤로가기</button>
      <article className="mx-auto max-w-[640px] rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] p-7 text-white sm:p-10">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${approved ? "bg-emerald-500/15" : "bg-red-500/15"}`}>{approved ? "✓" : "×"}</div>
        <h2 className="mt-4 text-center text-xl font-extrabold">캐시 충전 {approved ? "승인 완료" : "거절"}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailCell label="요청자" value={record.requester} />
          <DetailCell label={approved ? "지급 금액" : "요청 금액"} value={`₩${record.amount.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ff4444]"} />
          <DetailCell label={approved ? "지급 전 잔액" : "현재 잔액"} value="₩0" tone="text-[#ff4444]" />
          <DetailCell label={approved ? "지급 후 잔액" : "누적 지급액"} value={`₩${record.balance.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ffaa44]"} />
          {approved && <DetailCell label="누적 지급 총액" value="₩200,000,000" tone="text-[#ffaa44]" />}
          {approved && <DetailCell label="처리 일시" value={record.date} />}
        </div>
        <div className={`mt-5 rounded-lg border-l-4 bg-[#1a1a1a] p-4 ${approved ? "border-[#44cc88]" : "border-[#ff4444]"}`}>
          <p className="text-[11px] text-[#888]">{approved ? "관리자 메모" : "거절 사유"}</p>
          <p className={`mt-2 text-sm ${approved ? "text-[#ddd]" : "text-[#ff8888]"}`}>{record.note}</p>
        </div>
      </article>
    </div>
  );
}

function DetailCell({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-lg bg-[#1a1a1a] p-4"><p className="text-[11px] text-[#666]">{label}</p><p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p></div>;
}

function OrdersPanel({ selectedOrderId, onSelect }: { selectedOrderId: number; onSelect: (id: number) => void }) {
  const selected = orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  return (
    <div className="grid min-h-[520px] gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-lg border border-gray-300 p-5 sm:p-7">
        <h1 className="mb-6 text-lg font-bold">완료된 주문</h1>
        <div className="space-y-1">
          {orders.map((order) => (
            <button key={order.id} type="button" onClick={() => onSelect(order.id)} className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_70px_110px] items-center rounded-lg border px-3 py-3 text-left text-sm ${selectedOrderId === order.id ? "border-black bg-gray-50" : "border-gray-300 bg-white"}`}>
              <span><strong className="block font-medium">{order.name}</strong><small className={order.side === "판매완료" ? "text-blue-600" : "text-red-500"}>{order.side}</small></span>
              <span>{order.quantity}</span><span className="text-right">{order.price}</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="rounded-lg border border-gray-500 bg-[#f2f4f6] p-6 sm:p-8">
        <h2 className="text-lg font-bold">{selected.name}</h2><p className="text-sm font-bold">{selected.side}</p>
        <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-5 gap-y-3 text-sm font-bold">
          <dt>1주 평균 판매 가격</dt><dd>1,000,000원</dd><dt>판매 수량</dt><dd>{selected.quantity}</dd><dt className="pt-4">총 판매 금액</dt><dd className="pt-4">100,000,000원</dd><dt className="pt-4">주문 시간</dt><dd className="pt-4">2026년 05월 04일 16:44</dd><dt>판매 시간</dt><dd>2026년 05월 04일 16:46</dd><dt>주문 유형</dt><dd>지정가</dd><dt>1주당 가격</dt><dd>1,000,000원</dd>
        </dl>
      </aside>
    </div>
  );
}

function ReturnsPanel() {
  return (
    <div className="min-h-[520px] rounded-lg border border-gray-300 p-5 sm:p-8">
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <h1 className="text-lg font-bold">총 실현수익</h1>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-7 gap-y-2 font-bold"><strong className="text-2xl text-red-500">+123,000원</strong><span>판매수익 <b className="text-red-500">+123,000원</b></span><span>배당금 <b className="text-red-500">+21원</b></span><span>계좌이자 <b className="text-red-500">+20원</b></span></div>
          <p className="mt-6 font-bold">계좌잔액 1,002,000원&nbsp;&nbsp; 총평가 152,002,000원&nbsp;&nbsp; 주문가능 1,000,000원</p>
        </div>
        <div className="mx-auto">
          <div aria-label="종목별 수익 구성 원형 차트" className="h-44 w-44 rounded-full bg-[conic-gradient(#20df7a_0_25%,#f52222_25%_48%,#2864e8_48%_92%,#111_92%)] p-7"><div className="h-full w-full rounded-full bg-white" /></div>
          <div className="mt-3 grid grid-cols-[10px_auto] gap-x-2 text-xs"><i className="h-2.5 w-2.5 bg-[#20df7a]" />삼성전자<i className="h-2.5 w-2.5 bg-[#f52222]" />SK하이닉스<i className="h-2.5 w-2.5 bg-[#2864e8]" />메리츠</div>
        </div>
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr>{["판매일", "종목명", "총 판매수익", "수익률", "총 판매금액", "총 구매금액", "판매수량", "수수료", "1주당 수익", "1주당 판매가격"].map((head) => <th key={head} className="px-2 py-4">{head}</th>)}</tr></thead><tbody>{[["26.01.01", "삼성전자", "+100,000", "+1.0%"], ["26.01.01", "SK하이닉스", "+100,000", "-1.0%"]].map((row, index) => <tr key={row[1]} className="border border-gray-300"><td className="px-2 py-4">{row[0]}</td><td className="px-2">{row[1]}</td><td className={`px-2 ${index ? "text-blue-600" : "text-red-500"}`}>{row[2]}</td><td className={`px-2 ${index ? "text-blue-600" : "text-red-500"}`}>{row[3]}</td><td className="px-2">100원</td><td className="px-2">200,000원</td><td className="px-2">10주</td><td className="px-2">120원</td><td className="px-2">230원</td><td className="px-2">90,000원</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5" onMouseDown={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl" onMouseDown={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

export function EmptyOrders() {
  return <div className="flex min-h-[500px] flex-col items-center justify-center gap-4"><EmptyPortfolioIcon /><p className="font-medium">주문 내역이 없습니다</p></div>;
}
