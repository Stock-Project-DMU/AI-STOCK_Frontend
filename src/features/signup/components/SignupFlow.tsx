"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import { checkInitialAdminExists, checkLoginId, login, sendEmailVerificationCode, signup, verifyEmailCode } from "@/lib/api/auth";
import InvestmentSurvey from "@/features/ai-financial-planner/components/InvestmentSurvey";
import {
    TERMS_AND_CONDITIONS,
    type TermDetail,
} from "@/features/signup/constants/terms";
import TermDetailModal from "./TermDetailModal";
import InitialAdminModal from "./InitialAdminModal";
import SignupCard from "./SignupCard";
import SignupFormStep from "./SignupFormStep";
import TermsAgreementStep from "./TermsAgreementStep";
import type {
    SignupFormErrors,
    SignupFormData,
    SignupStep,
} from "../types";
import {
    parseBirthDate,
    validateBirthDate,
    validateEmail,
    validateEmailWhileTyping,
    validateName,
    validatePassword,
} from "../validation";

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

const STEP_TITLE: Record<SignupStep, string> = {
    terms: "약관 동의",
    account: "회원가입",
    survey: "투자 성향 설문",
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
    const [createdCredentials, setCreatedCredentials] = useState<{ loginId: string; password: string } | null>(null);
    const [emailCode, setEmailCode] = useState("");
    const [emailVerificationStatus, setEmailVerificationStatus] = useState<"idle" | "sent" | "verified">("idle");
    const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
    const [isVerifyingEmailCode, setIsVerifyingEmailCode] = useState(false);
    const [isSubmittingSignup, setIsSubmittingSignup] = useState(false);
    const [checkedLoginId, setCheckedLoginId] = useState("");
    const [checkingLoginId, setCheckingLoginId] = useState(false);
    const [showInitialAdminModal, setShowInitialAdminModal] = useState(false);

    useEffect(() => {
        let active = true;
        checkInitialAdminExists().then(result => { if (active && !result.adminExists) setShowInitialAdminModal(true); }).catch(() => {});
        return () => { active = false; };
    }, []);

    const handleCheckLoginId = async () => {
        const loginId = formData.userId.trim();
        setCheckingLoginId(true);
        setCheckedLoginId("");
        try {
            const result = await checkLoginId(loginId);
            if (result.available) setCheckedLoginId(loginId);
            setFormErrors(current => ({ ...current, userId: result.available ? undefined : "이미 사용 중인 아이디입니다." }));
        } catch (error) {
            setFormErrors(current => ({ ...current, userId: getApiErrorMessage(error, "중복 확인에 실패했습니다.") }));
        } finally { setCheckingLoginId(false); }
    };

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

        setCurrentStep("terms");
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
        const nextFormData = { ...formData, [field]: value };
        setFormData(nextFormData);
        if (field === "userId") setCheckedLoginId("");
        setFormErrors((prev) => {
            const nextErrors = { ...prev };

            if (field === "password") {
                nextErrors.password = validatePassword(value);
                if (nextFormData.passwordConfirm) {
                    nextErrors.passwordConfirm = value === nextFormData.passwordConfirm
                        ? undefined
                        : "비밀번호가 일치하지 않습니다.";
                }
            } else if (field === "passwordConfirm") {
                nextErrors.passwordConfirm = !value
                    ? "비밀번호 확인을 입력해 주세요."
                    : value === nextFormData.password
                        ? undefined
                        : "비밀번호가 일치하지 않습니다.";
            } else if (field === "name") {
                nextErrors.name = validateName(value);
            } else if (field === "emailLocal" || field === "emailDomain") {
                nextErrors.email = validateEmailWhileTyping(
                    nextFormData.emailLocal,
                    nextFormData.emailDomain,
                    field,
                );
                nextErrors.emailLocal = undefined;
                nextErrors.emailDomain = undefined;
                nextErrors.emailVerification = undefined;
            } else {
                nextErrors[field] = undefined;
            }

            return nextErrors;
        });

        if (field === "emailLocal" || field === "emailDomain") {
            setEmailCode("");
            setEmailVerificationStatus("idle");
        }
    };

    const email = `${formData.emailLocal.trim()}@${formData.emailDomain.trim()}`;

    const handleSendEmailCode = async () => {
        const emailError = validateEmail(
            formData.emailLocal,
            formData.emailDomain,
        );

        if (emailError) {
            setFormErrors((current) => ({
                ...current,
                emailLocal: undefined,
                emailDomain: undefined,
                emailVerification: undefined,
                email: emailError,
            }));
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
            birthDate: validateBirthDate(value),
        }));
    };

    const validateAccountStep = () => {
        const nextErrors: SignupFormErrors = {};

        if (!formData.userId.trim()) {
            nextErrors.userId = "아이디를 입력해 주세요.";
        } else if (checkedLoginId !== formData.userId.trim()) {
            nextErrors.userId = "아이디 중복 확인을 완료해 주세요.";
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            nextErrors.password = passwordError;
        }

        if (!formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
        } else if (formData.password !== formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        const nameError = validateName(formData.name);
        if (nameError) {
            nextErrors.name = nameError;
        }

        const birthDateError = validateBirthDate(birthDateInput);
        if (birthDateError) {
            nextErrors.birthDate = birthDateError;
        }

        const emailError = validateEmail(
            formData.emailLocal,
            formData.emailDomain,
        );
        if (emailError) {
            nextErrors.email = emailError;
        }

        if (
            !emailError &&
            emailVerificationStatus !== "verified"
        ) {
            nextErrors.emailVerification = "이메일 인증을 완료해 주세요.";
        }

        return nextErrors;
    };

    const handleNextAccountStep = async () => {
        const nextErrors = createdCredentials ? {} : validateAccountStep();

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        setIsSubmittingSignup(true);
        setFormErrors({});
        const credentials = createdCredentials ?? { loginId: formData.userId.trim(), password: formData.password };
        let signupSucceeded = Boolean(createdCredentials);

        try {
            if (!createdCredentials) {
                await signup({
                    loginId: credentials.loginId,
                    password: credentials.password,
                    name: formData.name.trim(),
                    email,
                    birthdate: `${birthDateInput.slice(0, 4)}-${birthDateInput.slice(4, 6)}-${birthDateInput.slice(6, 8)}`,
                });
                signupSucceeded = true;
                setCreatedCredentials(credentials);
            }
            await login(credentials.loginId, credentials.password);
            setCurrentStep("survey");
        } catch (error) {
            const message = getApiErrorMessage(error, signupSucceeded ? "다시 시도해 주세요." : "회원가입 처리에 실패했습니다.");
            setFormErrors((current) => ({ ...current, submit: signupSucceeded ? `계정은 생성됐지만 자동 로그인에 실패했습니다. ${message}` : message }));
        } finally {
            setIsSubmittingSignup(false);
        }
    };

    if (currentStep === "survey") {
        return (
            <div className="market-theme">
                <InvestmentSurvey
                    skipIntro
                    onSaved={() => router.replace("/welcome")}
                    onComplete={() => router.replace("/welcome")}
                    completeLabel="가입 완료"
                />
                {showInitialAdminModal ? (
                    <InitialAdminModal onClose={() => setShowInitialAdminModal(false)} />
                ) : null}
            </div>
        );
    }

    return (
        <SignupCard title={STEP_TITLE[currentStep]} onBack={handleBack}>
            {showInitialAdminModal ? (
                <InitialAdminModal onClose={() => setShowInitialAdminModal(false)} />
            ) : null}

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
                    isSubmitting={isSubmittingSignup}
                    accountCreated={Boolean(createdCredentials)}
                    onCheckLoginId={handleCheckLoginId}
                    checkingLoginId={checkingLoginId}
                    loginIdAvailable={checkedLoginId === formData.userId.trim() && checkedLoginId !== ""}
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
