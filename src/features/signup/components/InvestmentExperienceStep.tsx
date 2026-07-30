import { Button } from "@/components/common/Button";
import type { InvestmentExperienceLevel } from "../types";

type InvestmentOption = {
    id: InvestmentExperienceLevel;
    title: string;
    description: string;
    className: string;
};

type InvestmentExperienceStepProps = {
    selectedExperience: InvestmentExperienceLevel | null;
    onSelect: (experience: InvestmentExperienceLevel) => void;
    onNext: () => void;
};

const INVESTMENT_OPTIONS: InvestmentOption[] = [
    {
        id: "beginner",
        title: "입문자",
        description: "주식 계좌가 없거나\n투자 경험 1년 미만\n용어가 낯선 단계",
        className: "bg-[#7c94ff]",
    },
    {
        id: "intermediate",
        title: "일반 투자자",
        description: "투자 경험 1년 ~ 3년\n기본 종목 거래 경험\nETF·펀드 약간 있음",
        className: "bg-primary",
    },
    {
        id: "advanced",
        title: "숙련 투자자",
        description: "투자 경험 3년 이상\n재무제표 차트 분석\n파생·레버리지 경험",
        className: "bg-primary-active",
    },
];

export default function InvestmentExperienceStep({
    selectedExperience,
    onSelect,
    onNext,
}: InvestmentExperienceStepProps) {
    return (
        <>
            <div className="mt-8 rounded-lg border border-hairline-soft bg-surface-soft p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {INVESTMENT_OPTIONS.map((option) => {
                        const isSelected = selectedExperience === option.id;

                        return (
                            <button
                                type="button"
                                key={option.id}
                                className={`relative flex flex-col items-center rounded-lg px-5 py-6 text-center text-white transition ${option.className} ${
                                    isSelected
                                        ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-soft"
                                        : "hover:brightness-110"
                                }`}
                                aria-pressed={isSelected}
                                onClick={() => onSelect(option.id)}
                            >
                                {isSelected ? (
                                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                                        ✓
                                    </span>
                                ) : null}
                                <span className="block text-base font-bold">
                                    {option.title}
                                </span>
                                <span className="mt-3 block whitespace-pre-line text-xs leading-5 text-white/90">
                                    {option.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-8"
                disabled={!selectedExperience}
                onClick={onNext}
            >
                다음
            </Button>
        </>
    );
}
