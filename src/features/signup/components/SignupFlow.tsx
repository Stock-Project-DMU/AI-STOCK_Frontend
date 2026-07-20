"use client";

import { useEffect, useState } from "react";
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

    const handleCompleteSignup = () => {
        // TODO: Connect signup submission or navigation after API integration.
    };

    return (
        <SignupCard title={STEP_TITLE[currentStep]} onBack={handleBack}>
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
                    onNext={handleNextAccountStep}
                />
            ) : null}

            {currentStep === "experience" ? (
                <InvestmentExperienceStep
                    selectedExperience={selectedExperience}
                    onSelect={setSelectedExperience}
                    onNext={handleCompleteSignup}
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
