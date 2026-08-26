"use client";

import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api/client";
import { cancelOrder, createOrder } from "@/lib/api/portfolio";
import type {
    AccountInfoResponse,
    HoldingResponse,
    OrderHistoryResponse,
    StockPriceResponse,
} from "@/lib/api/types";
import type { OrderTab } from "../types";

const orderTabs: { id: OrderTab; label: string }[] = [
    { id: "buy", label: "매수" },
    { id: "sell", label: "매도" },
    { id: "pending", label: "미체결" },
];

type TradePanelProps = {
    stock?: StockPriceResponse | null;
    account?: AccountInfoResponse | null;
    orders?: OrderHistoryResponse[] | null;
    holdings?: HoldingResponse[] | null;
    onTradingDataChanged?: () => Promise<void>;
};

export default function TradePanel({ stock, account, orders, holdings, onTradingDataChanged }: TradePanelProps) {
    const [tab, setTab] = useState<OrderTab>("buy");
    const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const price = selectedPrice ?? stock?.currentPrice ?? 191_500;
    const stockCode = stock?.stockCode ?? "005930";
    const stockName = stock?.stockName ?? "삼성전자";
    const holding = holdings?.find((item) => item.stockCode === stockCode) ?? null;
    const maximumQuantity = tab === "sell" ? holding?.quantity ?? 0 : Math.floor((account?.balance ?? 0) / Math.max(price, 1));
    const pendingOrders = orders?.filter((order) => order.status === "PENDING") ?? null;
    const accent = tab === "sell" ? "blue" : "red";

    async function handleOrder() {
        if (!account || !stock) {
            setRequestError("계좌와 종목 정보를 불러온 뒤 주문할 수 있습니다.");
            return;
        }

        setIsSubmitting(true);
        setRequestError("");
        setRequestMessage("");

        try {
            await createOrder({
                accountId: account.accountId,
                stockCode: stock.stockCode,
                orderType: tab === "buy" ? "BUY" : "SELL",
                quantity,
                priceType: "LIMIT",
                orderPrice: price,
            });
            await onTradingDataChanged?.();
            setRequestMessage(`${stockName} ${tab === "buy" ? "매수" : "매도"} 주문이 접수되었습니다.`);
        } catch (error) {
            setRequestError(getApiErrorMessage(error, "주문 처리에 실패했습니다."));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleCancel(orderId: number) {
        setIsSubmitting(true);
        setRequestError("");
        setRequestMessage("");

        try {
            await cancelOrder(orderId);
            await onTradingDataChanged?.();
            setRequestMessage("주문이 취소되었습니다.");
        } catch (error) {
            setRequestError(getApiErrorMessage(error, "주문 취소에 실패했습니다."));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <aside className="self-start overflow-hidden rounded-lg border border-hairline bg-canvas xl:sticky xl:top-4">
            <div className="border-b border-hairline px-4 py-3">
                <div className="flex items-center justify-between"><h2 className="font-bold text-ink">주식 주문</h2><span className="rounded-xs bg-surface-strong px-2 py-1 text-[12px] text-muted">{account?.accountName ?? "계좌 정보 없음"}</span></div>
                <div className="mt-3 grid grid-cols-3 rounded-lg bg-surface-soft p-1">
                    {orderTabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setTab(item.id);
                                setRequestError("");
                                setRequestMessage("");
                            }}
                            className={`rounded-md py-2 text-xs font-bold transition-all ${
                                tab === item.id
                                    ? item.id === "buy"
                                        ? "trade-action-button bg-[var(--market-up)]"
                                        : item.id === "sell"
                                          ? "trade-action-button bg-[var(--market-down)]"
                                          : "trade-action-button bg-emerald-500"
                                    : "text-muted hover:text-ink"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "pending" ? (
                <PendingOrders orders={pendingOrders} isSubmitting={isSubmitting} onCancel={handleCancel} />
            ) : (
                <div className="p-4">
                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-surface-soft p-2.5"><p className="text-[12px] text-muted">주문 가능</p><strong className="num mt-1 block text-sm text-ink">₩{(account?.balance ?? 0).toLocaleString("ko-KR")}</strong></div>
                        <div className="rounded-lg bg-surface-soft p-2.5"><p className="text-[12px] text-muted">최대 가능</p><strong className="num mt-1 block text-sm text-ink">{maximumQuantity.toLocaleString("ko-KR")}주</strong></div>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <SelectLike label="주문 유형" value="일반 주문" />
                            <SelectLike label="주문 방식" value="지정가" />
                        </div>
                        <Counter label={tab === "buy" ? "매수가격" : "매도가격"} currentPrice={stock?.currentPrice ?? 0} value={price.toLocaleString("ko-KR")} unit="원" onMinus={() => setSelectedPrice(Math.max(0, price - 500))} onPlus={() => setSelectedPrice(price + 500)} />
                        <Counter label="수량" currentPrice={stock?.currentPrice ?? 0} value={String(quantity)} unit="주" onMinus={() => setQuantity((value) => Math.max(1, value - 1))} onPlus={() => setQuantity((value) => value + 1)} />

                        <div className="grid grid-cols-4 gap-1.5">
                            {[10, 25, 50, 100].map((percent) => <button key={percent} type="button" onClick={() => setQuantity(Math.max(1, Math.floor((maximumQuantity * percent) / 100)))} className="rounded-md border border-hairline bg-surface-soft py-1.5 text-[12px] font-semibold text-muted hover:border-muted-soft hover:text-ink">{percent === 100 ? "최대" : `${percent}%`}</button>)}
                        </div>

                        <div className="rounded-lg border border-hairline bg-surface-soft p-3">
                            <div className="flex justify-between text-muted"><span>주문 가격</span><span className="num">{price.toLocaleString("ko-KR")}원</span></div>
                            <div className="mt-2 flex justify-between text-muted"><span>주문 수량</span><span className="num">{quantity}주</span></div>
                            <div className="mt-3 flex items-end justify-between border-t border-hairline pt-3"><span className="font-semibold text-body">총 주문 금액</span><strong className={`num text-lg ${accent === "red" ? "text-up" : "text-down"}`}>₩{(price * quantity).toLocaleString("ko-KR")}</strong></div>
                        </div>

                        {requestError && <p className="rounded-md bg-red-500/10 px-3 py-2 text-[12px] text-up">{requestError}</p>}
                        {requestMessage && <p className="rounded-md bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-600">{requestMessage}</p>}

                        <button type="button" onClick={handleOrder} disabled={isSubmitting || !account || !stock || quantity < 1 || price < 1} className={`trade-action-button w-full rounded-lg py-3.5 text-sm font-bold transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${tab === "buy" ? "bg-[var(--market-up)]" : "bg-[var(--market-down)]"}`}>{isSubmitting ? "처리 중..." : `${stockName} ${tab === "buy" ? "매수하기" : "매도하기"}`}</button>

                        <Portfolio tab={tab} holding={holding} />
                    </div>
                </div>
            )}

            {tab === "pending" && requestError && <p className="mx-4 mb-4 rounded-md bg-red-500/10 px-3 py-2 text-[12px] text-up">{requestError}</p>}
            {tab === "pending" && requestMessage && <p className="mx-4 mb-4 rounded-md bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-600">{requestMessage}</p>}
        </aside>
    );
}

function SelectLike({ label, value }: { label: string; value: string }) {
    return <div className="rounded-lg border border-hairline bg-surface-soft p-2.5 text-left"><span className="block text-[12px] text-muted">{label}</span><strong className="mt-1 block text-xs text-ink">{value}</strong></div>;
}

function Counter({ label, currentPrice, value, unit, onMinus, onPlus }: { label: string; currentPrice: number; value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
    return <div><div className="mb-1.5 flex justify-between"><span className="font-semibold text-body">{label}</span><span className="num text-[12px] text-muted">현재가 {currentPrice.toLocaleString("ko-KR")}원</span></div><div className="flex items-center rounded-lg border border-hairline bg-surface-soft px-3 py-2.5 focus-within:border-muted-soft"><strong className="num flex-1 text-base text-ink">{value}</strong><span className="mr-3 text-muted">{unit}</span><button type="button" onClick={onMinus} aria-label={`${label} 감소`} className="h-6 w-6 rounded-md border border-hairline text-muted hover:bg-surface-strong hover:text-ink">−</button><button type="button" onClick={onPlus} aria-label={`${label} 증가`} className="ml-1 h-6 w-6 rounded-md border border-hairline text-muted hover:bg-surface-strong hover:text-ink">＋</button></div></div>;
}

function Portfolio({ tab, holding }: { tab: Exclude<OrderTab, "pending">; holding: HoldingResponse | null }) {
    return <div className="border-t border-hairline pt-3"><div className="flex justify-between text-ink"><strong>내 보유 현황</strong><span className="text-[12px] text-muted">실시간 평가</span></div>{!holding ? <p className="mt-4 rounded-lg border border-dashed border-hairline py-5 text-center text-[12px] text-muted">{tab === "buy" ? "신규 매수 가능한 종목입니다" : "보유 중인 수량이 없습니다"}</p> : <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[12px]"><dt className="text-muted">보유 수량</dt><dd className="num text-right font-bold text-ink">{holding.quantity.toLocaleString("ko-KR")}주</dd><dt className="text-muted">평균 매입가</dt><dd className="num text-right text-ink">{holding.avgPrice.toLocaleString("ko-KR")}원</dd><dt className="text-muted">평가 손익</dt><dd className={`num text-right font-bold ${holding.evaluationProfit >= 0 ? "text-up" : "text-down"}`}>{holding.evaluationProfit.toLocaleString("ko-KR")}원</dd></dl>}</div>;
}

function PendingOrders({ orders, isSubmitting, onCancel }: { orders: OrderHistoryResponse[] | null; isSubmitting: boolean; onCancel: (orderId: number) => Promise<void> }) {
    if (orders === null) {
        return <div className="p-4 text-center text-[12px] text-muted">미체결 주문을 불러오는 중입니다.</div>;
    }

    return <div className="p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink">미체결 주문</h3><span className="rounded-pill bg-emerald-500/10 px-2 py-1 text-[12px] font-bold text-emerald-500">{orders.length}건</span></div>{orders.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-hairline py-5 text-center text-[12px] text-muted">미체결 주문이 없습니다.</p> : <div className="mt-3 space-y-2.5">{orders.map((order) => <PendingOrder key={order.orderId} order={order} disabled={isSubmitting} onCancel={onCancel} />)}</div>}</div>;
}

function PendingOrder({ order, disabled, onCancel }: { order: OrderHistoryResponse; disabled: boolean; onCancel: (orderId: number) => Promise<void> }) {
    const isBuy = order.orderType === "BUY";
    return <article className="rounded-lg border border-hairline bg-surface-soft p-3 text-[12px]"><div className="flex justify-between"><div><span className={`mr-2 rounded-xs px-2 py-1 font-bold ${isBuy ? "bg-[rgba(207,32,47,0.12)] text-up" : "bg-blue-500/10 text-down"}`}>{isBuy ? "매수" : "매도"}</span><strong className="text-ink">{order.stockName}</strong></div><button type="button" disabled={disabled} onClick={() => void onCancel(order.orderId)} className="text-muted hover:text-up disabled:cursor-not-allowed disabled:opacity-50">주문취소</button></div><dl className="mt-3 grid grid-cols-2 gap-y-2"><dt className="text-muted">주문 가격</dt><dd className="num text-right font-bold text-ink">{order.orderPrice.toLocaleString("ko-KR")}원</dd><dt className="text-muted">수량</dt><dd className="num text-right text-ink">{order.quantity.toLocaleString("ko-KR")}주</dd><dt className="text-muted">주문 방식</dt><dd className="text-right text-ink">{order.priceType === "LIMIT" ? "지정가" : "시장가"}</dd></dl></article>;
}
