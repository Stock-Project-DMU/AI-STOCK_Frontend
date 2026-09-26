"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendNewsChat, type NewsChatAnswer, type NewsChatTurn } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

type Message = NewsChatTurn & { sources?: NewsChatAnswer["sources"]; searchedAt?: string };
const suggestions = ["삼성전자 이번 주 관련 뉴스 찾아줘", "오늘 코스피 시황 알려줘", "최근 반도체 업계 뉴스 요약해줘"];

export default function NewsChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inFlight = useRef(false);
    const mounted = useRef(true);
    const list = useRef<HTMLDivElement>(null);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; }, [messages, busy, error]);

    async function send(content: string) {
        content = content.trim();
        if (!content || inFlight.current) return;
        inFlight.current = true;
        setBusy(true); setError(""); setInput("");
        const previous = messages;
        setMessages([...previous, { role: "USER", content }]);
        try {
            const answer = await sendNewsChat(content, previous.slice(-8).map(item => ({ role: item.role, content: item.content.slice(0, 6000) })));
            if (mounted.current) setMessages([...previous, { role: "USER", content }, { role: "ASSISTANT", ...answer }]);
        } catch (cause) {
            if (mounted.current) {
                setMessages(previous); setInput(content);
                setError(getApiErrorMessage(cause, "뉴스를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요."));
            }
        } finally { inFlight.current = false; if (mounted.current) setBusy(false); }
    }
    function submit(event: FormEvent) { event.preventDefault(); void send(input); }

    return <section className="flex h-[calc(100dvh-4rem)] min-h-[540px] flex-col bg-surface-soft">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-hairline bg-canvas p-4">
            <div><h2 className="font-bold">AI 뉴스 검색 비서</h2><p className="mt-1 text-xs text-muted">종목·분야·기간을 말하면 관련 기사와 요약을 찾아드립니다.</p></div>
            <button type="button" disabled={busy} onClick={() => { setMessages([]); setError(""); setInput(""); }} className="shrink-0 rounded-lg border border-hairline px-3 py-2 text-sm disabled:opacity-50">새 대화</button>
        </header>
        <div ref={list} className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {!messages.length && <div className="mx-auto max-w-3xl rounded-xl border border-hairline bg-canvas p-5"><p className="font-semibold">어떤 뉴스가 궁금하신가요?</p><p className="mt-2 text-sm text-muted">“그중 실적 관련 기사만 보여줘”처럼 이어서 질문할 수 있습니다.</p><div className="mt-4 flex flex-wrap gap-2">{suggestions.map(text => <button type="button" key={text} disabled={busy} onClick={() => void send(text)} className="rounded-full border border-hairline px-4 py-2 text-left text-sm hover:bg-surface-soft">{text}</button>)}</div></div>}
            {messages.map((message, index) => <div key={index} className={`mx-auto flex max-w-4xl ${message.role === "USER" ? "justify-end" : "justify-start"}`}><article className={`max-w-full rounded-xl border border-hairline p-4 sm:max-w-[90%] ${message.role === "USER" ? "chat-user-bubble" : "bg-canvas"}`}>
                <p className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</p>
                {!!message.sources?.length && <div className="mt-4 space-y-2 border-t border-hairline pt-3"><h3 className="text-sm font-semibold">관련 기사 · 원문 보기</h3>{message.sources.map(source => /^https?:\/\//.test(source.link) && <a key={source.link} href={source.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-hairline p-3 hover:bg-surface-soft"><strong className="text-sm text-primary">{source.title}</strong><p className="mt-1 text-xs text-muted">{source.outlet} · {source.pubDate}</p><p className="mt-2 text-xs leading-5 text-body">{source.description}</p></a>)}</div>}
                {message.searchedAt && <p className="mt-3 text-xs text-muted">조회 시각: {new Date(message.searchedAt).toLocaleString("ko-KR")}</p>}
            </article></div>)}
            {busy && <p role="status" className="mx-auto max-w-4xl text-sm text-muted">관련 뉴스를 검색하고 요약하고 있습니다...</p>}
            {error && <p role="alert" className="mx-auto max-w-4xl rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        </div>
        <form onSubmit={submit} className="shrink-0 border-t border-hairline bg-canvas p-4"><div className="mx-auto flex max-w-4xl gap-2"><input aria-label="찾고 싶은 뉴스" maxLength={2000} disabled={busy} value={input} onChange={event => setInput(event.target.value)} placeholder="예: 삼성전자 최근 실적 관련 뉴스 찾아줘" className="min-w-0 flex-1 rounded-lg border border-hairline bg-surface-soft px-4 py-3 text-sm" /><button type="submit" disabled={busy || !input.trim()} className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">전송</button></div></form>
    </section>;
}
