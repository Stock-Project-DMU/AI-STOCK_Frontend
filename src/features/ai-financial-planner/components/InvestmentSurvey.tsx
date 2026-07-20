"use client";

import { useState } from "react";
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
        <section className="flex min-h-[780px] flex-1 items-start justify-center bg-[#f2f4f6] px-4 py-28">
            <div className="flex min-h-[490px] w-full max-w-[560px] flex-col rounded-2xl border border-gray-300 bg-white px-10 py-10 shadow-sm sm:px-12">
                {step === -1 ? <>
                    <h1 className="text-3xl font-bold">먼저 내 투자유형을 알아야 해요</h1>
                    <p className="mt-2 text-base text-gray-700">정확하고 올바른 투자를 위해 꼭 필요한 단계예요.</p>
                    <button onClick={() => setStep(0)} className="mt-auto self-end rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">다음</button>
                </> : question && <>
                    <h1 className="text-3xl font-bold">{question.title}</h1>
                    <p className="text-base font-semibold">{step + 1}/8</p>
                    <div className="mt-10 space-y-2">
                        {question.options.map(option => {
                            const selected = answers[step] === option;
                            return <button key={option} onClick={() => setAnswers(current => { const next = [...current]; next[step] = option; return next; })} className={`flex w-full items-center justify-between rounded-lg px-2 py-3 text-left text-xl font-bold transition ${selected ? "bg-red-50 text-red-500" : "hover:bg-gray-50"}`}><span>{option}</span><span className={selected ? "text-red-500" : "text-gray-600"}>✓</span></button>;
                        })}
                    </div>
                    <div className="mt-auto flex justify-end gap-4 pt-8"><button onClick={() => setStep(current => current - 1)} className="rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">이전</button><button disabled={!answers[step]} onClick={() => setStep(current => current + 1)} className="rounded-lg bg-black px-8 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300">다음</button></div>
                </>}
            </div>
        </section>
    );
}

function SurveyResult({ onComplete }: InvestmentSurveyProps) {
    return <section className="flex min-h-[780px] flex-1 items-start justify-center bg-[#f2f4f6] px-4 py-28"><div className="flex min-h-[490px] w-full max-w-[560px] flex-col rounded-2xl border border-gray-300 bg-white px-10 py-10 shadow-sm"><h1 className="text-3xl font-bold">김진우님은 이런 성향이에요</h1><div className="mt-12 space-y-5 text-xl font-bold leading-7"><p>내 투자성향은 <span className="text-red-500">적극투자형</span>이에요</p><p>위험을 감수하더라도 수익을 추구해요</p><p className="pt-4">내 자금성향은 <span className="text-red-500">수익추구형</span>이에요</p><p>-70% 손실까지 감수할 수 있어요</p><p>채무 상환을 위해 투자해요</p><p>투자금은 3년 동안 투자에 사용할거예요</p></div><button onClick={onComplete} className="mt-auto self-end rounded-lg bg-black px-8 py-3 text-sm font-bold text-white">확인</button></div></section>;
}
