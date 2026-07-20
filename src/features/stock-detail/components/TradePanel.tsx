"use client";

import { useState } from "react";
import type { OrderTab } from "../types";

const orderTabs: { id: OrderTab; label: string; color: string }[] = [
    { id: "buy", label: "매수", color: "bg-red-500" },
    { id: "sell", label: "매도", color: "bg-blue-600" },
    { id: "pending", label: "대기", color: "bg-emerald-500" },
];

export default function TradePanel() {
    const [tab, setTab] = useState<OrderTab>("buy");
    const [price, setPrice] = useState(191_500);
    const [quantity, setQuantity] = useState(10);

    return (
        <aside className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="border-b-2 border-black pb-2 text-center text-sm font-bold">일반주문</h2>
            <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg bg-gray-100">
                {orderTabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`py-2 text-xs font-semibold ${tab === item.id ? `${item.color} text-white` : "text-gray-400"}`}>{item.label}</button>)}
            </div>

            {tab === "pending" ? (
                <div className="mt-5">
                    <h3 className="text-sm font-bold">대기 주문 내역</h3>
                    <PendingOrder name="삼성전자" price="191,500원" quantity="100주" method="시장가" />
                    <PendingOrder name="현대미포조선" price="23,123원" quantity="1,000주" method="지정가" />
                </div>
            ) : (
                <div className="mt-5 space-y-4 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">주문 유형</span><strong>일반 주문⌄</strong></div>
                    <div className="flex justify-between"><span className="text-gray-500">주문방법</span><strong>수량　<span className="text-gray-300">소수점</span></strong></div>
                    <Counter label={tab === "buy" ? "매수가격" : "매도가격"} value={price.toLocaleString("ko-KR")} unit="원" onMinus={() => setPrice((value) => Math.max(0, value - 500))} onPlus={() => setPrice((value) => value + 500)} />
                    <Counter label="수량" value={String(quantity)} unit="주" onMinus={() => setQuantity((value) => Math.max(1, value - 1))} onPlus={() => setQuantity((value) => value + 1)} />
                    <div className="grid grid-cols-4 gap-1">{[10, 25, 50, 100].map((percent) => <button key={percent} type="button" onClick={() => setQuantity(Math.max(1, Math.floor((31 * percent) / 100)))} className="rounded bg-gray-100 py-2 text-[10px]">{percent === 100 ? "최대" : `${percent}%`}</button>)}</div>
                    <div className="flex justify-between border-t pt-4"><span className="text-gray-500">총 주문 금액</span><strong>₩{(price * quantity).toLocaleString("ko-KR")}</strong></div>
                    <button type="button" className={`w-full rounded-lg py-3 text-sm font-bold text-white ${tab === "buy" ? "bg-red-500" : "bg-blue-600"}`}>{tab === "buy" ? "매수하기" : "매도하기"}</button>
                    <div className="border-t pt-4"><strong>내 주식</strong>{tab === "buy" ? <p className="mt-5 text-center text-gray-400">신규 주식을 보유하지 않았어요</p> : <dl className="mt-3 grid grid-cols-2 text-[10px]"><dt>평균매입단가</dt><dd className="text-right">191,500원</dd><dt>평가금액</dt><dd className="text-right">191,500원</dd><dt>수익률</dt><dd className="text-right">0%</dd></dl>}</div>
                </div>
            )}
        </aside>
    );
}

function Counter({ label, value, unit, onMinus, onPlus }: { label: string; value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
    return <div><div className="mb-2 text-gray-500">{label}</div><div className="flex items-center rounded-lg bg-gray-50 px-3 py-2"><strong className="flex-1 text-sm">{value}</strong><span className="mr-3 text-gray-400">{unit}</span><button type="button" onClick={onMinus} aria-label={`${label} 감소`} className="h-6 w-6 rounded border">−</button><button type="button" onClick={onPlus} aria-label={`${label} 증가`} className="ml-1 h-6 w-6 rounded border">＋</button></div></div>;
}

function PendingOrder({ name, price, quantity, method }: { name: string; price: string; quantity: string; method: string }) {
    return <article className="mt-4 border-b pb-4 text-[10px]"><div className="flex justify-between"><strong>{name}</strong><button type="button" className="text-red-500">삭제 ×</button></div><dl className="mt-2 grid grid-cols-2"><dt>평균매입단가</dt><dd className="text-right">{price}</dd><dt>수량</dt><dd className="text-right">{quantity}</dd><dt>매수방법</dt><dd className="text-right">{method}</dd></dl></article>;
}
