"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/common/Button";

type LoginFormData = { userId: string; password: string };
type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const INITIAL_FORM_DATA: LoginFormData = { userId: "", password: "" };

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<LoginFormErrors>({});

    const handleChange = (field: keyof LoginFormData) => (event: ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: LoginFormErrors = {};
        if (!formData.userId.trim()) nextErrors.userId = "아이디를 입력해 주세요.";
        if (!formData.password) nextErrors.password = "비밀번호를 입력해 주세요.";
        setErrors(nextErrors);
    };

    return (
        <main className="market-theme auth-shell min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:py-16">
            <div className="auth-card mx-auto grid w-full max-w-[1080px] overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_.95fr]">
                <section className="relative hidden min-h-[650px] overflow-hidden border-r border-hairline bg-surface-strong p-12 lg:flex lg:flex-col">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-hairline" />
                    <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-hairline" />
                    <h1 className="max-w-sm text-4xl font-black leading-tight text-ink">데이터를 읽고,<br />나만의 투자 원칙을 만드세요.</h1>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-body">시장 브리핑부터 자산 진단, 목표 시뮬레이션까지 하나의 투자 워크스페이스에서 연결합니다.</p>
                    <div className="mt-auto grid grid-cols-3 gap-3">
                        {[['01', '시장 분석'], ['02', 'AI 진단'], ['03', '목표 관리']].map(([step, label]) => <div key={step} className="rounded-2xl border border-hairline bg-canvas p-4"><span className="theme-accent-text text-[10px] font-black">{step}</span><strong className="mt-2 block text-xs text-ink">{label}</strong></div>)}
                    </div>
                    <p className="mt-6 text-[10px] leading-5 text-muted">본 프로젝트의 모든 시장 수치는 화면 시연을 위한 샘플 데이터입니다.</p>
                </section>

                <section className="flex min-h-[650px] flex-col justify-center p-7 sm:p-12">
                    <div>
                        <h2 className="text-3xl font-black text-ink">로그인</h2>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                        <Field label="아이디" error={errors.userId}>
                            <input id="login-user-id" name="userId" type="text" placeholder="아이디 입력" value={formData.userId} onChange={handleChange("userId")} autoComplete="username" aria-invalid={Boolean(errors.userId)} className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none" />
                        </Field>
                        <Field label="비밀번호" error={errors.password}>
                            <input id="login-password" name="password" type="password" placeholder="비밀번호 입력" value={formData.password} onChange={handleChange("password")} autoComplete="current-password" aria-invalid={Boolean(errors.password)} className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none" />
                        </Field>
                        <Button type="submit" fullWidth size="md" className="text-sm">로그인</Button>
                    </form>

                    <div className="my-6 flex items-center gap-3 text-[10px] text-muted"><span className="h-px flex-1 bg-hairline" />간편 로그인<span className="h-px flex-1 bg-hairline" /></div>
                    <div className="grid grid-cols-3 gap-2">
                        {[['K', '카카오', 'bg-[#fee500] text-[#191919]'], ['N', '네이버', 'bg-[#03c75a] text-white'], ['G', 'Google', 'border border-hairline bg-canvas text-body hover:bg-surface-soft']].map(([symbol, label, tone]) => <button key={label} type="button" aria-label={`${label} 로그인`} className={`rounded-xl py-3 text-xs font-black ${tone}`}><span className="sm:hidden">{symbol}</span><span className="hidden sm:inline">{label}</span></button>)}
                    </div>

                    <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">
                        <Link href="/signup" className="theme-accent-text font-bold hover:opacity-80">회원가입</Link>
                        <Link href="/find-id" className="hover:text-ink">아이디 찾기</Link>
                        <Link href="/find-password" className="hover:text-ink">비밀번호 찾기</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return <label className="block text-xs font-bold text-ink">{label}<span className="mt-2 block">{children}</span>{error ? <span className="mt-1.5 block text-[11px] font-medium text-red-500">{error}</span> : null}</label>;
}
