"use client";

import { saveInvestmentSurvey } from "@/lib/api/user";
import { getApiErrorMessage } from "@/lib/api/client";
import type { InvestmentProfileResponse } from "@/lib/api/types";
import { investmentProfileChoices, fundProfileChoices, investmentLevelChoices } from "@/features/my-page/data";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { CheckIcon } from "@/components/icons/Icon";
import { SURVEY_QUESTIONS } from "../constants/surveyQuestions";

type InvestmentSurveyProps = { completeLabel?: string; onComplete: (result: InvestmentProfileResponse) => void; onSaved?: (result: InvestmentProfileResponse) => void };

export default function InvestmentSurvey({ onComplete, onSaved, completeLabel = "확인" }: InvestmentSurveyProps) {
    const [step, setStep] = useState(-1);
    const [answers, setAnswers] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<InvestmentProfileResponse | null>(null);
    async function next() {
        if (step < SURVEY_QUESTIONS.length - 1) { setStep(step + 1); return; }
        setSaving(true); setError("");
        try {
            const indices = answers.map((answer, index) => SURVEY_QUESTIONS[index].options.indexOf(answer) + 1);
            const saved = await saveInvestmentSurvey({ answers: indices, investmentTendency: indices[5], fundTendency: indices[0] === 1 ? 2 : indices[0] === 2 ? 4 : 3 });
            setResult(saved); setStep(SURVEY_QUESTIONS.length); onSaved?.(saved);
        } catch (cause) { setError(getApiErrorMessage(cause, "설문을 저장하지 못했습니다.")); }
        finally { setSaving(false); }
    }
    const question = step >= 0 && step < SURVEY_QUESTIONS.length ? SURVEY_QUESTIONS[step] : null;

    if (step === SURVEY_QUESTIONS.length) {
        return result ? <SurveyResult onComplete={onComplete} result={result} completeLabel={completeLabel} /> : null;
    }

    return (
        <section className="flex min-h-[780px] flex-1 items-start justify-center bg-surface-soft px-4 py-16">
            <div className="flex min-h-[460px] w-full max-w-[560px] flex-col rounded-lg border border-hairline bg-canvas px-8 py-8 shadow-[0_4px_12px_rgba(0,0,0,.04)] sm:px-10">
                {step === -1 ? (
                    <>
                        <h1 className="text-2xl font-bold text-ink">먼저 내 투자유형을 알아야 해요</h1>
                        <p className="mt-2 text-sm text-body">정확하고 올바른 투자를 위해 꼭 필요한 단계예요.</p>
                        <Button variant="primary" size="lg" onClick={() => setStep(0)} className="mt-auto self-end">다음</Button>
                    </>
                ) : (
                    question && (
                        <>
                            <div className="flex items-center justify-between">
                                <h1 className="text-2xl font-bold text-ink">{question.title}</h1>
                                <p className="text-sm font-semibold text-muted">{step + 1}/8</p>
                            </div>
                            <div className="mt-8 space-y-2">
                                {question.options.map((option) => {
                                    const selected = answers[step] === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() =>
                                                setAnswers((current) => {
                                                    const next = [...current];
                                                    next[step] = option;
                                                    return next;
                                                })
                                            }
                                            className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left text-base font-bold transition-colors ${
                                                selected ? "bg-primary/8 text-primary" : "text-ink hover:bg-surface-soft"
                                            }`}
                                        >
                                            <span>{option}</span>
                                            <CheckIcon className={`h-4 w-4 ${selected ? "text-primary" : "text-muted"}`} />
                                        </button>
                                    );
                                })}
                            </div>
                            {error && <p role="alert" className="mt-4 text-sm text-red-500">{error}</p>}
                            <div className="mt-auto flex justify-end gap-3 pt-8">
                                <Button variant="secondary" size="lg" disabled={saving} onClick={() => setStep((current) => current - 1)}>이전</Button>
                                <Button variant="primary" size="lg" disabled={!answers[step] || saving} onClick={() => void next()}>{saving ? "저장 중…" : step === SURVEY_QUESTIONS.length - 1 ? "결과 저장" : "다음"}</Button>
                            </div>
                        </>
                    )
                )}
            </div>
        </section>
    );
}

function SurveyResult({ onComplete, result, completeLabel = "확인" }: InvestmentSurveyProps & { result: InvestmentProfileResponse }) {
    return (
        <section className="flex min-h-[780px] flex-1 items-start justify-center bg-surface-soft px-4 py-16">
            <div className="flex min-h-[460px] w-full max-w-[560px] flex-col rounded-lg border border-hairline bg-canvas px-8 py-8 shadow-[0_4px_12px_rgba(0,0,0,.04)]">
                <h1 className="text-2xl font-bold text-ink">투자성향이 저장되었습니다</h1>
                <div className="mt-10 space-y-4 text-lg font-bold leading-7 text-ink">
                    <p>투자성향: <span className="text-primary">{investmentProfileChoices[result.investmentTendency - 1]?.value}</span></p>
                    <p>자금성향: <span className="text-primary">{fundProfileChoices[result.fundTendency - 1]?.value}</span></p>
                    <p>투자레벨: <span className="text-primary">{investmentLevelChoices[["BEGINNER", "INTERMEDIATE", "EXPERT"].indexOf(result.investmentLevel)]?.value}</span></p>
                    <p className="text-sm font-normal text-muted">투자 레벨은 금융 지식과 파생상품 투자 경험 기간 응답을 바탕으로 결정됩니다.</p>
                    <p className="text-sm font-normal text-muted">손실 허용 범위와 투자 목적 응답을 바탕으로 분류한 참고 결과이며, 전문 투자적합성 평가가 아닙니다. AI 진단에서 저장된 응답을 활용합니다.</p>
                </div>
                <Button variant="primary" size="lg" onClick={() => onComplete(result)} className="mt-auto self-end">{completeLabel}</Button>
            </div>
        </section>
    );
}
