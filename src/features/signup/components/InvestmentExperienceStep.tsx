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
        className: "bg-emerald-900",
    },
    {
        id: "intermediate",
        title: "일반 투자자",
        description: "투자 경험 1년 ~ 3년\n기본 종목 거래 경험\nETF·펀드 약간 있음",
        className: "bg-blue-900",
    },
    {
        id: "advanced",
        title: "숙련 투자자",
        description: "투자 경험 3년 이상\n재무제표 차트 분석\n파생·레버리지 경험",
        className: "bg-amber-900",
    },
];

export default function InvestmentExperienceStep({
    selectedExperience,
    onSelect,
    onNext,
}: InvestmentExperienceStepProps) {
    return (
        <>
            <div className="mt-12 rounded-lg border border-gray-300 bg-gray-100 px-8 py-6">
                <div className="space-y-4">
                    {INVESTMENT_OPTIONS.map((option) => {
                        const isSelected = selectedExperience === option.id;

                        return (
                            <button
                                type="button"
                                key={option.id}
                                className={`mx-auto block w-full max-w-[260px] rounded-lg px-6 py-5 text-center text-white transition ${option.className} ${
                                    isSelected
                                        ? "ring-4 ring-black/25"
                                        : "hover:brightness-110"
                                }`}
                                aria-pressed={isSelected}
                                onClick={() => onSelect(option.id)}
                            >
                                <span className="block text-base font-bold">
                                    {option.title}
                                </span>
                                <span className="mt-3 block whitespace-pre-line text-xs leading-5">
                                    {option.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <button
                type="button"
                className="mt-12 w-full bg-black px-4 py-3 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!selectedExperience}
                onClick={onNext}
            >
                다음
            </button>
        </>
    );
}
