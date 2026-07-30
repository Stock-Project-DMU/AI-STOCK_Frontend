"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { CheckIcon } from "@/components/icons/Icon";
import { SURVEY_QUESTIONS } from "../constants/surveyQuestions";

type InvestmentSurveyProps = { onComplete: () => void };

export default function InvestmentSurvey({ onComplete }: InvestmentSurveyProps) {
    const [step, setStep] = useState(-1);
    const [answers, setAnswers] = useState<string[]>([]);
    const question = step >= 0 && step < SURVEY_QUESTIONS.length ? SURVEY_QUESTIONS[step] : null;

    if (step === SURVEY_QUESTIONS.length) {
        return <SurveyResult onComplete={onComplete} />;
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
                            <div className="mt-auto flex justify-end gap-3 pt-8">
                                <Button variant="secondary" size="lg" onClick={() => setStep((current) => current - 1)}>이전</Button>
                                <Button variant="primary" size="lg" disabled={!answers[step]} onClick={() => setStep((current) => current + 1)}>다음</Button>
                            </div>
                        </>
                    )
                )}
            </div>
        </section>
    );
}

function SurveyResult({ onComplete }: InvestmentSurveyProps) {
    return (
        <section className="flex min-h-[780px] flex-1 items-start justify-center bg-surface-soft px-4 py-16">
            <div className="flex min-h-[460px] w-full max-w-[560px] flex-col rounded-lg border border-hairline bg-canvas px-8 py-8 shadow-[0_4px_12px_rgba(0,0,0,.04)]">
                <h1 className="text-2xl font-bold text-ink">김진우님은 이런 성향이에요</h1>
                <div className="mt-10 space-y-4 text-lg font-bold leading-7 text-ink">
                    <p>내 투자성향은 <span className="text-primary">적극투자형</span>이에요</p>
                    <p>위험을 감수하더라도 수익을 추구해요</p>
                    <p className="pt-4">내 자금성향은 <span className="text-primary">수익추구형</span>이에요</p>
                    <p>-70% 손실까지 감수할 수 있어요</p>
                    <p>채무 상환을 위해 투자해요</p>
                    <p>투자금은 3년 동안 투자에 사용할거예요</p>
                </div>
                <Button variant="primary" size="lg" onClick={onComplete} className="mt-auto self-end">확인</Button>
            </div>
        </section>
    );
}
