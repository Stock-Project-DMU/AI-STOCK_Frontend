"use client";

import { useEffect, useMemo, useState } from "react";
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

const navItems: { id: MyPageTab; label: string; description: string }[] = [
  { id: "profile", label: "내 정보", description: "회원 정보 및 투자 성향" },
  { id: "account", label: "계좌관리", description: "가상계좌와 충전 내역" },
  { id: "orders", label: "주문내역", description: "완료된 주문 확인" },
  { id: "returns", label: "수익률", description: "실현수익과 종목 분석" },
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

type ProfileChoiceTone = "emerald" | "teal" | "blue" | "amber" | "orange";

type ProfileChoice = {
  value: string;
  description: string;
  tone: ProfileChoiceTone;
};

const investmentProfileChoices: ProfileChoice[] = [
  { value: "안정형", description: "원금 보존 최우선\n예금·채권 위주", tone: "emerald" },
  { value: "안정추구형", description: "손실 최소화 우선\n채권·배당주 중심", tone: "teal" },
  { value: "위험중립형", description: "수익·위험 균형\n혼합 포트폴리오", tone: "blue" },
  { value: "적극투자형", description: "일정 손실 감수\n성장주·ETF 위주", tone: "amber" },
  { value: "공격투자형", description: "최대 수익 추구\n레버리지·테마주", tone: "orange" },
];

const fundProfileChoices: ProfileChoice[] = [
  { value: "안정저축형", description: "목돈 모으기 목적\n적금·CMA 위주", tone: "emerald" },
  { value: "수익추구형", description: "투자 수익 목적\n주식·펀드 중심", tone: "blue" },
  { value: "목표달성형", description: "내 집 마련·은퇴\n구체적 목표 설정", tone: "amber" },
  { value: "자유소비형", description: "여유 자금 운용\n유동성 중시", tone: "orange" },
];

const investmentLevelChoices: ProfileChoice[] = [
  { value: "입문자", description: "주식 계좌가 없거나\n투자 경험 1년 미만\n용어가 낯선 단계", tone: "emerald" },
  { value: "일반 투자자", description: "투자 경험 1~3년\n기본 종목 거래 경험\nETF·펀드 알고 있음", tone: "blue" },
  { value: "숙련 투자자", description: "투자 경험 3년 이상\n재무제표·차트 분석\n파생·레버리지 경험", tone: "amber" },
];

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
  const [showWithdrawal, setShowWithdrawal] = useState(false);
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
    <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] text-[#111]">
      <aside className="hidden w-[250px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="theme-accent-bg m-4 rounded-xl px-5 py-4">
          <p className="text-[10px] font-black tracking-[0.16em] opacity-70">MY WORKSPACE</p>
          <strong className="mt-1 block text-base">마이페이지</strong>
          <span className="mt-1 block text-[11px] opacity-75">투자 계정 관리 센터</span>
        </div>

        <p className="px-6 pb-3 text-xs text-gray-400">계정 메뉴</p>
        <nav aria-label="마이페이지 메뉴" className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`cursor-pointer border-l-2 px-6 py-3.5 text-left transition-colors ${
                activeTab === item.id
                  ? "theme-accent-soft theme-accent-text border-[var(--market-accent)]"
                  : "border-transparent text-gray-700 hover:bg-gray-50 hover:text-black"
              }`}
            >
              <strong className="block text-sm font-semibold">{item.label}</strong>
              <span className={`mt-1 block text-[10px] ${activeTab === item.id ? "opacity-75" : "text-gray-400"}`}>
                {item.description}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:px-12">
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-bold transition-colors ${
                activeTab === item.id ? "theme-accent-bg" : "text-gray-500 hover:bg-gray-50 hover:text-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto min-h-[640px] max-w-[1540px] rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-[0_24px_70px_rgba(0,0,0,.16)] sm:px-8 lg:px-12 lg:py-10">
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
              onRequestWithdrawal={() => setShowWithdrawal(true)}
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
        <Modal ariaLabel="정보 수정 완료" onClose={() => setShowSaved(false)}>
          <p className="text-lg font-bold">변경되었습니다</p>
          <p className="mt-2 text-sm text-gray-500">회원 정보가 화면에 반영되었습니다.</p>
          <button type="button" onClick={() => setShowSaved(false)} className="theme-accent-bg mt-6 rounded-lg px-5 py-2.5 text-sm font-bold">
            확인
          </button>
        </Modal>
      )}

      {requestComplete && (
        <Modal ariaLabel="충전 요청 완료" onClose={() => setRequestComplete(false)}>
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

      {showWithdrawal && (
        <Modal ariaLabel="회원 탈퇴 확인" onClose={() => setShowWithdrawal(false)}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl font-black text-red-500">!</div>
          <h2 className="mt-4 text-xl font-extrabold">정말 탈퇴하시겠어요?</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            탈퇴하면 저장된 투자 성향, 주문 내역과 수익률 정보를 다시 확인할 수 없습니다.
          </p>
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left text-xs leading-5 text-red-500">
            이 작업은 되돌릴 수 없습니다. 계속하기 전에 필요한 정보를 확인해 주세요.
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setShowWithdrawal(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold hover:bg-gray-50">
              취소
            </button>
            <button type="button" onClick={() => setShowWithdrawal(false)} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-600">
              탈퇴하기
            </button>
          </div>
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
  onRequestWithdrawal,
}: {
  profile: typeof initialProfile;
  draftProfile: typeof initialProfile;
  isEditing: boolean;
  onDraftChange: (profile: typeof initialProfile) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onRequestWithdrawal: () => void;
}) {
  const rows: { key: keyof typeof initialProfile; label: string }[] = [
    { key: "userId", label: "아이디" },
    { key: "password", label: "비밀번호" },
    { key: "name", label: "이름" },
    { key: "birthday", label: "생년월일" },
    { key: "email", label: "이메일" },
    { key: "investmentProfile", label: "투자성향" },
    { key: "fundProfile", label: "자금성향" },
    { key: "investmentLevel", label: "투자레벨" },
  ];

  const accountRows = rows.slice(0, 5);
  const investmentRows = rows.slice(5);

  const renderRows = (items: typeof rows) => (
    <dl className="divide-y divide-gray-200">
      {items.map((row) => {
        const selectedChoice = getProfileChoice(row.key, profile[row.key]);

        return (
          <div key={row.key} className="grid min-h-16 grid-cols-[100px_minmax(0,1fr)] items-center gap-4 py-3 sm:grid-cols-[110px_minmax(0,1fr)]">
            <dt className="text-xs font-semibold text-gray-500 sm:text-sm">{row.label}</dt>
            <dd className="min-w-0">
              {isEditing ? (
                <input
                  aria-label={row.label}
                  type={row.key === "password" ? "password" : "text"}
                  value={draftProfile[row.key]}
                  onChange={(event) => onDraftChange({ ...draftProfile, [row.key]: event.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]"
                />
              ) : selectedChoice ? (
                <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${profileChoiceToneClasses[selectedChoice.tone]}`}>
                  {profile[row.key]}
                </span>
              ) : (
                <span className="block break-words text-sm font-bold text-gray-900 sm:text-base">{profile[row.key]}</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="theme-accent-text text-xs font-black tracking-[0.14em]">PROFILE</p>
          <h1 className="mt-1 text-2xl font-extrabold">내 정보</h1>
          <p className="mt-2 text-sm text-gray-500">회원 정보와 투자 프로필을 한곳에서 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold hover:bg-gray-50">
              취소
            </button>
          )}
          <button
            type="button"
            onClick={isEditing ? onSave : onEdit}
            className="theme-accent-bg rounded-lg px-5 py-2.5 text-sm font-bold"
          >
            {isEditing ? "완료" : "정보 수정"}
          </button>
        </div>
      </div>

      <div className={isEditing ? "space-y-5" : "grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]"}>
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
          <div className="mb-2">
            <h2 className="font-bold">기본 정보</h2>
            <p className="mt-1 text-xs text-gray-500">로그인과 본인 확인에 사용되는 정보입니다.</p>
          </div>
          {renderRows(accountRows)}
        </section>

        <section className="rounded-2xl border border-gray-200 p-5 sm:p-7">
          <div className="mb-2">
            <h2 className="font-bold">투자 프로필</h2>
            <p className="mt-1 text-xs text-gray-500">AI 분석과 맞춤 정보에 반영되는 선택 항목입니다.</p>
          </div>
          {isEditing ? (
            <div className="mt-6 space-y-8">
              <ProfileChoiceGroup
                label="투자 성향"
                helper="감당할 수 있는 위험 수준을 선택해 주세요."
                options={investmentProfileChoices}
                selected={draftProfile.investmentProfile}
                columns={5}
                scaleLabels={["낮은 위험", "높은 위험"]}
                onSelect={(value) => onDraftChange({ ...draftProfile, investmentProfile: value })}
              />
              <ProfileChoiceGroup
                label="자금 성향"
                helper="투자 자금의 목적과 운용 방식을 선택해 주세요."
                options={fundProfileChoices}
                selected={draftProfile.fundProfile}
                columns={4}
                scaleLabels={["저축·보존", "수익·유동성"]}
                onSelect={(value) => onDraftChange({ ...draftProfile, fundProfile: value })}
              />
              <ProfileChoiceGroup
                label="투자 경험 레벨"
                helper="현재 투자 경험에 가장 가까운 단계를 선택해 주세요."
                options={investmentLevelChoices}
                selected={draftProfile.investmentLevel}
                columns={3}
                onSelect={(value) => onDraftChange({ ...draftProfile, investmentLevel: value })}
              />
            </div>
          ) : (
            <>
              {renderRows(investmentRows)}
              <div className="theme-accent-soft mt-5 rounded-xl px-4 py-3">
                <p className="theme-accent-text text-xs font-semibold leading-5">현재 선택한 성향을 기반으로 맞춤 분석이 제공되고 있습니다.</p>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-sm font-bold text-red-500">회원 탈퇴</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">계정과 저장된 투자 데이터를 삭제합니다.</p>
        </div>
        <button type="button" onClick={onRequestWithdrawal} className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white">
          AI STOCK 탈퇴하기
        </button>
      </section>
    </div>
  );
}

const profileChoiceToneClasses: Record<ProfileChoiceTone, string> = {
  emerald: "border-emerald-500/45 bg-emerald-500/10 text-emerald-500",
  teal: "border-teal-500/45 bg-teal-500/10 text-teal-500",
  blue: "border-blue-500/45 bg-blue-500/10 text-blue-500",
  amber: "border-amber-500/45 bg-amber-500/10 text-amber-500",
  orange: "border-orange-500/45 bg-orange-500/10 text-orange-500",
};

const profileChoiceSelectedClasses: Record<ProfileChoiceTone, string> = {
  emerald: "ring-2 ring-emerald-500",
  teal: "ring-2 ring-teal-500",
  blue: "ring-2 ring-blue-500",
  amber: "ring-2 ring-amber-500",
  orange: "ring-2 ring-orange-500",
};

const profileChoiceCheckClasses: Record<ProfileChoiceTone, string> = {
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
};

function getProfileChoice(key: keyof typeof initialProfile, value: string) {
  const choicesByKey: Partial<Record<keyof typeof initialProfile, ProfileChoice[]>> = {
    investmentProfile: investmentProfileChoices,
    fundProfile: fundProfileChoices,
    investmentLevel: investmentLevelChoices,
  };

  return choicesByKey[key]?.find((choice) => choice.value === value);
}

function ProfileChoiceGroup({
  label,
  helper,
  options,
  selected,
  columns,
  scaleLabels,
  onSelect,
}: {
  label: string;
  helper: string;
  options: ProfileChoice[];
  selected: string;
  columns: 3 | 4 | 5;
  scaleLabels?: [string, string];
  onSelect: (value: string) => void;
}) {
  const columnClass =
    columns === 5
      ? "sm:grid-cols-2 lg:grid-cols-5"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-3";

  return (
    <fieldset>
      <legend className="text-sm font-bold sm:text-base">{label}</legend>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
      <div role="radiogroup" aria-label={label} className={`mt-4 grid gap-3 ${columnClass}`}>
        {options.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.value)}
              className={`relative min-h-28 rounded-xl border px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:brightness-110 ${profileChoiceToneClasses[option.tone]} ${
                isSelected
                  ? `${profileChoiceSelectedClasses[option.tone]} ring-offset-2 ring-offset-[var(--market-panel)] shadow-[0_10px_28px_rgba(0,0,0,.16)]`
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              {isSelected && (
                <span aria-hidden="true" className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-white ${profileChoiceCheckClasses[option.tone]}`}>
                  ✓
                </span>
              )}
              <strong className="block text-sm sm:text-base">{option.value}</strong>
              <span className="mt-2 block whitespace-pre-line text-[11px] font-semibold leading-5 opacity-80 sm:text-xs">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
      {scaleLabels && (
        <div aria-hidden="true" className="mt-4 flex items-center gap-3 text-[11px] font-semibold text-gray-500">
          <span className="shrink-0">{scaleLabels[0]}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500" />
          <span className="shrink-0">{scaleLabels[1]}</span>
        </div>
      )}
    </fieldset>
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
  const viewDescription: Record<AccountView, string> = {
    summary: "가상계좌의 잔액과 투자 현황을 확인합니다.",
    recharge: "추가로 지급받을 가상캐시 금액을 선택합니다.",
    reason: "가상캐시가 필요한 목적을 작성합니다.",
    history: "가상캐시 지급 요청과 처리 결과를 확인합니다.",
    detail: "선택한 가상캐시 처리 내역의 상세 정보입니다.",
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="theme-accent-text text-xs font-black tracking-[0.14em]">ACCOUNT</p>
          <h1 className="mt-1 text-2xl font-extrabold">계좌관리</h1>
          <p className="mt-2 text-sm text-gray-500">{viewDescription[view]}</p>
        </div>
        {view === "summary" && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onViewChange("history")} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-bold hover:bg-gray-50">충전 이력</button>
            <button type="button" onClick={() => onViewChange("recharge")} className="theme-accent-bg rounded-lg px-4 py-2.5 text-sm font-bold">가상캐시 재충전</button>
          </div>
        )}
      </div>

      <div className="min-h-[430px] rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">
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
  const metrics = [
    { label: "총 투자 금액", value: "0원" },
    { label: "판매 수익", value: "0원" },
    { label: "배당금", value: "0원" },
    { label: "계좌 이자", value: "0원" },
    { label: "연 이자율", value: "1%" },
    { label: "거래 수수료", value: "0.1%" },
  ];

  return (
    <div className="space-y-5">
      <section className="theme-accent-soft rounded-2xl border border-[var(--market-accent)]/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500">AI STOCK 가상계좌</p>
            <p className="mt-2 text-lg font-extrabold tracking-[0.06em] sm:text-xl">829-342-001935</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500">정상</span>
        </div>
        <div className="mt-7 border-t border-[var(--market-accent)]/15 pt-5">
          <p className="text-xs font-semibold text-gray-500">총 주문 가능 금액</p>
          <strong className="mt-1 block text-2xl font-black sm:text-3xl">100,000,000원</strong>
        </div>
      </section>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <dt className="text-xs font-semibold text-gray-500">{metric.label}</dt>
            <dd className="mt-2 text-base font-extrabold">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
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
      <div className="mb-6">
        <h2 className="text-lg font-bold">충전 금액 선택</h2>
        <p className="mt-1 text-sm text-gray-500">금액을 선택하거나 직접 입력해 주세요.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rechargeAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onSelectAmount(amount)}
            className={`min-h-20 rounded-xl border px-2 text-sm font-bold transition-colors sm:min-h-24 ${selectedAmount === amount ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_8px_24px_var(--market-accent-soft)]" : "border-gray-200 bg-white text-gray-700 hover:border-[var(--market-accent)] hover:text-black"}`}
          >
            {won(amount)}
          </button>
        ))}
      </div>
      <label className="mt-4 flex items-center rounded-xl border border-gray-200 bg-white px-4 focus-within:border-[var(--market-accent)] focus-within:ring-2 focus-within:ring-[var(--market-accent-soft)]">
        <input aria-label="직접 충전 금액" value={customAmount} onChange={(event) => onCustomAmount(event.target.value)} inputMode="numeric" placeholder="직접 입력" className="min-w-0 flex-1 bg-transparent py-4 text-sm font-bold outline-none" />
        <span className="text-sm font-bold text-[#6e6f6f]">원</span>
      </label>
      <div className="mt-7 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold hover:bg-gray-50">취소</button>
        <button type="button" onClick={onNext} className="theme-accent-bg rounded-lg px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" disabled={!selectedAmount && !customAmount}>다음</button>
      </div>
    </div>
  );
}

function RechargeReason({ amount, reason, onReasonChange, onBack, onRequest }: { amount: number; reason: string; onReasonChange: (value: string) => void; onBack: () => void; onRequest: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div><p className="text-xs font-semibold text-gray-500">요청 금액</p><strong className="mt-1 block text-xl">{won(amount)}</strong></div>
        <span className="theme-accent-soft theme-accent-text rounded-full px-3 py-1.5 text-xs font-bold">2단계 중 2단계</span>
      </div>
      <label className="mb-2 block text-sm font-bold" htmlFor="recharge-reason">충전 목적</label>
      <textarea id="recharge-reason" value={reason} onChange={(event) => onReasonChange(event.target.value)} className="h-44 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" placeholder="가상캐시가 필요한 목적을 입력해 주세요." />
      <p className="mt-2 text-right text-xs text-gray-500">{reason.length}자</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onBack} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold hover:bg-gray-50">이전</button>
        <button type="button" onClick={onRequest} disabled={!reason.trim()} className="theme-accent-bg rounded-lg px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">요청</button>
      </div>
    </div>
  );
}

function RechargeHistory({ onBack, onSelect }: { onBack: () => void; onSelect: (record: RechargeRecord) => void }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 text-sm font-bold text-gray-500 hover:text-black">← 계좌 요약으로</button>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
          <thead className="bg-gray-50"><tr>{["요청 일시", "유형", "요청 금액", "충전 전 잔액", "처리 상태"].map((head) => <th key={head} className="border-b border-gray-200 px-4 py-3.5 text-xs font-semibold text-gray-500">{head}</th>)}</tr></thead>
          <tbody>
            {rechargeHistory.map((record) => (
              <tr key={record.id} onClick={() => onSelect(record)} className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 text-gray-500">{record.date}</td>
                <td className="px-4 py-4 font-bold">{record.type}</td>
                <td className="px-4 py-4 font-extrabold">+{won(record.amount)}</td>
                <td className="px-4 py-4 font-semibold">{won(record.balance)}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "승인" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{record.status}</span></td>
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
      <button type="button" onClick={onBack} className="mb-5 text-sm font-bold text-gray-500 hover:text-black">← 충전 이력으로</button>
      <article className="mx-auto max-w-[680px] rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${approved ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{approved ? "✓" : "×"}</div>
            <div><p className="text-xs font-semibold text-gray-500">가상캐시 처리 결과</p><h2 className="mt-1 text-xl font-extrabold">캐시 충전 {approved ? "승인 완료" : "거절"}</h2></div>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${approved ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{record.status}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailCell label="요청자" value={record.requester} />
          <DetailCell label={approved ? "지급 금액" : "요청 금액"} value={`₩${record.amount.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ff4444]"} />
          <DetailCell label={approved ? "지급 전 잔액" : "현재 잔액"} value="₩0" tone="text-[#ff4444]" />
          <DetailCell label={approved ? "지급 후 잔액" : "누적 지급액"} value={`₩${record.balance.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ffaa44]"} />
          {approved && <DetailCell label="누적 지급 총액" value="₩200,000,000" tone="text-[#ffaa44]" />}
          {approved && <DetailCell label="처리 일시" value={record.date} />}
        </div>
        <div className={`mt-5 rounded-xl border-l-4 bg-gray-50 p-4 ${approved ? "border-emerald-500" : "border-red-500"}`}>
          <p className="text-[11px] font-semibold text-gray-500">{approved ? "관리자 메모" : "거절 사유"}</p>
          <p className="mt-2 text-sm leading-6">{record.note}</p>
        </div>
      </article>
    </div>
  );
}

function DetailCell({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-[11px] font-semibold text-gray-500">{label}</p><p className={`mt-1 text-sm font-bold ${tone === "text-white" ? "text-gray-900" : tone}`}>{value}</p></div>;
}

function OrdersPanel({ selectedOrderId, onSelect }: { selectedOrderId: number; onSelect: (id: number) => void }) {
  const selected = orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  const isSell = selected.side === "판매완료";
  const detailRows = [
    ["1주 평균 체결가", "1,000,000원"],
    ["체결 수량", selected.quantity],
    ["총 체결 금액", "100,000,000원"],
    ["주문 시간", "2026.05.04 16:44"],
    ["체결 시간", "2026.05.04 16:46"],
    ["주문 유형", "지정가"],
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7">
        <p className="theme-accent-text text-xs font-black tracking-[0.14em]">ORDER HISTORY</p>
        <h1 className="mt-1 text-2xl font-extrabold">주문내역</h1>
        <p className="mt-2 text-sm text-gray-500">체결이 완료된 매수·매도 주문과 상세 정보를 확인합니다.</p>
      </div>

      <div className="grid min-h-[500px] gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div><h2 className="font-bold">완료된 주문</h2><p className="mt-1 text-xs text-gray-500">총 {orders.length}건</p></div>
            <span className="theme-accent-soft theme-accent-text rounded-full px-3 py-1 text-xs font-bold">전체</span>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_90px_130px] border-b border-gray-200 px-5 py-3 text-xs font-semibold text-gray-500 sm:grid">
            <span>종목 / 주문 구분</span><span>수량</span><span className="text-right">체결 금액</span>
          </div>
          <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <button key={order.id} type="button" onClick={() => onSelect(order.id)} className={`relative grid w-full grid-cols-[minmax(0,1fr)_70px_110px] items-center gap-2 px-5 py-4 text-left text-sm transition-colors sm:grid-cols-[minmax(0,1fr)_90px_130px] ${selectedOrderId === order.id ? "theme-accent-soft" : "bg-white hover:bg-gray-50"}`}>
              {selectedOrderId === order.id && <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--market-accent)]" />}
              <span><strong className="block font-bold">{order.name}</strong><small className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${order.side === "판매완료" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{order.side}</small></span>
              <span className="font-semibold">{order.quantity}</span><span className="text-right font-extrabold">{order.price}</span>
            </button>
          ))}
          </div>
      </section>
      <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
          <div><p className="text-xs font-semibold text-gray-500">선택 주문</p><h2 className="mt-1 text-xl font-extrabold">{selected.name}</h2></div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isSell ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{selected.side}</span>
        </div>
        <dl className="mt-3 divide-y divide-gray-200">
          {detailRows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[1fr_auto] gap-5 py-3.5 text-sm"><dt className="text-gray-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>
          ))}
        </dl>
        <div className="theme-accent-soft mt-5 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500">주문 결과</p>
          <p className="theme-accent-text mt-1 text-sm font-bold">{isSell ? "매도" : "매수"} 주문이 모두 체결되었습니다.</p>
        </div>
      </aside>
      </div>
    </div>
  );
}

function ReturnsPanel() {
  const summaryMetrics = [
    { label: "판매 수익", value: "+123,000원" },
    { label: "배당금", value: "+21원" },
    { label: "계좌 이자", value: "+20원" },
  ];
  const balanceMetrics = [
    { label: "계좌 잔액", value: "1,002,000원" },
    { label: "총 평가 금액", value: "152,002,000원" },
    { label: "주문 가능 금액", value: "1,000,000원" },
  ];
  const returnRows = [
    ["26.01.01", "삼성전자", "+100,000원", "+1.0%", "100원", "200,000원", "10주", "120원", "230원", "90,000원"],
    ["26.01.01", "SK하이닉스", "+100,000원", "-1.0%", "100원", "200,000원", "10주", "120원", "230원", "90,000원"],
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7">
        <p className="theme-accent-text text-xs font-black tracking-[0.14em]">PERFORMANCE</p>
        <h1 className="mt-1 text-2xl font-extrabold">수익률</h1>
        <p className="mt-2 text-sm text-gray-500">실현 수익의 구성과 종목별 거래 성과를 확인합니다.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <p className="text-xs font-semibold text-gray-500">총 실현 수익</p>
          <strong className="mt-2 block text-3xl font-black text-red-500 sm:text-4xl">+123,000원</strong>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold text-gray-500">{metric.label}</p>
                <p className="mt-2 text-sm font-extrabold text-red-500">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 p-5">
          <div aria-label="종목별 수익 구성 원형 차트" className="h-40 w-40 rounded-full bg-[conic-gradient(#14b8a6_0_25%,#fb7185_25%_48%,#8b5cf6_48%_92%,#94a3b8_92%)] p-7 shadow-[0_10px_30px_rgba(0,0,0,.12)]">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white"><strong className="text-lg">3종목</strong><span className="mt-1 text-[10px] text-gray-500">수익 구성</span></div>
          </div>
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center text-[11px]">
            <span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-teal-500" />삼성전자</span>
            <span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-rose-400" />SK하이닉스</span>
            <span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-violet-500" />메리츠</span>
          </div>
        </section>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {balanceMetrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <dt className="text-xs font-semibold text-gray-500">{metric.label}</dt>
            <dd className="mt-2 text-base font-extrabold">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <h2 className="font-bold">종목별 실현 수익</h2>
          <p className="mt-1 text-xs text-gray-500">최근 체결된 매도 주문 기준</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead className="bg-gray-50"><tr>{["판매일", "종목명", "총 판매수익", "수익률", "총 판매금액", "총 구매금액", "판매수량", "수수료", "1주당 수익", "1주당 판매가격"].map((head) => <th key={head} className="border-b border-gray-200 px-4 py-3.5 font-semibold text-gray-500">{head}</th>)}</tr></thead>
            <tbody>{returnRows.map((row, index) => <tr key={row[1]} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">{row.map((cell, cellIndex) => <td key={`${row[1]}-${cellIndex}`} className={`whitespace-nowrap px-4 py-4 ${cellIndex === 1 ? "font-bold" : ""} ${cellIndex === 2 || cellIndex === 3 ? (index ? "text-blue-500" : "text-red-500") + " font-bold" : ""}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Modal({ children, onClose, ariaLabel }: { children: React.ReactNode; onClose: () => void; ariaLabel: string }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={ariaLabel} className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="모달 닫기" onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-500 hover:bg-gray-50 hover:text-black">×</button>
        {children}
      </div>
    </div>
  );
}

export function EmptyOrders() {
  return <div className="flex min-h-[500px] flex-col items-center justify-center gap-4"><EmptyPortfolioIcon /><p className="font-medium">주문 내역이 없습니다</p></div>;
}
