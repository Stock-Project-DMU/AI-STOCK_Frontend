"use client";

import { useState } from "react";
import { sendEmailVerificationCode } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";

export default function RecoveryVerification({ email, code, onCodeChange }: {
    email: string; code: string; onCodeChange: (code: string) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    async function send() {
        setBusy(true);
        try { await sendEmailVerificationCode(email); setMessage("인증번호를 발송했습니다. 5분 안에 입력해 주세요."); }
        catch (error) { setMessage(getApiErrorMessage(error, "인증번호 발송에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="mt-4 space-y-2">
        <button type="button" disabled={busy} onClick={() => void send()} className="rounded border border-hairline px-3 py-2 text-sm">{busy ? "발송 중..." : "이메일 인증번호 받기"}</button>
        <input aria-label="이메일 인증번호" placeholder="인증번호 6자리" inputMode="numeric" maxLength={6} value={code} onChange={event => onCodeChange(event.target.value.replace(/\D/g, ""))} className="w-full rounded border border-hairline px-3 py-2" />
        <p role="status" className="text-xs text-muted">{message}</p>
    </div>;
}
