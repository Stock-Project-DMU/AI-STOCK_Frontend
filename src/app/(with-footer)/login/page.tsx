"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

type LoginFormData = {
    userId: string;
    password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const INITIAL_FORM_DATA: LoginFormData = {
    userId: "",
    password: "",
};

export default function LoginPage() {
    const [formData, setFormData] = useState<LoginFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<LoginFormErrors>({});

    const handleChange =
        (field: keyof LoginFormData) =>
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

    const validateForm = () => {
        const nextErrors: LoginFormErrors = {};

        if (!formData.userId.trim()) {
            nextErrors.userId = "아이디를 입력해 주세요.";
        }

        if (!formData.password) {
            nextErrors.password = "비밀번호를 입력해 주세요.";
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
        // TODO: 로그인 API 요청
    };

    const getInputClassName = (hasError: boolean) =>
        `rounded-lg border bg-white px-4 py-3 outline-none ${
            hasError
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-black"
        }`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-[400px] rounded-lg bg-white p-8">
                <h1 className="m-5 mb-15 text-center text-3xl font-semibold">
                    로그인
                </h1>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div>
                        <label htmlFor="login-user-id" className="sr-only">
                            아이디
                        </label>
                        <input
                            id="login-user-id"
                            name="userId"
                            type="text"
                            placeholder="아이디"
                            value={formData.userId}
                            onChange={handleChange("userId")}
                            autoComplete="username"
                            aria-invalid={Boolean(errors.userId)}
                            aria-describedby={
                                errors.userId
                                    ? "login-user-id-helper"
                                    : undefined
                            }
                            className={`w-full ${getInputClassName(
                                Boolean(errors.userId),
                            )}`}
                        />
                        {errors.userId ? (
                            <p
                                id="login-user-id-helper"
                                className="mt-1 px-1 text-xs text-red-500"
                            >
                                {errors.userId}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="login-password" className="sr-only">
                            비밀번호
                        </label>
                        <input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={handleChange("password")}
                            autoComplete="current-password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? "login-password-helper"
                                    : undefined
                            }
                            className={`w-full ${getInputClassName(
                                Boolean(errors.password),
                            )}`}
                        />
                        {errors.password ? (
                            <p
                                id="login-password-helper"
                                className="mt-1 px-1 text-xs text-red-500"
                            >
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        className="bg-black px-4 py-3 text-white hover:bg-gray-700"
                    >
                        로그인
                    </button>
                    <button
                        type="button"
                        className="bg-yellow-300 px-4 py-3 text-black hover:bg-yellow-400"
                    >
                        카카오 로그인
                    </button>
                    <button
                        type="button"
                        className="bg-green-400 px-4 py-3 text-black hover:bg-green-500"
                    >
                        네이버 로그인
                    </button>
                    <button
                        type="button"
                        className="border border-gray-500 bg-white px-4 py-3 text-black hover:bg-gray-200"
                    >
                        구글 로그인
                    </button>
                </form>
                <div className="mt-4 flex justify-center gap-3 text-sm text-gray-600">
                    <p>AI STOCK 회원이 아니신가요?</p>
                    <Link
                        href="/signup"
                        className="font-medium text-black hover:underline"
                    >
                        회원가입
                    </Link>
                </div>
                <div className="mt-4 flex justify-center gap-3 text-sm text-gray-600">
                    <Link
                        href="/find-id"
                        className="font-medium text-black hover:underline"
                    >
                        아이디 찾기
                    </Link>
                    <Link
                        href="/find-password"
                        className="font-medium text-black hover:underline"
                    >
                        비밀번호 찾기
                    </Link>
                </div>
            </div>
        </div>
    );
}
