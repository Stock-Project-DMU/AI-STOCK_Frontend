"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import RecoveryCard from "@/features/account-recovery/components/RecoveryCard";
import RecoveryField from "@/features/account-recovery/components/RecoveryField";
import RecoveryModal from "@/features/account-recovery/components/RecoveryModal";
import { Button } from "@/components/common/Button";
import type { FindIdFormData } from "../types";

const INITIAL_FORM_DATA: FindIdFormData = {
    name: "",
    birthDate: null,
    emailLocal: "",
    emailDomain: "",
};

type FindIdFormErrors = Partial<Record<keyof FindIdFormData, string>>;
type FindIdTextField = Exclude<keyof FindIdFormData, "birthDate">;

const MOCK_FOUND_USER_ID = "user123";

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

export default function FindIdCard() {
    const [formData, setFormData] =
        useState<FindIdFormData>(INITIAL_FORM_DATA);
    const [birthDateInput, setBirthDateInput] = useState("");
    const [errors, setErrors] = useState<FindIdFormErrors>({});
    const [foundUserId, setFoundUserId] = useState<string | null>(null);

    const handleChange =
        (field: FindIdTextField) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        };

    const handleBirthDateChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setBirthDateInput(value);
        setFormData((prev) => ({
            ...prev,
            birthDate: parseBirthDate(value),
        }));
        setErrors((prev) => ({
            ...prev,
            birthDate: undefined,
        }));
    };

    const validateForm = () => {
        const nextErrors: FindIdFormErrors = {};
        const birthDatePattern = /^\d{8}$/;
        const trimmedBirthDate = birthDateInput.trim();

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors = validateForm();

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        setErrors({});

        // TODO: 아이디 찾기 API 요청
        setFoundUserId(MOCK_FOUND_USER_ID);
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
                        value={birthDateInput}
                        onChange={handleBirthDateChange}
                        placeholder="생년월일 8자리 입력"
                        inputMode="numeric"
                        maxLength={8}
                        helperText="예: 19990101"
                        errorMessage={errors.birthDate}
                    />

                    <div className="mt-2">
                        <label
                            htmlFor="find-id-email-local"
                            className="mb-1 block text-xs font-semibold"
                        >
                            이메일
                        </label>
                        <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <input
                                    id="find-id-email-local"
                                    name="emailLocal"
                                    type="text"
                                    value={formData.emailLocal}
                                    onChange={handleChange("emailLocal")}
                                    placeholder="이메일 입력"
                                    required
                                    aria-invalid={Boolean(errors.emailLocal)}
                                    aria-describedby={
                                        errors.emailLocal
                                            ? "find-id-email-local-helper"
                                            : undefined
                                    }
                                    className={`w-full rounded-md border bg-canvas px-3 py-2 text-sm outline-none ${
                                        errors.emailLocal
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-hairline focus:border-primary"
                                    }`}
                                />
                                {errors.emailLocal ? (
                                    <p
                                        id="find-id-email-local-helper"
                                        className="mt-1 px-1 text-xs text-red-500"
                                    >
                                        {errors.emailLocal}
                                    </p>
                                ) : null}
                            </div>
                            <span className="pt-2 text-xs text-muted">@</span>
                            <div className="min-w-0 flex-1">
                                <input
                                    name="emailDomain"
                                    type="text"
                                    value={formData.emailDomain}
                                    onChange={handleChange("emailDomain")}
                                    aria-label="이메일 도메인"
                                    placeholder="도메인 입력"
                                    required
                                    aria-invalid={Boolean(errors.emailDomain)}
                                    aria-describedby={
                                        errors.emailDomain
                                            ? "find-id-email-domain-helper"
                                            : undefined
                                    }
                                    className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ${
                                        errors.emailDomain
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-gray-300 focus:border-black"
                                    }`}
                                />
                                {errors.emailDomain ? (
                                    <p
                                        id="find-id-email-domain-helper"
                                        className="mt-1 px-1 text-xs text-red-500"
                                    >
                                        {errors.emailDomain}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" fullWidth size="md" className="mt-10">
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
