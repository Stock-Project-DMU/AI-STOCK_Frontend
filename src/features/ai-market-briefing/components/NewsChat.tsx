"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon, SparkleIcon } from "@/components/icons/Icon";
import { sendNewsChat, type NewsBriefing, type NewsChatAnswer, type NewsChatTurn } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

type Message = NewsChatTurn & { sources?: NewsChatAnswer["sources"]; searchedAt?: string; sentAt: number };
type ArticleSource = { title: string; link: string; outlet: string; description?: string; pubDate?: string };
type TimelineEntry = { kind: "briefing"; briefing: NewsBriefing; time: number; order: number } | { kind: "message"; message: Message; time: number; order: number; index: number };
const suggestions = ["삼성전자 이번 주 관련 뉴스 찾아줘", "오늘 코스피 시황 알려줘", "최근 반도체 업계 뉴스 요약해줘"];

function briefingTime(briefing: NewsBriefing) {
    const time = briefing.createdAt.match(/T(\d{2}:\d{2}:\d{2})/)?.[1] ?? "00:00:00";
    const parsed = Date.parse(`${briefing.briefingDate}T${time}+09:00`);
    return Number.isFinite(parsed) ? parsed : 0;
}

function ArticleCards({ sources, title }: { sources: ArticleSource[]; title: string }) {
    const linkedSources = sources.filter(source => /^https?:\/\//.test(source.link));
    if (!linkedSources.length) return null;
    return <div className="mt-4 space-y-2 border-t border-hairline pt-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {linkedSources.map((source, index) => <a key={`${source.link}-${index}`} href={source.link} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-hairline p-3 hover:bg-surface-soft">
            <strong className="text-sm text-primary">{source.title}</strong>
            <p className="mt-1 text-xs text-muted">{source.outlet}{source.pubDate ? ` · ${source.pubDate}` : ""}</p>
            {source.description && <p className="mt-2 text-xs leading-5 text-body">{source.description}</p>}
        </a>)}
    </div>;
}

export default function NewsChat({ briefings, focusedBriefingDate, jumpTarget }: { briefings: NewsBriefing[]; focusedBriefingDate: string; jumpTarget: { date: string } | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const inFlight = useRef(false);
    const mounted = useRef(true);
    const list = useRef<HTMLDivElement>(null);
    const followBottom = useRef(true);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => { if (list.current && followBottom.current) list.current.scrollTop = list.current.scrollHeight; }, [briefings.length, messages, busy, error]);
    useEffect(() => {
        if (!jumpTarget || !list.current) return;
        const container = list.current;
        const target = document.getElementById(`briefing-${jumpTarget.date}`);
        if (!target || !container.contains(target)) return;
        followBottom.current = false;
        const top = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top;
        container.scrollTo({ top, behavior: "smooth" });
    }, [jumpTarget]);

    const timeline: TimelineEntry[] = [
        ...briefings.map((briefing, order) => ({ kind: "briefing" as const, briefing, time: briefingTime(briefing), order })),
        ...messages.map((message, index) => ({ kind: "message" as const, message, time: message.sentAt, order: briefings.length + index, index })),
    ].sort((a, b) => a.time - b.time || a.order - b.order);

    async function send(content: string, sentAt: number) {
        content = content.trim();
        if (!content || inFlight.current) return;
        inFlight.current = true;
        followBottom.current = true;
        setBusy(true); setError(""); setInput("");
        const previous = messages;
        const focusedBriefing = briefings.find(item => item.briefingDate === focusedBriefingDate) ?? briefings[0];
        const briefingContext: NewsChatTurn[] = focusedBriefing ? [{
            role: "ASSISTANT",
            content: `${focusedBriefing.briefingDate} ${focusedBriefing.outletName} 시황 브리핑: ${focusedBriefing.content}\n근거 기사: ${focusedBriefing.sources.map(source => source.title).join(", ")}`.slice(0, 6000),
        }] : [];
        const userMessage: Message = { role: "USER", content, sentAt };
        setMessages([...previous, userMessage]);
        try {
            const history = [...briefingContext, ...previous.slice(briefingContext.length ? -7 : -8)].map(item => ({ role: item.role, content: item.content.slice(0, 6000) }));
            const answer = await sendNewsChat(content, history);
            const answerTime = Date.parse(answer.searchedAt);
            if (mounted.current) setMessages([...previous, userMessage, { role: "ASSISTANT", ...answer, sentAt: Number.isFinite(answerTime) ? Math.max(answerTime, sentAt + 1) : sentAt + 1 }]);
        } catch (cause) {
            if (mounted.current) {
                setMessages(previous); setInput(content);
                setError(getApiErrorMessage(cause, "뉴스를 검색하지 못했습니다. 잠시 후 다시 시도해 주세요."));
            }
        } finally { inFlight.current = false; if (mounted.current) setBusy(false); }
    }
    return <section className="flex min-h-[540px] min-w-0 flex-1 flex-col bg-surface-soft">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-canvas px-6 font-bold">
            <span className="theme-accent-bg flex h-8 w-8 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>
            AI 뉴스 검색 비서
            {!!briefings.length && <span className="ml-auto truncate text-xs font-normal text-muted">브리핑 {briefings.length}건</span>}
        </header>
        <div ref={list} onScroll={event => { const element = event.currentTarget; followBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80; }} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
            {!briefings.length && !messages.length && <div className="mx-auto max-w-3xl text-sm text-muted">
                <p>궁금한 뉴스나 시황을 질문해 주세요. 최신 기사를 검색해 답변합니다.</p>
                <div className="mt-4 flex flex-wrap gap-2">{suggestions.map(text => <button type="button" key={text} disabled={busy} onClick={() => void send(text, Date.now())} className="rounded-full border border-hairline bg-canvas px-4 py-2 text-left text-sm text-body hover:bg-surface-soft">{text}</button>)}</div>
            </div>}
            {timeline.map(entry => entry.kind === "briefing" ? <div key={`briefing-${entry.briefing.briefingDate}`} id={`briefing-${entry.briefing.briefingDate}`} className="flex justify-start">
                <div className="flex max-w-[700px] gap-3">
                    <span className="theme-accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>
                    <article className="min-w-0 rounded-lg border border-hairline bg-canvas px-5 py-4 text-sm leading-7 text-body">
                        <p className="mb-2 text-xs font-semibold text-primary">{entry.briefing.briefingDate} · {entry.briefing.outletName} 시황 브리핑</p>
                        <p className="whitespace-pre-wrap break-words">{entry.briefing.content}</p>
                        <ArticleCards sources={entry.briefing.sources} title="브리핑 근거 기사 · 원문 보기" />
                    </article>
                </div>
            </div> : <div key={`message-${entry.index}`} className={`flex ${entry.message.role === "USER" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[700px] gap-3 ${entry.message.role === "USER" ? "flex-row-reverse" : ""}`}>
                    {entry.message.role === "ASSISTANT" && <span className="theme-accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>}
                    <article className={`min-w-0 rounded-lg border border-hairline px-5 py-4 text-sm leading-7 ${entry.message.role === "USER" ? "chat-user-bubble" : "bg-canvas text-body"}`}>
                        <p className="whitespace-pre-wrap break-words">{entry.message.content}</p>
                        {!!entry.message.sources?.length && <ArticleCards sources={entry.message.sources} title="관련 기사 · 원문 보기" />}
                        {entry.message.searchedAt && <p className="mt-3 text-xs text-muted">조회 시각: {new Date(entry.message.searchedAt).toLocaleString("ko-KR")}</p>}
                    </article>
                </div>
            </div>)}
            {!!briefings.length && !messages.length && <p className="pl-12 text-sm text-muted">브리핑 기사에 대해 더 궁금한 점을 질문해 보세요.</p>}
            {busy && <p role="status" className="text-sm text-muted">관련 뉴스를 검색하고 요약하고 있습니다...</p>}
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </div>
        <form onSubmit={event => { event.preventDefault(); void send(input, Date.now()); }} className="shrink-0 border-t border-hairline bg-canvas px-6 pb-3 pt-3">
            <div className="mx-auto flex max-w-[900px] gap-2 rounded-md bg-surface-soft p-2">
                <input aria-label="찾고 싶은 뉴스" maxLength={2000} disabled={busy} value={input} onChange={event => setInput(event.target.value)} placeholder="궁금한 뉴스나 시황을 입력하세요..." className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
                <button type="submit" disabled={busy || !input.trim()} aria-label="메시지 보내기" className="theme-accent-bg rounded-md p-2 disabled:opacity-50"><SendIcon className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-center text-[12px] text-muted-soft">AI가 검색한 기사와 요약은 투자 참고용입니다.</p>
        </form>
    </section>;
}
