"use client";

import { useEffect, useState } from "react";
import { getUpcomingDividends, type UpcomingDividendResponse } from "@/lib/api/dividend";
import { isAuthenticated } from "@/lib/api/client";
import { won } from "../../data";

const PREVIEW_COUNT = 5;

export default function UpcomingDividends() {
    const [authenticated] = useState(isAuthenticated);
    const [items, setItems] = useState<UpcomingDividendResponse[] | null>(null);
    const [expanded, setExpanded] = useState(false);
    // 실패를 빈 목록으로 바꾸면 "예정된 배당이 없습니다"로 잘못 안내되므로 실패는 따로 표시한다.
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!authenticated) return;
        const controller = new AbortController();
        void getUpcomingDividends(controller.signal).then(result => {
            if (!controller.signal.aborted) { setFailed(false); setItems(result); }
        }).catch(() => {
            if (!controller.signal.aborted) { setFailed(true); setItems([]); }
        });
        return () => controller.abort();
    }, [authenticated, retry]);

    if (!authenticated) return null;

    const visible = items ? (expanded ? items : items.slice(0, PREVIEW_COUNT)) : [];

    return (
        <section className="mt-6" aria-labelledby="upcoming-dividends-title">
            <div className="mb-2">
                <h2 id="upcoming-dividends-title" className="text-sm font-bold">예정 배당</h2>
                <p className="mt-1 text-xs text-muted">권리가 확정되어 지급을 기다리는 배당과 보유 종목의 다가오는 배당입니다.</p>
            </div>
            {items === null ? (
                <div role="status" className="space-y-2 border-t border-hairline pt-3">
                    <span className="sr-only">예정 배당을 불러오는 중입니다.</span>
                    {[0, 1].map(key => <div key={key} aria-hidden="true" className="h-14 animate-pulse rounded-md bg-surface-strong motion-reduce:animate-none" />)}
                </div>
            ) : failed ? (
                <div role="alert" className="border-y border-hairline py-6 text-center">
                    <p className="text-sm text-muted">예정 배당을 불러오지 못했습니다.</p>
                    <button type="button" onClick={() => { setItems(null); setRetry(value => value + 1); }} className="mt-3 rounded-md border border-hairline px-3 py-2 text-sm hover:bg-surface-soft">다시 시도</button>
                </div>
            ) : items.length === 0 ? (
                <p className="border-y border-hairline py-8 text-center text-sm text-muted">예정된 배당이 없습니다.</p>
            ) : (
                <>
                    <ul className="border-b border-hairline">
                        {visible.map(item => (
                            <li key={`${item.dividendScheduleId}-${item.isEntitled}`} className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-1 py-3.5 sm:px-4">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${item.isEntitled ? "bg-emerald-500/10 text-emerald-600" : "theme-accent-soft theme-accent-text"}`}>
                                        {item.isEntitled ? "배당 확정" : "보유 중"}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">{item.stockName ?? item.stockCode}</p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {item.isEntitled
                                                ? <>지급 예정일 {item.payDate}{item.isPayDateEstimated && " (추정)"}</>
                                                : <>배당락일 {item.exDividendDate}</>}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-muted">{item.isEntitled ? "총 수령액" : "예상 수령액"}</p>
                                    <p className="num mt-0.5 text-base font-bold">{item.expectedAmount == null ? "미공시" : won(item.expectedAmount)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {items.length > PREVIEW_COUNT && (
                        <button type="button" onClick={() => setExpanded(value => !value)} className="mt-3 w-full rounded-lg border border-hairline px-3.5 py-2 text-sm font-bold hover:bg-surface-soft">
                            {expanded ? "접기" : `더 보기 (${items.length - PREVIEW_COUNT}건)`}
                        </button>
                    )}
                </>
            )}
        </section>
    );
}
