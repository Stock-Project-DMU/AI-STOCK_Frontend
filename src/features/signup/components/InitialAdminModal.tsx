"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import PasswordInput from "@/components/common/PasswordInput";
import { getApiErrorMessage } from "@/lib/api/client";
import { checkLoginId, createInitialAdmin } from "@/lib/api/auth";

const loginIdPattern = /^[A-Za-z0-9_]{4,50}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InitialAdminModal({ onClose }: { onClose: () => void }) {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleEscape); };
    }, [onClose]);
    const [loginId, setLoginId] = useState("");
    const [checkedLoginId, setCheckedLoginId] = useState("");
    const [checking, setChecking] = useState(false);
    const [loginIdError, setLoginIdError] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [setupCode, setSetupCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function checkDuplicate() {
        const value = loginId.trim();
        if (!value || !loginIdPattern.test(value)) return;
        setChecking(true); setLoginIdError(""); setCheckedLoginId("");
        try {
            const result = await checkLoginId(value);
            if (result.available) setCheckedLoginId(value);
            else setLoginIdError("이미 사용 중인 아이디입니다.");
        } catch (cause) { setLoginIdError(getApiErrorMessage(cause, "중복 확인에 실패했습니다.")); }
        finally { setChecking(false); }
    }

    const loginIdValid = loginIdPattern.test(loginId.trim());
    const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) && new TextEncoder().encode(password).length <= 72;
    const emailValid = emailPattern.test(email.trim());
    const canSubmit = loginIdValid && checkedLoginId === loginId.trim() && passwordValid && name.trim().length > 0 && emailValid && setupCode.trim().length > 0;

    async function submit() {
        if (busy || !canSubmit) return;
        setBusy(true); setError(""); setSuccess("");
        try {
            await createInitialAdmin({ loginId: loginId.trim(), password, name: name.trim(), email: email.trim(), setupCode: setupCode.trim() });
            setSuccess("최초 관리자 계정이 생성됐습니다. 로그인 화면에서 로그인해 주세요.");
        } catch (cause) { setError(getApiErrorMessage(cause, "관리자 계정 생성에 실패했습니다.")); }
        finally { setBusy(false); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4" role="presentation" onClick={onClose}>
            <section role="dialog" aria-modal="true" aria-labelledby="initial-admin-title" className="max-h-[85vh] w-full max-w-[440px] overflow-y-auto rounded-xl border border-hairline bg-canvas shadow-xl" onClick={event => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 border-b border-hairline-soft px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold text-muted">서버에 관리자 계정이 아직 없습니다</p>
                        <h2 id="initial-admin-title" className="mt-1 text-lg font-semibold text-ink">최초 관리자 만들기</h2>
                    </div>
                    <button type="button" aria-label="닫기" className="shrink-0 rounded-md px-2 text-2xl leading-none text-muted hover:bg-surface-strong hover:text-ink" onClick={onClose}>×</button>
                </div>

                {success ? (
                    <div className="px-6 py-6">
                        <p className="text-sm text-body">{success}</p>
                        <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={onClose}>닫기</Button>
                    </div>
                ) : (
                    <div className="space-y-4 px-6 py-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="initial-admin-login-id">아이디</label>
                            <div className="flex gap-2">
                                <input id="initial-admin-login-id" value={loginId} onChange={event => { setLoginId(event.target.value); setCheckedLoginId(""); setLoginIdError(""); }} className="h-11 flex-1 rounded-md border border-hairline bg-canvas px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                                <Button variant="outline" size="md" disabled={checking || !loginIdValid} onClick={() => void checkDuplicate()}>{checking ? "확인 중…" : "중복확인"}</Button>
                            </div>
                            {loginIdError ? <p className="mt-1.5 px-0.5 text-xs text-red-500">{loginIdError}</p>
                                : checkedLoginId && checkedLoginId === loginId.trim() ? <p className="mt-1.5 px-0.5 text-xs text-muted">사용 가능한 아이디입니다.</p>
                                : <p className="mt-1.5 px-0.5 text-xs text-muted">영문, 숫자, 밑줄 4~50자</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="initial-admin-password">비밀번호</label>
                            <PasswordInput id="initial-admin-password" value={password} onChange={event => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-hairline bg-canvas px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                            <p className="mt-1.5 px-0.5 text-xs text-muted">8자 이상, 영문+숫자 포함</p>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="initial-admin-name">이름</label>
                            <input id="initial-admin-name" value={name} onChange={event => setName(event.target.value)} className="h-11 w-full rounded-md border border-hairline bg-canvas px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="initial-admin-email">이메일</label>
                            <input id="initial-admin-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-hairline bg-canvas px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="initial-admin-setup-code">관리자 인증 코드</label>
                            <PasswordInput id="initial-admin-setup-code" value={setupCode} onChange={event => setSetupCode(event.target.value)} className="h-11 w-full rounded-md border border-hairline bg-canvas px-4 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="관리자에게 전달받은 인증 코드" />
                        </div>
                        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                        <Button variant="primary" size="lg" fullWidth disabled={busy || !canSubmit} onClick={() => void submit()}>{busy ? "생성 중…" : "관리자 계정 생성"}</Button>
                        <button type="button" className="w-full text-center text-xs text-muted underline" onClick={onClose}>나중에 하고 일반 회원가입 계속하기</button>
                    </div>
                )}
            </section>
        </div>
    );
}
