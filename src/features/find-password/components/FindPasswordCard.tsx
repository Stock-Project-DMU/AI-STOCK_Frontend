"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import RecoveryCard from "@/features/account-recovery/components/RecoveryCard";
import RecoveryField from "@/features/account-recovery/components/RecoveryField";
import RecoveryModal from "@/features/account-recovery/components/RecoveryModal";
import type { FindPasswordFormData } from "../types";

const INITIAL_FORM_DATA: FindPasswordFormData = {
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
};

type FindPasswordFormErrors = Partial<
    Record<keyof FindPasswordFormData, string>
>;

export default function FindPasswordCard() {
    const [formData, setFormData] =
        useState<FindPasswordFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<FindPasswordFormErrors>({});
    const [isComplete, setIsComplete] = useState(false);

    const handleChange =
        (field: keyof FindPasswordFormData) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
                ...(field === "password" ? { passwordConfirm: undefined } : {}),
            }));
        };

    const validateForm = () => {
        const nextErrors: FindPasswordFormErrors = {};

        if (!formData.userId.trim()) {
            nextErrors.userId = "아이디를 입력해 주세요.";
        }

        if (!formData.password) {
            nextErrors.password = "새 비밀번호를 입력해 주세요.";
        }

        if (!formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
        } else if (formData.password !== formData.passwordConfirm) {
            nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        if (!formData.name.trim()) {
            nextErrors.name = "이름을 입력해 주세요.";
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

        // TODO: 비밀번호 재설정 API 요청
        setIsComplete(true);
    };

    return (
        <RecoveryCard title="비밀번호 재설정">
            <form className="mt-8" onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-2 rounded-lg border border-gray-300 bg-gray-100 p-4 py-6">
                    <RecoveryField
                        id="find-password-user-id"
                        name="userId"
                        label="아이디"
                        value={formData.userId}
                        onChange={handleChange("userId")}
                        placeholder="아이디 입력"
                        autoComplete="username"
                        errorMessage={errors.userId}
                    />

                    <RecoveryField
                        id="find-password-password"
                        name="password"
                        label="비밀번호"
                        type="password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        placeholder="비밀번호 입력"
                        autoComplete="new-password"
                        errorMessage={errors.password}
                    />

                    <RecoveryField
                        id="find-password-password-confirm"
                        name="passwordConfirm"
                        label="비밀번호 확인"
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={handleChange("passwordConfirm")}
                        placeholder="비밀번호 재입력"
                        autoComplete="new-password"
                        errorMessage={errors.passwordConfirm}
                    />

                    <RecoveryField
                        id="find-password-name"
                        name="name"
                        label="이름"
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder="이름 입력"
                        autoComplete="name"
                        errorMessage={errors.name}
                    />
                </div>

                <button
                    type="submit"
                    className="mt-10 w-full bg-black px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
                >
                    확인
                </button>
            </form>

            {isComplete ? (
                <RecoveryModal
                    title="비밀번호가 변경되었습니다."
                    onClose={() => setIsComplete(false)}
                />
            ) : null}
        </RecoveryCard>
    );
}
