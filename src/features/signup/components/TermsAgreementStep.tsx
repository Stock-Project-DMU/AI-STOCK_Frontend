import { Button } from "@/components/common/Button";
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
            <p className="mt-8 mb-5 text-sm leading-6 text-body">
                AI STOCK 회원 서비스 이용을 위해 아래 약관 확인 및 동의가
                필요합니다.
            </p>

            <div className="rounded-lg border border-hairline-soft bg-surface-soft p-5 sm:p-6">
                <label
                    htmlFor="terms-all"
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-hairline bg-canvas px-4 py-3.5"
                >
                    <input
                        type="checkbox"
                        id="terms-all"
                        className="h-4 w-4 accent-primary"
                        checked={allTermsChecked}
                        onClick={(event) =>
                            onToggleAllTerms(event.currentTarget.checked)
                        }
                        onChange={(event) =>
                            onToggleAllTerms(event.target.checked)
                        }
                    />
                    <span className="text-sm font-semibold text-ink">
                        모두 확인하였으며, 아래 약관에 동의합니다.
                    </span>
                </label>

                <div className="mt-3 space-y-2">
                    {TERMS_AND_CONDITIONS.map((term) => (
                        <div
                            key={term.id}
                            className="flex items-center gap-3 rounded-md border border-hairline bg-canvas px-4 py-3"
                        >
                            <input
                                type="checkbox"
                                id={`term-${term.id}`}
                                className="h-4 w-4 shrink-0 accent-primary"
                                checked={checkedTerms[term.id]}
                                onClick={(event) =>
                                    onToggleTerm(
                                        term.id,
                                        event.currentTarget.checked,
                                    )
                                }
                                onChange={(event) =>
                                    onToggleTerm(
                                        term.id,
                                        event.target.checked,
                                    )
                                }
                            />
                            <label
                                htmlFor={`term-${term.id}`}
                                className="min-w-0 flex-1 text-xs leading-4 text-ink"
                            >
                                {term.title}
                                <span
                                    className={`ml-1 text-[12px] ${
                                        term.isRequired
                                            ? "text-red-500"
                                            : "text-muted"
                                    }`}
                                >
                                    {term.isRequired ? "(필수)" : "(선택)"}
                                </span>
                            </label>
                            <Button
                                variant="outline"
                                size="sm"
                                className="!h-8 shrink-0 !rounded-md !px-3 !text-[12px]"
                                onClick={() => onOpenTerm(term)}
                            >
                                보기
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-3 rounded-md bg-surface-strong px-4 py-3">
                    <p className="text-center text-[12px] leading-5 text-muted">
                        본 서비스는 모의 투자 교육 목적의 서비스이며 실제
                        금융투자상품 매매를 중개하지 않습니다. 서비스 내 모든
                        자산은 가상 포트폴리오 기준이며 실제 현금 가치를
                        보장하지 않습니다.
                    </p>
                </div>
            </div>

            <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-6"
                disabled={!allTermsChecked}
                onClick={onNext}
            >
                다음
            </Button>
        </>
    );
}
