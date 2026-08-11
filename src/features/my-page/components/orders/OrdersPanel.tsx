import { EmptyPortfolioIcon } from "@/components/icons/Icon";
import { orders } from "../../data";
import type { OrderHistoryResponse } from "@/lib/api/types";

type OrdersPanelProps = {
  selectedOrderId: number;
  onSelect: (id: number) => void;
  apiOrders: OrderHistoryResponse[] | null;
  isLoading: boolean;
  error: string;
};

const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "-";

export default function OrdersPanel({ selectedOrderId, onSelect, apiOrders, isLoading, error }: OrdersPanelProps) {
  if (isLoading) return <div className="flex min-h-[500px] items-center justify-center text-sm font-semibold text-muted">주문 내역을 불러오는 중입니다.</div>;
  if (error) return <div role="alert" className="flex min-h-[500px] items-center justify-center text-sm font-semibold text-red-500">{error}</div>;
  if (apiOrders?.length === 0) return <EmptyOrders />;

  const displayOrders = apiOrders
    ? apiOrders.map((order) => ({
        id: order.orderId,
        name: order.stockName || order.stockCode,
        side: `${order.orderType === "SELL" ? "매도" : "매수"} ${order.status === "EXECUTED" ? "체결" : order.status === "PENDING" ? "대기" : "취소"}`,
        quantity: `${order.quantity.toLocaleString("ko-KR")}주`,
        price: formatWon((order.execPrice ?? order.orderPrice) * order.quantity),
        averagePrice: formatWon(order.execPrice ?? order.orderPrice),
        orderedAt: formatDate(order.orderedAt),
        executedAt: formatDate(order.executedAt),
        priceType: order.priceType === "MARKET" ? "시장가" : "지정가",
      }))
    : orders.map((order) => ({ ...order, averagePrice: "1,000,000원", orderedAt: "2026.05.04 16:44", executedAt: "2026.05.04 16:46", priceType: "지정가" }));

  const selected = displayOrders.find((order) => order.id === selectedOrderId) ?? displayOrders[0];
  const isSell = selected.side.startsWith("매도") || selected.side === "판매완료";
  const detailRows = [
    ["1주 평균 체결가", selected.averagePrice],
    ["체결 수량", selected.quantity],
    ["총 체결 금액", selected.price],
    ["주문 시간", selected.orderedAt],
    ["체결 시간", selected.executedAt],
    ["주문 유형", selected.priceType],
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4"><h1 className="text-xl font-extrabold">주문내역</h1></div>
      <div className="grid min-h-[420px] gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-lg border border-hairline">
          <div className="flex items-center justify-between border-b border-hairline bg-surface-soft px-4 py-3"><div><h2 className="font-bold">주문 목록</h2><p className="mt-1 text-xs text-muted">총 {displayOrders.length}건</p></div><span className="theme-accent-soft theme-accent-text rounded-full px-2.5 py-1 text-xs font-bold">전체</span></div>
          <div className="hidden grid-cols-[minmax(0,1fr)_90px_130px] border-b border-hairline px-4 py-2 text-xs font-semibold text-muted sm:grid"><span>종목 / 주문 구분</span><span>수량</span><span className="text-right">체결 금액</span></div>
          <div className="divide-y divide-gray-200">
            {displayOrders.map((order) => (
              <button key={order.id} type="button" onClick={() => onSelect(order.id)} className={`relative grid w-full grid-cols-[minmax(0,1fr)_70px_110px] items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors sm:grid-cols-[minmax(0,1fr)_90px_130px] ${selectedOrderId === order.id ? "theme-accent-soft" : "bg-white hover:bg-surface-soft"}`}>
                {selectedOrderId === order.id && <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--market-accent)]" />}
                <span><strong className="block font-bold">{order.name}</strong><small className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[12px] font-bold ${order.side.startsWith("매도") || order.side === "판매완료" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{order.side}</small></span>
                <span className="num font-semibold">{order.quantity}</span><span className="num text-right font-extrabold">{order.price}</span>
              </button>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 border-b border-hairline pb-4"><div><p className="text-xs font-semibold text-muted">선택 주문</p><h2 className="mt-1 text-lg font-extrabold">{selected.name}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isSell ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>{selected.side}</span></div>
          <dl className="mt-2 divide-y divide-gray-200">{detailRows.map(([label, value]) => <div key={label} className="grid grid-cols-[1fr_auto] gap-4 py-2 text-sm"><dt className="text-muted">{label}</dt><dd className="num text-right font-bold">{value}</dd></div>)}</dl>
          <div className="theme-accent-soft mt-4 rounded-lg p-3.5"><p className="text-xs font-semibold text-muted">주문 결과</p><p className="theme-accent-text mt-1 text-sm font-bold">{selected.side}</p></div>
        </aside>
      </div>
    </div>
  );
}

export function EmptyOrders() {
  return <div className="flex min-h-[500px] flex-col items-center justify-center gap-4"><EmptyPortfolioIcon /><p className="font-medium">주문 내역이 없습니다</p></div>;
}
