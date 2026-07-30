"use client";

import { useState } from "react";
import type { OrderTab } from "../types";

const orderTabs: { id: OrderTab; label: string }[] = [
    { id: "buy", label: "매수" },
    { id: "sell", label: "매도" },
    { id: "pending", label: "미체결" },
];

export default function TradePanel() {
    const [tab, setTab] = useState<OrderTab>("buy");
    const [price, setPrice] = useState(191_500);
    const [quantity, setQuantity] = useState(10);
    const accent = tab === "sell" ? "blue" : "red";

    return (
        <aside className="self-start overflow-hidden rounded-lg border border-hairline bg-canvas xl:sticky xl:top-4">
            <div className="border-b border-hairline px-4 py-3">
                <div className="flex items-center justify-between"><h2 className="font-bold text-ink">주식 주문</h2><span className="rounded-xs bg-surface-strong px-2 py-1 text-[10px] text-muted">일반계좌</span></div>
                <div className="mt-3 grid grid-cols-3 rounded-lg bg-surface-soft p-1">
                    {orderTabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
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
                <PendingOrders />
            ) : (
                <div className="p-4">
                    <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-surface-soft p-2.5"><p className="text-[10px] text-muted">주문 가능</p><strong className="num mt-1 block text-sm text-ink">₩6,066,700</strong></div>
                        <div className="rounded-lg bg-surface-soft p-2.5"><p className="text-[10px] text-muted">최대 가능</p><strong className="num mt-1 block text-sm text-ink">31주</strong></div>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <SelectLike label="주문 유형" value="일반 주문" />
                            <SelectLike label="주문 방식" value="지정가" />
                        </div>
                        <Counter label={tab === "buy" ? "매수가격" : "매도가격"} value={price.toLocaleString("ko-KR")} unit="원" onMinus={() => setPrice((value) => Math.max(0, value - 500))} onPlus={() => setPrice((value) => value + 500)} />
                        <Counter label="수량" value={String(quantity)} unit="주" onMinus={() => setQuantity((value) => Math.max(1, value - 1))} onPlus={() => setQuantity((value) => value + 1)} />

                        <div className="grid grid-cols-4 gap-1.5">
                            {[10, 25, 50, 100].map((percent) => <button key={percent} type="button" onClick={() => setQuantity(Math.max(1, Math.floor((31 * percent) / 100)))} className="rounded-md border border-hairline bg-surface-soft py-1.5 text-[10px] font-semibold text-muted hover:border-muted-soft hover:text-ink">{percent === 100 ? "최대" : `${percent}%`}</button>)}
                        </div>

                        <div className="rounded-lg border border-hairline bg-surface-soft p-3">
                            <div className="flex justify-between text-muted"><span>주문 가격</span><span className="num">{price.toLocaleString("ko-KR")}원</span></div>
                            <div className="mt-2 flex justify-between text-muted"><span>주문 수량</span><span className="num">{quantity}주</span></div>
                            <div className="mt-3 flex items-end justify-between border-t border-hairline pt-3"><span className="font-semibold text-body">총 주문 금액</span><strong className={`num text-lg ${accent === "red" ? "text-up" : "text-down"}`}>₩{(price * quantity).toLocaleString("ko-KR")}</strong></div>
                        </div>

                        <button type="button" className={`trade-action-button w-full rounded-lg py-3.5 text-sm font-black transition-transform active:scale-[0.99] ${tab === "buy" ? "bg-[var(--market-up)]" : "bg-[var(--market-down)]"}`}>{tab === "buy" ? "삼성전자 매수하기" : "삼성전자 매도하기"}</button>

                        <Portfolio tab={tab} />
                    </div>
                </div>
            )}
        </aside>
    );
}

function SelectLike({ label, value }: { label: string; value: string }) {
    return <button type="button" className="rounded-lg border border-hairline bg-surface-soft p-2.5 text-left"><span className="block text-[10px] text-muted">{label}</span><strong className="mt-1 flex justify-between text-xs text-ink">{value}<span className="text-muted">⌄</span></strong></button>;
}

function Counter({ label, value, unit, onMinus, onPlus }: { label: string; value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
    return <div><div className="mb-1.5 flex justify-between"><span className="font-semibold text-body">{label}</span><span className="num text-[10px] text-muted">현재가 191,000원</span></div><div className="flex items-center rounded-lg border border-hairline bg-surface-soft px-3 py-2.5 focus-within:border-muted-soft"><strong className="num flex-1 text-base text-ink">{value}</strong><span className="mr-3 text-muted">{unit}</span><button type="button" onClick={onMinus} aria-label={`${label} 감소`} className="h-6 w-6 rounded-md border border-hairline text-muted hover:bg-surface-strong hover:text-ink">−</button><button type="button" onClick={onPlus} aria-label={`${label} 증가`} className="ml-1 h-6 w-6 rounded-md border border-hairline text-muted hover:bg-surface-strong hover:text-ink">＋</button></div></div>;
}

function Portfolio({ tab }: { tab: Exclude<OrderTab, "pending"> }) {
    return <div className="border-t border-hairline pt-3"><div className="flex justify-between text-ink"><strong>내 보유 현황</strong><span className="text-[10px] text-muted">실시간 평가</span></div>{tab === "buy" ? <p className="mt-4 rounded-lg border border-dashed border-hairline py-5 text-center text-[11px] text-muted">신규 매수 가능한 종목입니다</p> : <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[11px]"><dt className="text-muted">보유 수량</dt><dd className="num text-right font-bold text-ink">10주</dd><dt className="text-muted">평균 매입가</dt><dd className="num text-right text-ink">191,500원</dd><dt className="text-muted">평가 손익</dt><dd className="num text-right font-bold text-down">-5,000원</dd></dl>}</div>;
}

function PendingOrders() {
    return <div className="p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink">미체결 주문</h3><span className="rounded-pill bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-500">2건</span></div><div className="mt-3 space-y-2.5"><PendingOrder name="삼성전자" price="191,500원" quantity="100주" method="시장가" side="매수" /><PendingOrder name="현대미포조선" price="23,123원" quantity="1,000주" method="지정가" side="매수" /></div></div>;
}

function PendingOrder({ name, price, quantity, method, side }: { name: string; price: string; quantity: string; method: string; side: string }) {
    return <article className="rounded-lg border border-hairline bg-surface-soft p-3 text-[11px]"><div className="flex justify-between"><div><span className="mr-2 rounded-xs bg-[rgba(207,32,47,0.12)] px-2 py-1 font-bold text-up">{side}</span><strong className="text-ink">{name}</strong></div><button type="button" className="text-muted hover:text-up">주문취소</button></div><dl className="mt-3 grid grid-cols-2 gap-y-2"><dt className="text-muted">주문 가격</dt><dd className="num text-right font-bold text-ink">{price}</dd><dt className="text-muted">수량</dt><dd className="num text-right text-ink">{quantity}</dd><dt className="text-muted">주문 방식</dt><dd className="text-right text-ink">{method}</dd></dl></article>;
}
