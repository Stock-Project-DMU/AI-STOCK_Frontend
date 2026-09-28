"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import RecoveryCard from "@/features/account-recovery/components/RecoveryCard";
import RecoveryField from "@/features/account-recovery/components/RecoveryField";
import RecoveryModal from "@/features/account-recovery/components/RecoveryModal";
import RecoveryEmailField from "@/features/account-recovery/components/RecoveryEmailField";
import { Button } from "@/components/common/Button";
import type { FindIdFormData } from "../types";
import { findLoginId, sendRecoveryEmailCode, verifyEmailCode } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/client";
import RecoveryVerification from "@/features/account-recovery/components/RecoveryVerification";
import { validateBirthDate, validateEmailDomain, validateEmailLocal } from "@/features/signup/validation";

const INITIAL_FORM_DATA: FindIdFormData = {
    name: "",
    birthDate: "",
    emailLocal: "",
    emailDomain: "",
};

type FindIdFormErrors = Partial<Record<keyof FindIdFormData, string>>;
type FindIdTextField = Exclude<keyof FindIdFormData, "birthDate">;

function formatBirthDate(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export default function FindIdCard() {
    const [formData, setFormData] =
        useState<FindIdFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<FindIdFormErrors>({});
    const [foundUserId, setFoundUserId] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [requestError, setRequestError] = useState("");

    const changeField = (field: FindIdTextField, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setCode("");
        setRequestError("");
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleChange = (field: FindIdTextField) =>
        (event: ChangeEvent<HTMLInputElement>) => changeField(field, event.target.value);

    const handleBirthDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            birthDate: formatBirthDate(event.target.value),
        }));
        setCode("");
        setRequestError("");
        setErrors((prev) => ({
            ...prev,
            birthDate: undefined,
        }));
    };

    const validateForm = () => {
        const nextErrors: FindIdFormErrors = {};
        const birthDateDigits = formData.birthDate.replace(/\D/g, "");

        if (!formData.name.trim()) {
            nextErrors.name = "이름을 입력해 주세요.";
        }

        nextErrors.birthDate = validateBirthDate(birthDateDigits);
        nextErrors.emailLocal = validateEmailLocal(formData.emailLocal);
        nextErrors.emailDomain = validateEmailDomain(formData.emailDomain);

        return nextErrors;
    };

    const email = `${formData.emailLocal.trim()}@${formData.emailDomain.trim()}`;
    const birthdate = formData.birthDate;
    const identityKey = `${formData.name}|${birthdate}|${email}`;

    const handleSendCode = async () => {
        const nextErrors = validateForm();
        setErrors(nextErrors);
        if (Object.values(nextErrors).some(Boolean)) return false;
        setRequestError("");
        await sendRecoveryEmailCode({ purpose: "FIND_ID", name: formData.name.trim(), email, birthdate });
        return true;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;

        const nextErrors = validateForm();

        if (Object.values(nextErrors).some(Boolean)) {
            setErrors(nextErrors);
            return;
        }
        if (code.length !== 6) return;

        setErrors({});

        setBusy(true);
        setRequestError("");
        try {
            await verifyEmailCode(email, code);
            setFoundUserId(await findLoginId({ name: formData.name.trim(), email, birthdate }));
        } catch (error) { setRequestError(getApiErrorMessage(error, "아이디 찾기에 실패했습니다.")); }
        finally { setBusy(false); }
    };

    return (
        <RecoveryCard title="아이디 찾기">
            <form className="mt-8" onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-2 rounded-lg border border-hairline-soft bg-surface-soft p-4 py-6">
                    <RecoveryField
                        id="find-id-name"
                        name="name"
                        label="이름"
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder="이름 입력"
                        autoComplete="name"
                        errorMessage={errors.name}
                    />

                    <RecoveryField
                        id="find-id-birth-date"
                        name="birthDate"
                        label="생년월일"
                        value={formData.birthDate}
                        onChange={handleBirthDateChange}
                        placeholder="YYYY-MM-DD"
                        inputMode="numeric"
                        maxLength={10}
                        helperText="숫자 8자리를 입력하면 하이픈이 자동으로 들어갑니다."
                        errorMessage={errors.birthDate}
                    />

                    <RecoveryEmailField
                        idPrefix="find-id"
                        emailLocal={formData.emailLocal}
                        emailDomain={formData.emailDomain}
                        localError={errors.emailLocal}
                        domainError={errors.emailDomain}
                        onLocalChange={(value) => changeField("emailLocal", value)}
                        onDomainChange={(value) => changeField("emailDomain", value)}
                    />
                </div>

                <RecoveryVerification
                    key={identityKey}
                    code={code}
                    onCodeChange={(value) => { setCode(value); setRequestError(""); }}
                    onSend={handleSendCode}
                />
                {requestError && <p role="alert" className="mt-2 text-sm text-red-500">{requestError}</p>}
                <Button type="submit" disabled={busy || code.length !== 6} fullWidth size="md" className="mt-10">
                    확인
                </Button>
            </form>

            {foundUserId ? (
                <RecoveryModal
                    title="아이디 찾기 결과"
                    onClose={() => setFoundUserId(null)}
                >
                    <p className="text-center text-sm text-body">
                        찾으신 아이디는{" "}
                        <span className="font-bold text-ink">
                            {foundUserId}
                        </span>
                        입니다.
                    </p>
                </RecoveryModal>
            ) : null}
        </RecoveryCard>
    );
}
