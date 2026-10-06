import { useEffect, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons/Icon";
import { rechargeAmounts, won } from "../../data";
import type { AccountView, RechargeRecord } from "../../model";
import type { AccountInfoResponse, ProfitResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";
import { formatAccountNumber } from "@/lib/format/account";
import AccountTransactions from "./AccountTransactions";
import UpcomingDividends from "./UpcomingDividends";
import { getMyDividends } from "@/lib/api/dividend";
import { isAuthenticated } from "@/lib/api/client";

type AccountPanelProps = {
  mode: "info" | "recharge";
  chargeHistory: RechargeRecord[];
  requestingCharge: boolean;
  view: AccountView;
  selectedAmount: number | null;
  customAmount: string;
  requestedAmount: number;
  reason: string;
  selectedHistory: RechargeRecord | null;
  onViewChange: (view: AccountView) => void;
  onSelectAmount: (amount: number) => void;
  onCustomAmount: (value: string) => void;
  onReasonChange: (value: string) => void;
  onRequest: () => void;
  onAutoCharge: () => void;
  onDeduct: () => void;
  onSelectHistory: (record: RechargeRecord) => void;
  onResetRequest: () => void;
  accounts: AccountInfoResponse[] | null;
  profit: ProfitResponse | null;
  realizedProfit: number;
  isLoading: boolean;
  error: string;
  chargeError: string;
};

export default function AccountPanel({
  mode,
  chargeHistory,
  requestingCharge,
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
  onAutoCharge,
  onDeduct,
  onSelectHistory,
  onResetRequest,
  accounts,
  profit,
  realizedProfit,
  isLoading,
  error,
  chargeError,
}: AccountPanelProps) {
  const primaryAccount = accounts?.[0];
  const isUnlimitedCharge = primaryAccount?.unlimitedCharge ?? false;
  const autoChargeAvailable = primaryAccount ? (isUnlimitedCharge || primaryAccount.chargeCount < primaryAccount.maxChargeCount) : false;
  const chargeMaxAmount = primaryAccount?.chargeableAmount ?? 0;
  const deductMaxAmount = primaryAccount?.deductibleAmount ?? 0;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{mode === "info" ? "계좌 정보" : isUnlimitedCharge ? "가상계좌 관리" : "가상계좌 충전"}</h1>
          <p className="mt-1 text-sm text-muted">{mode === "info" ? "계좌 상태와 적용 정책, 누적 수익을 확인할 수 있습니다." : isUnlimitedCharge ? "가상캐시를 바로 충전하고 이력을 확인할 수 있습니다." : "가상캐시 충전을 요청하고 처리 이력을 확인할 수 있습니다."}</p>
        </div>
        {mode === "info" && (
          <button type="button" onClick={() => onViewChange(view === "transactions" ? "summary" : "transactions")} className="rounded-lg border border-hairline px-3.5 py-2 text-sm font-bold hover:bg-surface-soft">
            {view === "transactions" ? "계좌 정보" : "계좌내역"}
          </button>
        )}
        {mode === "recharge" && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onViewChange("history")} className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${view === "history" || view === "detail" ? "theme-accent-soft border-[var(--market-accent)] theme-accent-text" : "border-hairline hover:bg-surface-soft"}`}>충전 이력</button>
            {isUnlimitedCharge ? (
              <>
                <button type="button" onClick={() => onViewChange("recharge")} className={`rounded-lg px-3.5 py-2 text-sm font-bold ${view === "recharge" ? "theme-accent-bg" : "border border-hairline hover:bg-surface-soft"}`}>충전</button>
                <button type="button" onClick={() => onViewChange("deduct")} className={`rounded-lg px-3.5 py-2 text-sm font-bold ${view === "deduct" ? "theme-accent-bg" : "border border-hairline hover:bg-surface-soft"}`}>차감</button>
              </>
            ) : (
              <button type="button" onClick={() => onViewChange("recharge")} className={`rounded-lg px-3.5 py-2 text-sm font-bold ${view === "recharge" || view === "reason" ? "theme-accent-bg" : "border border-hairline hover:bg-surface-soft"}`}>충전 요청</button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[360px] rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
        {mode === "info" && view !== "transactions" && <AccountSummary accounts={accounts} profit={profit} realizedProfit={realizedProfit} isLoading={isLoading} error={error} />}
        {mode === "info" && view === "transactions" && (isLoading ? <p role="status">계좌 정보를 불러오는 중입니다.</p> : error ? <p role="alert" className="text-up">{error}</p> : <AccountTransactions accounts={accounts ?? []} />)}
        {mode === "recharge" && view === "recharge" && isLoading && <p role="status">계좌 정보를 불러오는 중입니다.</p>}
        {mode === "recharge" && view === "recharge" && !isLoading && error && <p role="alert" className="text-up">{error}</p>}
        {mode === "recharge" && view === "recharge" && !isLoading && !error && (
          <RechargeAmount
            selectedAmount={selectedAmount}
            customAmount={customAmount}
            instant={autoChargeAvailable}
            maxAmount={chargeMaxAmount}
            requestingCharge={requestingCharge}
            onSelectAmount={onSelectAmount}
            onCustomAmount={onCustomAmount}
            onCancel={onResetRequest}
            onNext={() => {
              if (requestedAmount <= 0 || requestingCharge) return;
              if (autoChargeAvailable) onAutoCharge();
              else onViewChange("reason");
            }}
          />
        )}
        {mode === "recharge" && view === "reason" && <RechargeReason amount={requestedAmount} reason={reason} onReasonChange={onReasonChange} onBack={() => onViewChange("recharge")} onRequest={onRequest} />}
        {mode === "recharge" && view === "deduct" && isLoading && <p role="status">계좌 정보를 불러오는 중입니다.</p>}
        {mode === "recharge" && view === "deduct" && !isLoading && error && <p role="alert" className="text-up">{error}</p>}
        {mode === "recharge" && view === "deduct" && !isLoading && !error && (
          <DeductAmount
            customAmount={customAmount}
            maxAmount={deductMaxAmount}
            requestingCharge={requestingCharge}
            onCustomAmount={onCustomAmount}
            onCancel={onResetRequest}
            onNext={() => {
              if (requestedAmount <= 0 || requestingCharge) return;
              onDeduct();
            }}
          />
        )}
        {mode === "recharge" && view === "history" && <RechargeHistory rechargeHistory={chargeHistory} onBack={() => onViewChange("recharge")} onSelect={onSelectHistory} />}
        {mode === "recharge" && view === "detail" && selectedHistory && <RechargeDetail record={selectedHistory} onBack={() => onViewChange("history")} />}
      </div>
      {requestingCharge && <p role="status">{view === "deduct" ? "차감 중..." : isUnlimitedCharge ? "충전 중..." : "충전 요청 중..."}</p>}
      {mode === "recharge" && chargeError && <p role="alert" className="mt-3 text-red-500">{chargeError}</p>}
    </div>
  );
}

// 지급 완료된 배당 합계. 비로그인이면 호출하지 않고, 실패하면 0원으로 둔다. null은 로딩 중.
function useCumulativeDividend() {
  const [authenticated] = useState(isAuthenticated);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    void getMyDividends(controller.signal).then((items) => {
      if (!controller.signal.aborted) setTotal(items.reduce((sum, item) => sum + item.totalAmount, 0));
    }).catch(() => {
      if (!controller.signal.aborted) setTotal(0);
    });
    return () => controller.abort();
  }, [authenticated]);

  return authenticated ? total : 0;
}

function AccountSummary({ accounts, profit, realizedProfit, isLoading, error }: { accounts: AccountInfoResponse[] | null; profit: ProfitResponse | null; realizedProfit: number; isLoading: boolean; error: string }) {
  const cumulativeDividend = useCumulativeDividend();

  if (isLoading) {
    return <div className="flex min-h-72 items-center justify-center text-sm font-semibold text-muted">계좌 정보를 불러오는 중입니다.</div>;
  }

  if (error) {
    return <div role="alert" className="flex min-h-72 items-center justify-center text-center text-sm font-semibold text-red-500">{error}</div>;
  }

  const account = accounts?.[0];
  if (!account) {
    return <div className="flex min-h-72 items-center justify-center text-sm font-semibold text-muted">표시할 계좌가 없습니다.</div>;
  }

  const metrics = [
    { label: "기준 자산", value: won(account.baseBalance) },
    { label: "현재 잔액", value: won(account.balance) },
    { label: "주문 동결 금액", value: won(account.frozenBalance) },
    { label: "총 평가 자산", value: won(profit?.totalAsset ?? account.balance + account.frozenBalance) },
    { label: "평가 손익", value: won(profit?.profitAmount ?? 0) },
    ...(account.unlimitedCharge ? [] : [{ label: "자동 충전 남은 횟수", value: `${Math.max((account.maxChargeCount ?? 0) - account.chargeCount, 0)}/${account.maxChargeCount ?? 0}` }]),
  ];
  const accountDetails = [
    { label: "예치 이자율", value: `연 ${(account.interestRate ?? 0).toFixed(2)}%` },
    { label: "거래 수수료", value: "0.1%" },
    { label: "누적 판매 수익", value: won(realizedProfit), tone: realizedProfit > 0 ? "text-red-500" : realizedProfit < 0 ? "text-blue-500" : "" },
    { label: "누적 배당금", value: cumulativeDividend === null ? <span role="status" aria-label="누적 배당금 불러오는 중" className="inline-block h-5 w-24 animate-pulse rounded-md bg-surface-strong align-middle motion-reduce:animate-none" /> : won(cumulativeDividend) },
    { label: "누적 이자", value: won(account.totalInterest ?? 0) },
  ];

  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_6px_20px_rgba(10,11,13,.04)]">
      <header className="theme-accent-soft px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted">{account.accountName}</p>
            <p className="num mt-1.5 text-base font-bold tracking-[0.06em] sm:text-lg">{formatAccountNumber(account.accountNumber)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${account.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${account.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
            계좌 상태 {account.status === "ACTIVE" ? "정상" : "정지"}
          </span>
        </div>
        <div className="mt-6">
          <p className="text-xs font-semibold text-muted">총 주문 가능 금액</p>
          <strong className="num mt-1 block text-2xl font-bold tracking-tight sm:text-3xl">{won(account.balance)}</strong>
        </div>
      </header>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <section>
          <div className="mb-2 flex items-end justify-between gap-3">
            <h2 className="text-sm font-bold">자산 현황</h2>
            <span className="text-xs text-muted">실시간 계좌 기준</span>
          </div>
          <dl className="grid border-b border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => <div key={metric.label} className="flex min-h-20 flex-col justify-between border-t border-hairline px-1 py-4 sm:px-4"><dt className="text-xs font-semibold text-muted">{metric.label}</dt><dd className="num mt-2 text-right text-base font-bold">{metric.value}</dd></div>)}
          </dl>
        </section>

        <section className="mt-6">
          <div className="mb-2">
            <h2 className="text-sm font-bold">수익 및 적용 조건</h2>
            <p className="mt-1 text-xs text-muted">누적 지급 내역과 현재 계좌에 적용되는 조건입니다.</p>
          </div>
          <dl className="grid border-b border-hairline sm:grid-cols-2 lg:grid-cols-3">
            {accountDetails.map((detail) => <div key={detail.label} className="flex min-h-20 flex-col justify-between border-t border-hairline px-1 py-4 sm:px-4"><dt className="text-xs font-semibold text-muted">{detail.label}</dt><dd className={`num mt-2 text-right text-base font-bold ${detail.tone ?? ""}`}>{detail.value}</dd></div>)}
          </dl>
          <p className="mt-4 rounded-lg bg-surface-soft px-3.5 py-3 text-xs leading-5 text-muted">예치금에는 연 {account.interestRate.toFixed(2)}%의 이자가 적립되며, 매도 체결 시 거래 금액의 0.1%가 수수료로 차감됩니다.</p>
        </section>

        <UpcomingDividends />
      </div>
    </article>
  );
}

type RechargeAmountProps = {
  selectedAmount: number | null;
  customAmount: string;
  instant: boolean;
  maxAmount: number;
  requestingCharge: boolean;
  onSelectAmount: (amount: number) => void;
  onCustomAmount: (value: string) => void;
  onCancel: () => void;
  onNext: () => void;
};

function RechargeAmount({ selectedAmount, customAmount, instant, maxAmount, requestingCharge, onSelectAmount, onCustomAmount, onCancel, onNext }: RechargeAmountProps) {
  const amount = selectedAmount ?? (Number(customAmount) || 0);
  const exceedsMax = amount > maxAmount;
  // 프리셋 목록의 마지막 칸은 고정 금액이 아니라 "최대"(충전 가능 금액 전액 채우기) 버튼으로 둔다.
  const presetTiles = rechargeAmounts.filter((value) => value <= maxAmount).slice(0, -1);
  const isMaxFilled = selectedAmount === null && customAmount === String(maxAmount);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4"><h2 className="text-base font-bold">충전 금액 선택</h2><p className="mt-1 text-sm text-muted">금액을 선택하거나 직접 입력해 주세요. (1회 최대 {won(maxAmount)})</p></div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {presetTiles.map((value) => <button key={value} type="button" onClick={() => onSelectAmount(value)} className={`num min-h-16 rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-20 ${selectedAmount === value ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_2px_4px_var(--market-accent-soft)]" : "border-hairline bg-white text-body hover:border-[var(--market-accent)] hover:text-ink"}`}>{won(value)}</button>)}
        <button type="button" onClick={() => onCustomAmount(String(maxAmount))} disabled={maxAmount === 0} className={`min-h-16 rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-20 disabled:cursor-not-allowed disabled:opacity-40 ${isMaxFilled ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_2px_4px_var(--market-accent-soft)]" : "border-hairline bg-white text-body hover:border-[var(--market-accent)] hover:text-ink"}`}>최대</button>
      </div>
      <label className="mt-3 flex items-center rounded-lg border border-hairline bg-white px-3.5 focus-within:border-[var(--market-accent)] focus-within:ring-2 focus-within:ring-[var(--market-accent-soft)]">
        <input aria-label="직접 충전 금액" value={customAmount} onChange={(event) => onCustomAmount(event.target.value)} inputMode="numeric" placeholder="직접 입력" className="num min-w-0 flex-1 bg-transparent py-3 text-sm font-bold outline-none" />
        <span className="text-sm font-bold text-[#6e6f6f]">원</span>
      </label>
      {exceedsMax && <p role="alert" className="mt-2 text-xs text-up">충전 가능 금액을 초과했습니다. (충전 가능 금액: {won(maxAmount)})</p>}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>
        <button type="button" onClick={onNext} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" disabled={(!selectedAmount && !customAmount) || requestingCharge || exceedsMax}>{instant && requestingCharge ? "충전 중..." : instant ? "충전" : "다음"}</button>
      </div>
    </div>
  );
}

type DeductAmountProps = {
  customAmount: string;
  maxAmount: number;
  requestingCharge: boolean;
  onCustomAmount: (value: string) => void;
  onCancel: () => void;
  onNext: () => void;
};

function DeductAmount({ customAmount, maxAmount, requestingCharge, onCustomAmount, onCancel, onNext }: DeductAmountProps) {
  const amount = Number(customAmount) || 0;
  const exceedsMax = amount > maxAmount;
  // 충전 화면과 동일한 규칙: 프리셋 목록의 마지막 칸은 고정 금액이 아니라 "최대" 버튼으로 둔다.
  const presetTiles = rechargeAmounts.filter((value) => value <= maxAmount).slice(0, -1);
  const isMaxFilled = customAmount === String(maxAmount);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4"><h2 className="text-base font-bold">차감 금액 선택</h2><p className="mt-1 text-sm text-muted">금액을 선택하거나 직접 입력해 주세요. (차감 가능 {won(maxAmount)})</p></div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {presetTiles.map((value) => <button key={value} type="button" onClick={() => onCustomAmount(String(value))} className={`num min-h-16 rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-20 ${customAmount === String(value) ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_2px_4px_var(--market-accent-soft)]" : "border-hairline bg-white text-body hover:border-[var(--market-accent)] hover:text-ink"}`}>{won(value)}</button>)}
        <button type="button" onClick={() => onCustomAmount(String(maxAmount))} disabled={maxAmount === 0} className={`min-h-16 rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-20 disabled:cursor-not-allowed disabled:opacity-40 ${isMaxFilled ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_2px_4px_var(--market-accent-soft)]" : "border-hairline bg-white text-body hover:border-[var(--market-accent)] hover:text-ink"}`}>최대</button>
      </div>
      <label className="mt-3 flex items-center rounded-lg border border-hairline bg-white px-3.5 focus-within:border-[var(--market-accent)] focus-within:ring-2 focus-within:ring-[var(--market-accent-soft)]">
        <input aria-label="직접 차감 금액" value={customAmount} onChange={(event) => onCustomAmount(event.target.value)} inputMode="numeric" placeholder="직접 입력" className="num min-w-0 flex-1 bg-transparent py-3 text-sm font-bold outline-none" />
        <span className="text-sm font-bold text-[#6e6f6f]">원</span>
      </label>
      {exceedsMax && <p role="alert" className="mt-2 text-xs text-up">차감 가능 금액을 초과했습니다. (차감 가능 금액: {won(maxAmount)})</p>}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>
        <button type="button" onClick={onNext} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" disabled={!customAmount || requestingCharge || exceedsMax}>{requestingCharge ? "차감 중..." : "차감"}</button>
      </div>
    </div>
  );
}

function RechargeReason({ amount, reason, onReasonChange, onBack, onRequest }: { amount: number; reason: string; onReasonChange: (value: string) => void; onBack: () => void; onRequest: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-hairline bg-white px-4 py-3">
        <div><p className="text-xs font-semibold text-muted">요청 금액</p><strong className="num mt-1 block text-lg">{won(amount)}</strong></div>
        <span className="theme-accent-soft theme-accent-text rounded-full px-2.5 py-1 text-xs font-bold">2단계 중 2단계</span>
      </div>
      <label className="mb-2 block text-sm font-bold" htmlFor="recharge-reason">충전 목적</label>
      <textarea id="recharge-reason" value={reason} onChange={(event) => onReasonChange(event.target.value)} maxLength={500} className="h-40 w-full resize-none rounded-lg border border-hairline bg-white p-3.5 text-sm leading-6 outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" placeholder="가상캐시가 필요한 목적을 입력해 주세요." />
      <p className="mt-2 text-right text-xs text-muted">{reason.length}/500</p>
      <div className="mt-4 flex justify-end gap-3"><button type="button" onClick={onBack} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">이전</button><button type="button" onClick={onRequest} disabled={!reason.trim()} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">요청</button></div>
    </div>
  );
}

function RechargeHistory({ onBack, onSelect, rechargeHistory }: { onBack: () => void; onSelect: (record: RechargeRecord) => void; rechargeHistory: RechargeRecord[] }) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm font-bold text-muted hover:text-ink">← 계좌 요약으로</button>
      <div className="overflow-x-auto rounded-lg border border-hairline bg-white">
        <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
          <thead className="bg-surface-soft"><tr>{["요청 일시", "구분", "요청 금액", "충전 후 잔액", "처리 상태"].map((head) => <th key={head} className="border-b border-hairline px-3 py-2 text-xs font-semibold text-muted">{head}</th>)}</tr></thead>
          <tbody>{rechargeHistory.map((record) => <tr key={record.id} onClick={() => onSelect(record)} className="cursor-pointer border-b border-hairline last:border-0 hover:bg-surface-soft"><td className="whitespace-nowrap px-3 py-2.5 text-muted">{formatDateTime(record.date)}</td><td className="px-3 py-2.5 font-bold">{record.source === "SELF" ? "셀프 충전" : "관리자 충전"}</td><td className="num px-3 py-2.5 text-right font-bold">+{won(record.amount)}</td><td className="num px-3 py-2.5 text-right font-semibold">{record.balance === null ? "—" : won(record.balance)}</td><td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "승인" ? "bg-emerald-500/10 text-emerald-500" : record.status === "대기" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500"}`}>{record.status}</span></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function RechargeDetail({ record, onBack }: { record: RechargeRecord; onBack: () => void }) {
  const approved = record.status === "승인";
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm font-bold text-muted hover:text-ink">← 충전 이력으로</button>
      <article className="mx-auto max-w-[680px] rounded-lg border border-hairline bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
          <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${approved ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{approved ? <CheckIcon className="h-5 w-5" /> : <CloseIcon className="h-5 w-5" />}</div><div><p className="text-xs font-semibold text-muted">가상캐시 처리 결과</p><h2 className="mt-1 text-lg font-bold">캐시 충전 {approved ? "승인 완료" : "거절"}</h2></div></div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${approved ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{record.status}</span>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <DetailCell label="요청자" value={record.requester} />
          <DetailCell label={approved ? "지급 금액" : "요청 금액"} value={`₩${record.amount.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ff4444]"} />
          <DetailCell label={approved ? "지급 전 잔액" : "현재 잔액"} value="₩0" tone="text-[#ff4444]" />
          <DetailCell label={approved ? "지급 후 잔액" : "누적 지급액"} value={record.balance === null ? "제공되지 않음" : `₩${record.balance.toLocaleString("ko-KR")}`} tone={approved ? "text-[#44cc88]" : "text-[#ffaa44]"} />
          {approved && <DetailCell label="누적 지급 총액" value="₩200,000,000" tone="text-[#ffaa44]" />}
          {approved && <DetailCell label="처리 일시" value={formatDateTime(record.date)} />}
        </div>
        <div className={`mt-4 rounded-lg border-l-4 bg-surface-soft p-3.5 ${approved ? "border-emerald-500" : "border-red-500"}`}><p className="text-xs font-semibold text-muted">{approved ? "관리자 메모" : "거절 사유"}</p><p className="mt-2 text-sm leading-6">{record.note}</p></div>
      </article>
    </div>
  );
}

function DetailCell({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return <div className="rounded-lg border border-hairline bg-surface-soft p-3"><p className="text-xs font-semibold text-muted">{label}</p><p className={`num mt-1 text-sm font-bold ${tone === "text-white" ? "text-ink" : tone}`}>{value}</p></div>;
}
