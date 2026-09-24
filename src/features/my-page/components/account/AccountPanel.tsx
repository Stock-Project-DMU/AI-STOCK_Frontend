import { CheckIcon, CloseIcon } from "@/components/icons/Icon";
import { rechargeAmounts, won } from "../../data";
import type { AccountView, RechargeRecord } from "../../model";
import type { AccountInfoResponse, ProfitResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format/dateTime";

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
  onSelectHistory: (record: RechargeRecord) => void;
  onResetRequest: () => void;
  accounts: AccountInfoResponse[] | null;
  profit: ProfitResponse | null;
  realizedProfit: number;
  isLoading: boolean;
  error: string;
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
  onSelectHistory,
  onResetRequest,
  accounts,
  profit,
  realizedProfit,
  isLoading,
  error,
}: AccountPanelProps) {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{mode === "info" ? "계좌 정보" : "가상계좌 충전"}</h1>
          <p className="mt-1 text-sm text-muted">{mode === "info" ? "계좌 상태와 적용 정책, 누적 수익을 확인할 수 있습니다." : "가상캐시 충전을 요청하고 처리 이력을 확인할 수 있습니다."}</p>
        </div>
        {mode === "recharge" && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onViewChange("history")} className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${view === "history" || view === "detail" ? "theme-accent-soft border-[var(--market-accent)] theme-accent-text" : "border-hairline hover:bg-surface-soft"}`}>충전 이력</button>
            <button type="button" onClick={() => onViewChange("recharge")} className={`rounded-lg px-3.5 py-2 text-sm font-bold ${view === "recharge" || view === "reason" ? "theme-accent-bg" : "border border-hairline hover:bg-surface-soft"}`}>충전 요청</button>
          </div>
        )}
      </div>

      <div className="min-h-[360px] rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
        {mode === "info" && <AccountSummary accounts={accounts} profit={profit} realizedProfit={realizedProfit} isLoading={isLoading} error={error} />}
        {mode === "recharge" && view === "recharge" && <RechargeAmount selectedAmount={selectedAmount} customAmount={customAmount} onSelectAmount={onSelectAmount} onCustomAmount={onCustomAmount} onCancel={onResetRequest} onNext={() => requestedAmount > 0 && onViewChange("reason")} />}
        {mode === "recharge" && view === "reason" && <RechargeReason amount={requestedAmount} reason={reason} onReasonChange={onReasonChange} onBack={() => onViewChange("recharge")} onRequest={onRequest} />}
        {mode === "recharge" && view === "history" && <RechargeHistory rechargeHistory={chargeHistory} onBack={() => onViewChange("recharge")} onSelect={onSelectHistory} />}
        {mode === "recharge" && view === "detail" && selectedHistory && <RechargeDetail record={selectedHistory} onBack={() => onViewChange("history")} />}
      </div>
      {requestingCharge && <p role="status">충전 요청 중...</p>}
      {mode === "recharge" && error && <p role="alert" className="mt-3 text-red-500">{error}</p>}
    </div>
  );
}

function AccountSummary({ accounts, profit, realizedProfit, isLoading, error }: { accounts: AccountInfoResponse[] | null; profit: ProfitResponse | null; realizedProfit: number; isLoading: boolean; error: string }) {
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
    { label: "자동 충전 사용", value: `${account.chargeCount}/3회` },
  ];
  const accountDetails = [
    { label: "예치 이자율", value: "연 0.00%" },
    { label: "거래 수수료", value: "0.00%" },
    { label: "누적 판매 수익", value: won(realizedProfit), tone: realizedProfit > 0 ? "text-red-500" : realizedProfit < 0 ? "text-blue-500" : "" },
    { label: "누적 배당금", value: won(0) },
    { label: "누적 이자", value: won(0) },
  ];

  return (
    <article className="overflow-hidden rounded-xl border border-hairline bg-white shadow-[0_6px_20px_rgba(10,11,13,.04)]">
      <header className="theme-accent-soft px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted">{account.accountName}</p>
            <p className="num mt-1.5 text-base font-bold tracking-[0.06em] sm:text-lg">{account.accountNumber}</p>
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
          <p className="mt-4 rounded-lg bg-surface-soft px-3.5 py-3 text-xs leading-5 text-muted">현재 모의투자에서는 예치 이자와 배당금이 지급되지 않으며, 거래 수수료도 부과되지 않습니다.</p>
        </section>
      </div>
    </article>
  );
}

type RechargeAmountProps = {
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmount: (value: string) => void;
  onCancel: () => void;
  onNext: () => void;
};

function RechargeAmount({ selectedAmount, customAmount, onSelectAmount, onCustomAmount, onCancel, onNext }: RechargeAmountProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4"><h2 className="text-base font-bold">충전 금액 선택</h2><p className="mt-1 text-sm text-muted">금액을 선택하거나 직접 입력해 주세요.</p></div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {rechargeAmounts.map((amount) => <button key={amount} type="button" onClick={() => onSelectAmount(amount)} className={`num min-h-16 rounded-lg border px-2 text-sm font-bold transition-colors sm:min-h-20 ${selectedAmount === amount ? "theme-accent-bg border-[var(--market-accent)] shadow-[0_2px_4px_var(--market-accent-soft)]" : "border-hairline bg-white text-body hover:border-[var(--market-accent)] hover:text-ink"}`}>{won(amount)}</button>)}
      </div>
      <label className="mt-3 flex items-center rounded-lg border border-hairline bg-white px-3.5 focus-within:border-[var(--market-accent)] focus-within:ring-2 focus-within:ring-[var(--market-accent-soft)]">
        <input aria-label="직접 충전 금액" value={customAmount} onChange={(event) => onCustomAmount(event.target.value)} inputMode="numeric" placeholder="직접 입력" className="num min-w-0 flex-1 bg-transparent py-3 text-sm font-bold outline-none" />
        <span className="text-sm font-bold text-[#6e6f6f]">원</span>
      </label>
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>
        <button type="button" onClick={onNext} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" disabled={!selectedAmount && !customAmount}>다음</button>
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
      <textarea id="recharge-reason" value={reason} onChange={(event) => onReasonChange(event.target.value)} className="h-40 w-full resize-none rounded-lg border border-hairline bg-white p-3.5 text-sm leading-6 outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" placeholder="가상캐시가 필요한 목적을 입력해 주세요." />
      <p className="mt-2 text-right text-xs text-muted">{reason.length}자</p>
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
          <thead className="bg-surface-soft"><tr>{["요청 일시", "유형", "요청 금액", "충전 전 잔액", "처리 상태"].map((head) => <th key={head} className="border-b border-hairline px-3 py-2 text-xs font-semibold text-muted">{head}</th>)}</tr></thead>
          <tbody>{rechargeHistory.map((record) => <tr key={record.id} onClick={() => onSelect(record)} className="cursor-pointer border-b border-hairline last:border-0 hover:bg-surface-soft"><td className="whitespace-nowrap px-3 py-2.5 text-muted">{formatDateTime(record.date)}</td><td className="px-3 py-2.5 font-bold">{record.type}</td><td className="num px-3 py-2.5 text-right font-bold">+{won(record.amount)}</td><td className="num px-3 py-2.5 text-right font-semibold">{record.balance === null ? "—" : won(record.balance)}</td><td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "승인" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{record.status}</span></td></tr>)}</tbody>
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
