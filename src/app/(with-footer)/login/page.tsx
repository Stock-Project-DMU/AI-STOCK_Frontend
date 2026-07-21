"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

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
            <div className="mx-auto grid w-full max-w-[1080px] overflow-hidden rounded-3xl border border-white/10 bg-[#081321]/90 shadow-[0_30px_90px_rgba(0,0,0,.35)] lg:grid-cols-[1.05fr_.95fr]">
                <section className="always-dark relative hidden min-h-[650px] overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,#123b38,#071312_72%)] p-12 lg:flex lg:flex-col">
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-teal-300/15" />
                    <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-teal-300/15" />
                    <p className="text-xs font-black tracking-[0.2em] text-teal-200">AI STOCK TERMINAL</p>
                    <h1 className="mt-8 max-w-sm text-4xl font-black leading-tight text-white">데이터를 읽고,<br />나만의 투자 원칙을 만드세요.</h1>
                    <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">시장 브리핑부터 자산 진단, 목표 시뮬레이션까지 하나의 투자 워크스페이스에서 연결합니다.</p>
                    <div className="mt-auto grid grid-cols-3 gap-3">
                        {[['01', '시장 분석'], ['02', 'AI 진단'], ['03', '목표 관리']].map(([step, label]) => <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><span className="text-[10px] font-black text-teal-300">{step}</span><strong className="mt-2 block text-xs text-slate-200">{label}</strong></div>)}
                    </div>
                    <p className="mt-6 text-[10px] leading-5 text-slate-600">본 프로젝트의 모든 시장 수치는 화면 시연을 위한 샘플 데이터입니다.</p>
                </section>

                <section className="auth-card flex min-h-[650px] flex-col justify-center border-0 p-7 sm:p-12">
                    <div>
                        <span className="theme-accent-border theme-accent-soft theme-accent-text inline-flex rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.14em]">MEMBER ACCESS</span>
                        <h2 className="mt-5 text-3xl font-black text-white">로그인</h2>
                        <p className="mt-2 text-sm text-slate-500">AI STOCK 투자 대시보드에 접속합니다.</p>
                    </div>

                    <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                        <Field label="아이디" error={errors.userId}>
                            <input id="login-user-id" name="userId" type="text" placeholder="아이디 입력" value={formData.userId} onChange={handleChange("userId")} autoComplete="username" aria-invalid={Boolean(errors.userId)} className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none" />
                        </Field>
                        <Field label="비밀번호" error={errors.password}>
                            <input id="login-password" name="password" type="password" placeholder="비밀번호 입력" value={formData.password} onChange={handleChange("password")} autoComplete="current-password" aria-invalid={Boolean(errors.password)} className="w-full rounded-xl border px-4 py-3.5 text-sm outline-none" />
                        </Field>
                        <button type="submit" className="theme-accent-bg theme-accent-shadow w-full rounded-xl px-4 py-3.5 text-sm font-black">로그인</button>
                    </form>

                    <div className="my-6 flex items-center gap-3 text-[10px] text-slate-600"><span className="h-px flex-1 bg-white/10" />간편 로그인<span className="h-px flex-1 bg-white/10" /></div>
                    <div className="grid grid-cols-3 gap-2">
                        {[['K', '카카오', 'bg-[#fee500] text-[#191919]'], ['N', '네이버', 'bg-[#03c75a] text-white'], ['G', 'Google', 'border border-white/10 bg-white/5 text-slate-200']].map(([symbol, label, tone]) => <button key={label} type="button" aria-label={`${label} 로그인`} className={`rounded-xl py-3 text-xs font-black ${tone}`}><span className="sm:hidden">{symbol}</span><span className="hidden sm:inline">{label}</span></button>)}
                    </div>

                    <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <Link href="/signup" className="theme-accent-text font-bold hover:opacity-80">회원가입</Link>
                        <Link href="/find-id" className="hover:text-slate-200">아이디 찾기</Link>
                        <Link href="/find-password" className="hover:text-slate-200">비밀번호 찾기</Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return <label className="block text-xs font-bold text-slate-300">{label}<span className="mt-2 block">{children}</span>{error ? <span className="mt-1.5 block text-[11px] font-medium text-red-400">{error}</span> : null}</label>;
}
