"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import RecoveryCard from "@/features/account-recovery/components/RecoveryCard";
import RecoveryField from "@/features/account-recovery/components/RecoveryField";
import RecoveryEmailField from "@/features/account-recovery/components/RecoveryEmailField";
import RecoveryModal from "@/features/account-recovery/components/RecoveryModal";
import RecoveryVerification from "@/features/account-recovery/components/RecoveryVerification";
import { Button } from "@/components/common/Button";
import type { FindPasswordFormData } from "../types";
import { resetPassword, sendRecoveryEmailCode, verifyEmailCode } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import { validateEmailDomain, validateEmailLocal, validatePassword } from "@/features/signup/validation";

const INITIAL_FORM_DATA: FindPasswordFormData = {
    userId: "",
    name: "",
    emailLocal: "",
    emailDomain: "",
    password: "",
    passwordConfirm: "",
};

type FindPasswordFormErrors = Partial<Record<keyof FindPasswordFormData, string>>;
type IdentityField = "userId" | "name" | "emailLocal" | "emailDomain";

export default function FindPasswordCard() {
    const [formData, setFormData] = useState<FindPasswordFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<FindPasswordFormErrors>({});
    const [step, setStep] = useState<"verify" | "reset">("verify");
    const [isComplete, setIsComplete] = useState(false);
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [requestError, setRequestError] = useState("");

    const email = `${formData.emailLocal.trim()}@${formData.emailDomain.trim()}`;
    const identityKey = `${formData.userId}|${formData.name}|${email}`;

    function changeIdentity(field: IdentityField, value: string) {
        setFormData((current) => ({ ...current, [field]: value }));
        setCode("");
        setRequestError("");
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    function changePassword(field: "password" | "passwordConfirm", value: string) {
        setFormData((current) => ({ ...current, [field]: value }));
        setRequestError("");
        setErrors((current) => ({
            ...current,
            [field]: undefined,
            ...(field === "password" ? { passwordConfirm: undefined } : {}),
        }));
    }

    function validateIdentity() {
        const nextErrors: FindPasswordFormErrors = {};
        if (!formData.userId.trim()) nextErrors.userId = "아이디를 입력해 주세요.";
        if (!formData.name.trim()) nextErrors.name = "이름을 입력해 주세요.";
        nextErrors.emailLocal = validateEmailLocal(formData.emailLocal);
        nextErrors.emailDomain = validateEmailDomain(formData.emailDomain);
        return nextErrors;
    }

    async function handleSendCode() {
        const nextErrors = validateIdentity();
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return false;
        setRequestError("");
        await sendRecoveryEmailCode({
            purpose: "RESET_PASSWORD",
            loginId: formData.userId.trim(),
            name: formData.name.trim(),
            email,
        });
        return true;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;

        if (step === "verify") {
            const nextErrors = validateIdentity();
            setErrors(nextErrors);
            if (Object.values(nextErrors).some(Boolean)) return;
            if (code.length !== 6) {
                setRequestError("인증번호 6자리를 입력해 주세요.");
                return;
            }
            setBusy(true);
            setRequestError("");
            try {
                await verifyEmailCode(email, code);
                setStep("reset");
            } catch (error) {
                setRequestError(getApiErrorMessage(error, "이메일 인증에 실패했습니다."));
            } finally {
                setBusy(false);
            }
            return;
        }

        const nextErrors: FindPasswordFormErrors = {
            password: validatePassword(formData.password),
        };
        if (!formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
        } else if (formData.password !== formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return;

        setBusy(true);
        setRequestError("");
        try {
            await resetPassword({
                loginId: formData.userId.trim(),
                name: formData.name.trim(),
                email,
                newPassword: formData.password,
            });
            setIsComplete(true);
        } catch (error) {
            setRequestError(getApiErrorMessage(error, "비밀번호 변경에 실패했습니다."));
        } finally {
            setBusy(false);
        }
    }

    return (
        <RecoveryCard title={step === "verify" ? "비밀번호 찾기" : "비밀번호 재설정"}>
            <form className="mt-8" onSubmit={handleSubmit} noValidate>
                {step === "verify" ? (
                    <>
                        <div className="flex flex-col gap-2 rounded-lg border border-hairline-soft bg-surface-soft p-4 py-6">
                            <RecoveryField
                                id="find-password-user-id"
                                name="userId"
                                label="아이디"
                                value={formData.userId}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => changeIdentity("userId", event.target.value)}
                                placeholder="아이디 입력"
                                autoComplete="username"
                                errorMessage={errors.userId}
                            />
                            <RecoveryField
                                id="find-password-name"
                                name="name"
                                label="이름"
                                value={formData.name}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => changeIdentity("name", event.target.value)}
                                placeholder="이름 입력"
                                autoComplete="name"
                                errorMessage={errors.name}
                            />
                            <RecoveryEmailField
                                idPrefix="find-password"
                                emailLocal={formData.emailLocal}
                                emailDomain={formData.emailDomain}
                                localError={errors.emailLocal}
                                domainError={errors.emailDomain}
                                onLocalChange={(value) => changeIdentity("emailLocal", value)}
                                onDomainChange={(value) => changeIdentity("emailDomain", value)}
                            />
                        </div>
                        <RecoveryVerification
                            key={identityKey}
                            code={code}
                            onCodeChange={(value) => { setCode(value); setRequestError(""); }}
                            onSend={handleSendCode}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-2 rounded-lg border border-hairline-soft bg-surface-soft p-4 py-6">
                        <p className="mb-2 text-sm text-muted">이메일 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.</p>
                        <RecoveryField
                            id="find-password-password"
                            name="password"
                            label="새 비밀번호"
                            type="password"
                            value={formData.password}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => changePassword("password", event.target.value)}
                            placeholder="영문과 숫자를 포함한 8자 이상"
                            autoComplete="new-password"
                            errorMessage={errors.password}
                        />
                        <RecoveryField
                            id="find-password-password-confirm"
                            name="passwordConfirm"
                            label="새 비밀번호 확인"
                            type="password"
                            value={formData.passwordConfirm}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => changePassword("passwordConfirm", event.target.value)}
                            placeholder="새 비밀번호 재입력"
                            autoComplete="new-password"
                            errorMessage={errors.passwordConfirm}
                        />
                    </div>
                )}
                {requestError && <p role="alert" className="mt-3 text-sm text-red-500">{requestError}</p>}
                <Button type="submit" disabled={busy || (step === "verify" && code.length !== 6)} fullWidth size="md" className="mt-8">
                    {busy ? "처리 중..." : step === "verify" ? "인증하고 다음" : "비밀번호 변경"}
                </Button>
                {step === "reset" && (
                    <button
                        type="button"
                        onClick={() => { setStep("verify"); setCode(""); setRequestError(""); }}
                        className="mt-3 w-full rounded-md border border-hairline px-3 py-2 text-sm text-muted"
                    >
                        이메일 인증 다시 하기
                    </button>
                )}
            </form>

            {isComplete && (
                <RecoveryModal title="비밀번호가 변경되었습니다." onClose={() => setIsComplete(false)} />
            )}
        </RecoveryCard>
    );
}
