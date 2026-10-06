"use client";

import { useEffect, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/client";
import { createInquiry, getInquiryDetail, getMyInquiries, type InquiryDetail, type InquiryListItem } from "@/lib/api/inquiry";
import { formatDateTime } from "@/lib/format/dateTime";

type View = "list" | "write" | "detail";

const statusLabel: Record<string, string> = { PENDING: "답변 대기", ANSWERED: "답변 완료" };
const statusClass: Record<string, string> = { PENDING: "bg-amber-500/10 text-amber-600", ANSWERED: "bg-emerald-500/10 text-emerald-600" };

export default function InquiryPanel() {
    const [view, setView] = useState<View>("list");
    const [items, setItems] = useState<InquiryListItem[] | null>(null);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const [detail, setDetail] = useState<InquiryDetail | null>(null);
    const [detailError, setDetailError] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const requestedInquiryId = useRef<number | null>(null);

    useEffect(() => {
        if (view !== "list") return;
        let active = true;
        async function load() {
            setError("");
            try {
                const list = await getMyInquiries();
                if (active) setItems(list);
            } catch (cause) { if (active) setError(getApiErrorMessage(cause, "문의 내역을 불러오지 못했습니다.")); }
        }
        void load();
        return () => { active = false; };
    }, [view, revision]);

    function openDetail(inquiryId: number) {
        setView("detail"); setDetail(null); setDetailError("");
        requestedInquiryId.current = inquiryId;
        getInquiryDetail(inquiryId)
            .then(result => { if (requestedInquiryId.current === inquiryId) setDetail(result); })
            .catch(cause => { if (requestedInquiryId.current === inquiryId) setDetailError(getApiErrorMessage(cause, "문의 상세를 불러오지 못했습니다.")); });
    }

    async function submit() {
        if (submitting || !title.trim() || !content.trim()) return;
        setSubmitting(true); setSubmitError("");
        try {
            await createInquiry(title.trim(), content.trim());
            setTitle(""); setContent("");
            setView("list"); setRevision(value => value + 1);
        } catch (cause) { setSubmitError(getApiErrorMessage(cause, "문의 등록에 실패했습니다.")); }
        finally { setSubmitting(false); }
    }

    if (view === "write") {
        return <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-bold">문의 작성</h1><button type="button" onClick={() => setView("list")} className="text-sm text-muted">목록으로</button></div>
            <label className="mb-2 block text-sm font-bold" htmlFor="inquiry-title">제목</label>
            <input id="inquiry-title" value={title} onChange={event => setTitle(event.target.value.slice(0, 100))} maxLength={100} className="w-full rounded-lg border border-hairline bg-white p-3.5 text-sm outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" />
            <p className="mt-1 text-right text-xs text-muted">{title.length}/100</p>
            <label className="mb-2 mt-4 block text-sm font-bold" htmlFor="inquiry-content">내용</label>
            <textarea id="inquiry-content" value={content} onChange={event => setContent(event.target.value.slice(0, 500))} maxLength={500} className="h-40 w-full resize-none rounded-lg border border-hairline bg-white p-3.5 text-sm leading-6 outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" />
            <p className="mt-1 text-right text-xs text-muted">{content.length}/500</p>
            {submitError && <p role="alert" className="mt-3 text-sm text-up">{submitError}</p>}
            <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setView("list")} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>
                <button type="button" disabled={submitting || !title.trim() || !content.trim()} onClick={() => void submit()} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40">등록</button>
            </div>
        </div>;
    }

    if (view === "detail") {
        return <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-bold">문의 상세</h1><button type="button" onClick={() => setView("list")} className="text-sm text-muted">목록으로</button></div>
            {detailError && <div role="alert" className="py-8 text-center"><p className="text-sm text-up">{detailError}</p></div>}
            {!detail && !detailError && <p role="status" className="py-12 text-center text-sm text-muted">불러오는 중입니다.</p>}
            {detail && <div className="rounded-lg border border-hairline bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold">{detail.title}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[detail.status]}`}>{statusLabel[detail.status]}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{formatDateTime(detail.createdAt)}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{detail.content}</p>
                {detail.answer ? (
                    <div className="mt-5 rounded-lg bg-surface-soft p-4">
                        <p className="text-xs font-semibold text-muted">답변{detail.answeredAt ? ` · ${formatDateTime(detail.answeredAt)}` : ""}{detail.answeredByName ? ` · ${detail.answeredByName}` : ""}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{detail.answer}</p>
                    </div>
                ) : <p className="mt-5 text-sm text-muted">아직 답변이 등록되지 않았습니다.</p>}
            </div>}
        </div>;
    }

    return <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">문의하기</h1>
            <button type="button" onClick={() => setView("write")} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold">문의 작성</button>
        </div>
        {error && <div role="alert" className="py-8 text-center"><p className="text-sm text-up">{error}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="mt-3 rounded-md border border-hairline px-3 py-2 text-sm">다시 시도</button></div>}
        {!error && !items && <p role="status" className="py-12 text-center text-sm text-muted">문의 내역을 불러오는 중입니다.</p>}
        {!error && items && items.length === 0 && <p className="py-12 text-center text-sm text-muted">작성한 문의가 없습니다.</p>}
        {!error && items && items.length > 0 && <div className="overflow-hidden rounded-lg border border-hairline bg-white">
            {items.map(item => (
                <button key={item.inquiryId} type="button" onClick={() => openDetail(item.inquiryId)} className="flex w-full items-center justify-between gap-3 border-b border-hairline px-4 py-3 text-left last:border-b-0 hover:bg-surface-soft">
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted">{formatDateTime(item.createdAt)}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[item.status]}`}>{statusLabel[item.status]}</span>
                </button>
            ))}
        </div>}
    </div>;
}
