import {
    TERMS_AND_CONDITIONS,
    type TermDetail,
} from "@/features/signup/constants/terms";

type TermsAgreementStepProps = {
    checkedTerms: Record<string, boolean>;
    allTermsChecked: boolean;
    onToggleAllTerms: (checked: boolean) => void;
    onToggleTerm: (termId: string, checked: boolean) => void;
    onOpenTerm: (term: TermDetail) => void;
    onNext: () => void;
};

export default function TermsAgreementStep({
    checkedTerms,
    allTermsChecked,
    onToggleAllTerms,
    onToggleTerm,
    onOpenTerm,
    onNext,
}: TermsAgreementStepProps) {
    return (
        <>
            <p className="my-4 text-sm leading-6 text-gray-700">
                AI STOCK 회원 서비스 이용을 위해 아래 약관 확인 및 동의가
                필요합니다.
            </p>

            <div className="rounded-lg border border-gray-300 p-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="terms-all"
                        checked={allTermsChecked}
                        onClick={(event) =>
                            onToggleAllTerms(event.currentTarget.checked)
                        }
                        onChange={(event) =>
                            onToggleAllTerms(event.target.checked)
                        }
                    />
                    <label htmlFor="terms-all" className="ml-2 text-sm">
                        모두 확인하였으며, 아래 약관에 동의합니다.
                    </label>
                </div>

                {TERMS_AND_CONDITIONS.map((term) => (
                    <div
                        key={term.id}
                        className="mt-2 flex items-center rounded-lg border border-gray-300 bg-gray-50 p-3"
                    >
                        <input
                            type="checkbox"
                            id={`term-${term.id}`}
                            className="mr-2"
                            checked={checkedTerms[term.id]}
                            onClick={(event) =>
                                onToggleTerm(
                                    term.id,
                                    event.currentTarget.checked,
                                )
                            }
                            onChange={(event) =>
                                onToggleTerm(term.id, event.target.checked)
                            }
                        />
                        <label
                            htmlFor={`term-${term.id}`}
                            className="text-[11px] leading-4"
                        >
                            {term.title}
                            <span className="ml-1 text-[12px] text-red-500">
                                {term.isRequired ? "(필수)" : "(선택)"}
                            </span>
                        </label>
                        <button
                            type="button"
                            className="ml-auto rounded border border-gray-300 px-2 py-0.5 text-[12px] hover:bg-white"
                            onClick={() => onOpenTerm(term)}
                        >
                            보기
                        </button>
                    </div>
                ))}

                <div className="mt-2 flex items-center rounded-lg border border-gray-300 bg-gray-50 p-3">
                    <p className="text-center text-[11px] leading-5 text-gray-600">
                        본 서비스는 모의 투자 교육 목적의 서비스이며 실제
                        금융투자상품 매매를 중개하지 않습니다. 서비스 내 모든
                        자산은 가상 포트폴리오 기준이며 실제 현금 가치를
                        보장하지 않습니다.
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="mt-8 w-full bg-black px-4 py-3 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!allTermsChecked}
                onClick={onNext}
            >
                다음
            </button>
        </>
    );
}
