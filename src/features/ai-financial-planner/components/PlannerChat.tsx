"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { SparkleIcon, SendIcon } from "@/components/icons/Icon";
import { createPlanningSession, getPlanningMessages, sendPlanningMessage, type PlanningMessage } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
export default function PlannerChat({ sessionId, onSessionChange }: { sessionId: number | null; onSessionChange: (id: number) => void }) {
    const createdSession = useRef<number | null>(null);
    const mounted = useRef(true);
    const messageList = useRef<HTMLDivElement>(null);
    const [loadingMessages, setLoadingMessages] = useState(sessionId !== null);
    const [messages, setMessages] = useState<PlanningMessage[]>([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => {
        const list = messageList.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages, busy]);
    useEffect(() => {
        let cancelled = false;
        if (!sessionId) return;
        getPlanningMessages(sessionId).then(items => { if (!cancelled) setMessages(items); })
            .catch(error => { if (!cancelled) setError(getApiErrorMessage(error, "대화 기록을 불러오지 못했습니다.")); })
            .finally(() => { if (!cancelled) setLoadingMessages(false); });
        return () => { cancelled = true; };
    }, [sessionId]);
    async function submit(event: FormEvent) {
        event.preventDefault();
        const content = input.trim();
        if (!content || busy || loadingMessages) return;
        setBusy(true); setError("");
        let id = sessionId ?? createdSession.current;
        try {
            if (!id) { id = (await createPlanningSession()).sessionId; createdSession.current = id; }
            await sendPlanningMessage(id, content);
            if (!mounted.current) return;
            setMessages(await getPlanningMessages(id));
            if (!mounted.current) return;
            setInput("");
            onSessionChange(id);
        } catch (error) {
            if (!mounted.current) return;
            setError(getApiErrorMessage(error, "AI 답변 요청에 실패했습니다."));
            if (id) { getPlanningMessages(id).then(items => { if (mounted.current) setMessages(items); }).catch(() => {}); }
        } finally { if (mounted.current) setBusy(false); }
    }
    return <section className="flex min-h-[540px] min-w-0 flex-1 flex-col bg-surface-soft">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-canvas px-6 font-bold"><span className="theme-accent-bg flex h-8 w-8 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>AI 재무설계사 밀착 진단</div>
        <div ref={messageList} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
            {loadingMessages && <p role="status" className="text-sm text-muted">대화 기록을 불러오는 중입니다...</p>}
            {!loadingMessages && !messages.length && <p className="text-sm text-muted">투자 목표와 궁금한 점을 입력해 주세요. 저장된 투자 성향과 내 계좌를 반영해 상담합니다. 진단을 다시 진행하지 않아도 대화할 수 있습니다.</p>}
            {messages.map(message => <div key={message.messageId} className={`flex ${message.role === "USER" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[700px] gap-3 ${message.role === "USER" ? "flex-row-reverse" : ""}`}>{message.role === "ASSISTANT" && <span className="theme-accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-md"><SparkleIcon className="h-4 w-4" /></span>}<p className={`whitespace-pre-wrap rounded-lg border border-hairline px-5 py-4 text-sm leading-7 ${message.role === "USER" ? "chat-user-bubble" : "bg-canvas text-body"}`}>{message.content}</p></div>
            </div>)}
            {busy && <p role="status" className="text-sm text-muted">AI가 자료를 분석하고 있습니다...</p>}
            {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </div>
        <form onSubmit={submit} className="shrink-0 border-t border-hairline bg-canvas px-6 pb-3 pt-3">
            <div className="mx-auto flex max-w-[900px] gap-2 rounded-md bg-surface-soft p-2">
                <input disabled={busy || loadingMessages} maxLength={2000} aria-label="AI에게 질문" value={input} onChange={event => setInput(event.target.value)} placeholder="AI에게 재무 질문을 입력하세요..." className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
                <button disabled={busy || loadingMessages || !input.trim()} aria-label="메시지 보내기" className="theme-accent-bg rounded-md p-2 disabled:opacity-50"><SendIcon className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-center text-[12px] text-muted-soft">AI의 조언은 투자 참고용이며 최종 결정은 본인의 책임입니다.</p>
        </form>
    </section>;
}
