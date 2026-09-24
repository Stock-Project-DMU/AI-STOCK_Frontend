"use client";

import { EmptyPortfolioIcon } from "@/components/icons/Icon";
import type { OrderHistoryResponse } from "@/lib/api/types";
import { useState } from "react";

type OrdersPanelProps = {
  selectedOrderId: number;
  onSelect: (id: number) => void;
  apiOrders: OrderHistoryResponse[] | null;
  isLoading: boolean;
  error: string;
};

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "-";
const transactionFeeRate = 0;
type OrderFilter = "ALL" | "BUY" | "SELL";

export default function OrdersPanel({ selectedOrderId, onSelect, apiOrders, isLoading, error }: OrdersPanelProps) {
  const [filter, setFilter] = useState<OrderFilter>("ALL");

  if (isLoading) return <div className="flex min-h-[500px] items-center justify-center text-sm font-semibold text-muted">주문 내역을 불러오는 중입니다.</div>;
  if (error) return <div role="alert" className="flex min-h-[500px] items-center justify-center text-sm font-semibold text-red-500">{error}</div>;
  if (!apiOrders?.length) return <EmptyOrders />;

  const displayOrders = apiOrders
    .filter((order) => filter === "ALL" || order.orderType === filter)
    .map((order) => ({
        id: order.orderId,
        orderType: order.orderType,
        name: order.stockName || order.stockCode,
        side: `${order.orderType === "SELL" ? "매도" : "매수"} ${order.status === "EXECUTED" ? "체결" : order.status === "PENDING" ? "대기" : "취소"}`,
        quantity: `${order.quantity.toLocaleString("ko-KR")}주`,
        transactionAmount: (order.execPrice ?? order.orderPrice) * order.quantity,
        price: formatWon((order.execPrice ?? order.orderPrice) * order.quantity),
        averagePrice: formatWon(order.execPrice ?? order.orderPrice),
        orderedAt: formatDate(order.orderedAt),
        executedAt: formatDate(order.executedAt),
        priceType: order.priceType === "MARKET" ? "시장가" : "지정가",
      }));

  const filterItems: { id: OrderFilter; label: string; count: number }[] = [
    { id: "ALL", label: "전체", count: apiOrders.length },
    { id: "BUY", label: "매수", count: apiOrders.filter((order) => order.orderType === "BUY").length },
    { id: "SELL", label: "매도", count: apiOrders.filter((order) => order.orderType === "SELL").length },
  ];

  const selected = displayOrders.find((order) => order.id === selectedOrderId) ?? displayOrders[0];
  if (!selected) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <OrderPanelHeader />
        <section className="overflow-hidden rounded-lg border border-hairline bg-white">
          <OrderListHeader filter={filter} filterItems={filterItems} visibleCount={0} />
          <OrderFilterTabs filter={filter} filterItems={filterItems} onFilterChange={setFilter} />
          <div className="flex min-h-[320px] items-center justify-center bg-surface-soft/40 px-4 text-sm text-muted">선택한 유형의 주문 내역이 없습니다.</div>
        </section>
      </div>
    );
  }

  const isSell = selected.side.startsWith("매도") || selected.side === "판매완료";
  const feeAmount = Math.floor(selected.transactionAmount * transactionFeeRate / 100);
  const detailRows = [
    ["1주 평균 체결가", selected.averagePrice],
    ["체결 수량", selected.quantity],
    ["총 체결 금액", selected.price],
    ["주문 시간", selected.orderedAt],
    ["체결 시간", selected.executedAt],
    ["주문 유형", selected.priceType],
    ["거래 수수료", `${formatWon(feeAmount)} (${transactionFeeRate.toFixed(2)}%)`],
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <OrderPanelHeader />
      <div className="cq-orders-layout grid min-h-[420px] gap-3">
        <section className="overflow-hidden rounded-lg border border-hairline bg-white">
          <OrderListHeader filter={filter} filterItems={filterItems} visibleCount={displayOrders.length} />
          <OrderFilterTabs filter={filter} filterItems={filterItems} onFilterChange={setFilter} />
          <div className="hidden grid-cols-[minmax(0,1fr)_90px_130px] border-b border-hairline px-4 py-2 text-xs font-semibold text-muted sm:grid"><span>종목 / 주문 구분</span><span>수량</span><span className="text-right">체결 금액</span></div>
          <div className="divide-y divide-gray-200">
            {displayOrders.map((order) => (
              <button key={order.id} type="button" onClick={() => onSelect(order.id)} className={`relative grid w-full grid-cols-[minmax(0,1fr)_70px_110px] items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors sm:grid-cols-[minmax(0,1fr)_90px_130px] ${selected.id === order.id ? "theme-accent-soft" : "bg-white hover:bg-surface-soft"}`}>
                {selected.id === order.id && <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--market-accent)]" />}
                <span><strong className="block font-bold">{order.name}</strong><small className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[12px] font-bold ${order.side.startsWith("매도") || order.side === "판매완료" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{order.side}</small></span>
                <span className="num font-semibold">{order.quantity}</span><span className="num text-right font-bold">{order.price}</span>
              </button>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 border-b border-hairline pb-4"><div><p className="text-xs font-semibold text-muted">선택 주문</p><h2 className="mt-1 text-lg font-bold">{selected.name}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isSell ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{selected.side}</span></div>
          <dl className="mt-2 divide-y divide-gray-200">{detailRows.map(([label, value]) => <div key={label} className="grid grid-cols-[1fr_auto] gap-4 py-2 text-sm"><dt className="text-muted">{label}</dt><dd className="num text-right font-bold">{value}</dd></div>)}</dl>
          <div className="theme-accent-soft mt-4 rounded-lg p-3.5"><p className="text-xs font-semibold text-muted">주문 결과</p><p className="theme-accent-text mt-1 text-sm font-bold">{selected.side}</p></div>
        </aside>
      </div>
    </div>
  );
}

type OrderFilterItem = { id: OrderFilter; label: string; count: number };

function OrderPanelHeader() {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold">주문내역</h1>
      <p className="mt-1 text-sm text-muted">매수와 매도 주문을 구분해 확인할 수 있습니다.</p>
    </div>
  );
}

function OrderListHeader({ filter, filterItems, visibleCount }: { filter: OrderFilter; filterItems: OrderFilterItem[]; visibleCount: number }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-surface-soft px-4 py-3">
      <div>
        <h2 className="font-bold">주문 목록</h2>
        <p className="mt-1 text-xs text-muted">{filterItems.find((item) => item.id === filter)?.label} {visibleCount}건</p>
      </div>
      <span className="shrink-0 rounded-full border border-hairline bg-white px-2.5 py-1 text-xs font-bold text-muted">수수료율 {transactionFeeRate.toFixed(2)}%</span>
    </div>
  );
}

function OrderFilterTabs({ filter, filterItems, onFilterChange }: { filter: OrderFilter; filterItems: OrderFilterItem[]; onFilterChange: (filter: OrderFilter) => void }) {
  return (
    <nav className="flex border-y border-hairline bg-white px-2 sm:px-4" aria-label="주문 유형 필터">
      {filterItems.map((item) => {
        const isActive = filter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onFilterChange(item.id)}
            className={`relative flex min-w-0 items-center gap-1.5 px-3 py-3 text-sm font-bold transition-colors ${isActive ? "theme-accent-text" : "text-muted hover:text-ink"}`}
          >
            <span>{item.label}</span>
            <span className={`num rounded-full px-1.5 py-0.5 text-[11px] leading-none ${isActive ? "theme-accent-soft theme-accent-text" : "bg-surface-soft text-muted"}`}>{item.count}</span>
            {isActive && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--market-accent)]" />}
          </button>
        );
      })}
    </nav>
  );
}

export function EmptyOrders() {
  return <div className="flex min-h-[500px] flex-col items-center justify-center gap-4"><EmptyPortfolioIcon /><p className="font-medium">주문 내역이 없습니다</p></div>;
}
