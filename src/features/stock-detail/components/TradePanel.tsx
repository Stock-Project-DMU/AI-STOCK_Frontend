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
        <aside className="self-start overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726] shadow-xl shadow-black/20 xl:sticky xl:top-4">
            <div className="border-b border-slate-800 px-5 py-4">
                <div className="flex items-center justify-between"><h2 className="font-bold">주식 주문</h2><span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-400">일반계좌</span></div>
                <div className="mt-4 grid grid-cols-3 rounded-xl bg-slate-900 p-1">
                    {orderTabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                                tab === item.id
                                    ? item.id === "buy"
                                        ? "trade-action-button bg-red-500 text-white shadow-lg shadow-red-950/40"
                                        : item.id === "sell"
                                          ? "trade-action-button bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                                          : "trade-action-button bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
                                    : "text-slate-500 hover:text-slate-200"
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
                <div className="p-5">
                    <div className="mb-5 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-900/80 p-3"><p className="text-[10px] text-slate-600">주문 가능</p><strong className="mt-1 block text-sm tabular-nums">₩6,066,700</strong></div>
                        <div className="rounded-xl bg-slate-900/80 p-3"><p className="text-[10px] text-slate-600">최대 가능</p><strong className="mt-1 block text-sm tabular-nums">31주</strong></div>
                    </div>

                    <div className="space-y-5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <SelectLike label="주문 유형" value="일반 주문" />
                            <SelectLike label="주문 방식" value="지정가" />
                        </div>
                        <Counter label={tab === "buy" ? "매수가격" : "매도가격"} value={price.toLocaleString("ko-KR")} unit="원" onMinus={() => setPrice((value) => Math.max(0, value - 500))} onPlus={() => setPrice((value) => value + 500)} />
                        <Counter label="수량" value={String(quantity)} unit="주" onMinus={() => setQuantity((value) => Math.max(1, value - 1))} onPlus={() => setQuantity((value) => value + 1)} />

                        <div className="grid grid-cols-4 gap-1.5">
                            {[10, 25, 50, 100].map((percent) => <button key={percent} type="button" onClick={() => setQuantity(Math.max(1, Math.floor((31 * percent) / 100)))} className="rounded-lg border border-slate-700 bg-slate-900 py-2 text-[10px] font-semibold text-slate-400 hover:border-slate-500 hover:text-white">{percent === 100 ? "최대" : `${percent}%`}</button>)}
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                            <div className="flex justify-between text-slate-500"><span>주문 가격</span><span className="tabular-nums">{price.toLocaleString("ko-KR")}원</span></div>
                            <div className="mt-2 flex justify-between text-slate-500"><span>주문 수량</span><span>{quantity}주</span></div>
                            <div className="mt-4 flex items-end justify-between border-t border-slate-800 pt-4"><span className="font-semibold text-slate-300">총 주문 금액</span><strong className={`text-lg tabular-nums ${accent === "red" ? "text-red-400" : "text-blue-400"}`}>₩{(price * quantity).toLocaleString("ko-KR")}</strong></div>
                        </div>

                        <button type="button" className={`trade-action-button w-full rounded-xl py-4 text-sm font-black text-white transition-transform active:scale-[0.99] ${tab === "buy" ? "bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-950/40" : "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-950/40"}`}>{tab === "buy" ? "삼성전자 매수하기" : "삼성전자 매도하기"}</button>

                        <Portfolio tab={tab} />
                    </div>
                </div>
            )}
        </aside>
    );
}

function SelectLike({ label, value }: { label: string; value: string }) {
    return <button type="button" className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-left"><span className="block text-[10px] text-slate-600">{label}</span><strong className="mt-1 flex justify-between text-xs text-slate-200">{value}<span className="text-slate-600">⌄</span></strong></button>;
}

function Counter({ label, value, unit, onMinus, onPlus }: { label: string; value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
    return <div><div className="mb-2 flex justify-between"><span className="font-semibold text-slate-400">{label}</span><span className="text-[10px] text-slate-600">현재가 191,000원</span></div><div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 focus-within:border-slate-500"><strong className="flex-1 text-base tabular-nums">{value}</strong><span className="mr-3 text-slate-500">{unit}</span><button type="button" onClick={onMinus} aria-label={`${label} 감소`} className="h-7 w-7 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">−</button><button type="button" onClick={onPlus} aria-label={`${label} 증가`} className="ml-1 h-7 w-7 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">＋</button></div></div>;
}

function Portfolio({ tab }: { tab: Exclude<OrderTab, "pending"> }) {
    return <div className="border-t border-slate-800 pt-4"><div className="flex justify-between"><strong>내 보유 현황</strong><span className="text-[10px] text-slate-600">실시간 평가</span></div>{tab === "buy" ? <p className="mt-5 rounded-xl border border-dashed border-slate-800 py-6 text-center text-[11px] text-slate-600">신규 매수 가능한 종목입니다</p> : <dl className="mt-4 grid grid-cols-2 gap-y-2 text-[11px]"><dt className="text-slate-600">보유 수량</dt><dd className="text-right font-bold">10주</dd><dt className="text-slate-600">평균 매입가</dt><dd className="text-right">191,500원</dd><dt className="text-slate-600">평가 손익</dt><dd className="text-right font-bold text-blue-400">-5,000원</dd></dl>}</div>;
}

function PendingOrders() {
    return <div className="p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-bold">미체결 주문</h3><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">2건</span></div><div className="mt-4 space-y-3"><PendingOrder name="삼성전자" price="191,500원" quantity="100주" method="시장가" side="매수" /><PendingOrder name="현대미포조선" price="23,123원" quantity="1,000주" method="지정가" side="매수" /></div></div>;
}

function PendingOrder({ name, price, quantity, method, side }: { name: string; price: string; quantity: string; method: string; side: string }) {
    return <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-[11px]"><div className="flex justify-between"><div><span className="mr-2 rounded bg-red-500/15 px-2 py-1 font-bold text-red-400">{side}</span><strong>{name}</strong></div><button type="button" className="text-slate-600 hover:text-red-400">주문취소</button></div><dl className="mt-4 grid grid-cols-2 gap-y-2"><dt className="text-slate-600">주문 가격</dt><dd className="text-right font-bold">{price}</dd><dt className="text-slate-600">수량</dt><dd className="text-right">{quantity}</dd><dt className="text-slate-600">주문 방식</dt><dd className="text-right">{method}</dd></dl></article>;
}
