"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import { sendEmailVerificationCode, signup, verifyEmailCode } from "@/lib/api/auth";
import {
    TERMS_AND_CONDITIONS,
    type TermDetail,
} from "@/features/signup/constants/terms";
import TermDetailModal from "./TermDetailModal";
import InvestmentExperienceStep from "./InvestmentExperienceStep";
import SignupCard from "./SignupCard";
import SignupFormStep from "./SignupFormStep";
import TermsAgreementStep from "./TermsAgreementStep";
import type {
    InvestmentExperienceLevel,
    SignupFormErrors,
    SignupFormData,
    SignupStep,
} from "../types";

const INITIAL_FORM_DATA: SignupFormData = {
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
    birthDate: null,
    emailLocal: "",
    emailDomain: "",
};

type SignupTextField = Exclude<keyof SignupFormData, "birthDate">;

function parseBirthDate(value: string) {
    const match = /^(\d{4})(\d{2})(\d{2})$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

const STEP_TITLE: Record<SignupStep, string> = {
    terms: "약관 동의",
    account: "회원가입",
    experience: "투자 경험 선택",
};

function createCheckedTerms(checked: boolean) {
    return TERMS_AND_CONDITIONS.reduce<Record<string, boolean>>((acc, term) => {
        acc[term.id] = checked;
        return acc;
    }, {});
}

export default function SignupFlow() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<SignupStep>("terms");
    const [checkedTerms, setCheckedTerms] = useState<Record<string, boolean>>(
        () => createCheckedTerms(false),
    );
    const [selectedTerm, setSelectedTerm] = useState<TermDetail | null>(null);
    const [formData, setFormData] =
        useState<SignupFormData>(INITIAL_FORM_DATA);
    const [birthDateInput, setBirthDateInput] = useState("");
    const [formErrors, setFormErrors] = useState<SignupFormErrors>({});
    const [selectedExperience, setSelectedExperience] =
        useState<InvestmentExperienceLevel | null>(null);
    const [emailCode, setEmailCode] = useState("");
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<"idle" | "sent" | "verified">("idle");
    const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
    const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
    const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);

    useEffect(() => {
        if (!selectedTerm) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [selectedTerm]);

    const allTermsChecked = TERMS_AND_CONDITIONS.every(
        (term) => checkedTerms[term.id],
    );

    const handleBack = () => {
        if (currentStep === "terms") {
            window.history.back();
            return;
        }

        setCurrentStep((prev) => (prev === "experience" ? "account" : "terms"));
    };

    const handleToggleAllTerms = (checked: boolean) => {
        setCheckedTerms(createCheckedTerms(checked));
    };

    const handleToggleTerm = (termId: string, checked: boolean) => {
        setCheckedTerms((prev) => ({
            ...prev,
            [termId]: checked,
        }));
    };

    const handleChangeFormData = (
        field: SignupTextField,
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setFormErrors((prev) => ({
            ...prev,
            [field]: undefined,
            ...(field === "password" ? { passwordConfirm: undefined } : {}),
        }));

        if (field === "emailLocal" || field === "emailDomain") {
            setEmailCode("");
            setEmailVerificationStatus("idle");
        }
    };

    const email = `${formData.emailLocal.trim()}@${formData.emailDomain.trim()}`;

    const handleSendEmailCode = async () => {
        if (!formData.emailLocal.trim() || !formData.emailDomain.trim()) {
            setFormErrors((current) => ({ ...current, emailVerification: "이메일 주소를 먼저 입력해 주세요." }));
            return;
        }

        setIsSendingEmailCode(true);
        setFormErrors((current) => ({ ...current, emailVerification: undefined }));

        try {
            await sendEmailVerificationCode(email);
            setEmailCode("");
            setEmailVerificationStatus("sent");
        } catch (error) {
            setFormErrors((current) => ({ ...current, emailVerification: getApiErrorMessage(error, "인증번호 발송에 실패했습니다.") }));
        } finally {
            setIsSendingEmailCode(false);
        }
    };

    const handleVerifyEmailCode = async () => {
        if (emailCode.length !== 6) {
            setFormErrors((current) => ({ ...current, emailVerification: "인증번호 6자리를 입력해 주세요." }));
            return;
        }

        setIsVerifyingEmailCode(true);
        setFormErrors((current) => ({ ...current, emailVerification: undefined }));

        try {
            await verifyEmailCode(email, emailCode);
            setEmailVerificationStatus("verified");
        } catch (error) {
            setFormErrors((current) => ({ ...current, emailVerification: getApiErrorMessage(error, "이메일 인증에 실패했습니다.") }));
        } finally {
            setIsVerifyingEmailCode(false);
        }
    };

    const handleChangeBirthDate = (value: string) => {
        setBirthDateInput(value);
        setFormData((prev) => ({
            ...prev,
            birthDate: parseBirthDate(value),
        }));
        setFormErrors((prev) => ({
            ...prev,
            birthDate: undefined,
        }));
    };

    const validateAccountStep = () => {
        const nextErrors: SignupFormErrors = {};
        const birthDatePattern = /^\d{8}$/;
        const trimmedBirthDate = birthDateInput.trim();

        if (!formData.userId.trim()) {
            nextErrors.userId = "아이디를 입력해 주세요.";
        }

        if (!formData.password) {
            nextErrors.password = "비밀번호를 입력해 주세요.";
        }

        if (!formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
        } else if (formData.password !== formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        if (!formData.name.trim()) {
            nextErrors.name = "이름을 입력해 주세요.";
        }

        if (!trimmedBirthDate) {
            nextErrors.birthDate = "생년월일을 입력해 주세요.";
        } else if (
            !birthDatePattern.test(trimmedBirthDate) ||
            !formData.birthDate
        ) {
            nextErrors.birthDate = "생년월일은 숫자 8자리로 입력해 주세요.";
        }

        if (!formData.emailLocal.trim()) {
            nextErrors.emailLocal = "이메일 아이디를 입력해 주세요.";
        }

        if (!formData.emailDomain.trim()) {
            nextErrors.emailDomain = "이메일 도메인을 입력해 주세요.";
        }

        if (emailVerificationStatus !== "verified") {
            nextErrors.emailVerification = "이메일 인증을 완료해 주세요.";
        }

        return nextErrors;
    };

    const handleNextAccountStep = () => {
        const nextErrors = validateAccountStep();

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        setFormErrors({});
        setCurrentStep("experience");
    };

    const handleCompleteSignup = async () => {
        if (!selectedExperience) {
            return;
        }

        setIsSubmittingSignup(true);
        setFormErrors((current) => ({ ...current, submit: undefined }));

        try {
            await signup({
                loginId: formData.userId.trim(),
                password: formData.password,
                name: formData.name.trim(),
                email,
                birthdate: `${birthDateInput.slice(0, 4)}-${birthDateInput.slice(4, 6)}-${birthDateInput.slice(6, 8)}`,
            });
            router.push("/welcome");
        } catch (error) {
            setFormErrors((current) => ({ ...current, submit: getApiErrorMessage(error, "회원가입 처리에 실패했습니다.") }));
        } finally {
            setIsSubmittingSignup(false);
        }
    };

    return (
        <SignupCard title={STEP_TITLE[currentStep]} onBack={handleBack} wide={currentStep === "experience"}>
            {currentStep === "terms" ? (
                <TermsAgreementStep
                    checkedTerms={checkedTerms}
                    allTermsChecked={allTermsChecked}
                    onToggleAllTerms={handleToggleAllTerms}
                    onToggleTerm={handleToggleTerm}
                    onOpenTerm={setSelectedTerm}
                    onNext={() => setCurrentStep("account")}
                />
            ) : null}

            {currentStep === "account" ? (
                <SignupFormStep
                    formData={formData}
                    birthDateInput={birthDateInput}
                    errors={formErrors}
                    onChange={handleChangeFormData}
                    onBirthDateChange={handleChangeBirthDate}
                    emailCode={emailCode}
                    emailVerificationStatus={emailVerificationStatus}
                    isSendingEmailCode={isSendingEmailCode}
                    isVerifyingEmailCode={isVerifyingEmailCode}
                    onEmailCodeChange={(value) => {
                        setEmailCode(value);
                        setFormErrors((current) => ({ ...current, emailVerification: undefined }));
                    }}
                    onSendEmailCode={handleSendEmailCode}
                    onVerifyEmailCode={handleVerifyEmailCode}
                    onNext={handleNextAccountStep}
                />
            ) : null}

            {currentStep === "experience" ? (
                <InvestmentExperienceStep
                    selectedExperience={selectedExperience}
                    onSelect={setSelectedExperience}
                    onNext={handleCompleteSignup}
                    isSubmitting={isSubmittingSignup}
                    error={formErrors.submit}
                />
            ) : null}

            {selectedTerm ? (
                <TermDetailModal
                    term={selectedTerm}
                    onClose={() => setSelectedTerm(null)}
                />
            ) : null}
        </SignupCard>
    );
}
