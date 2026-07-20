import type { ChangeEvent } from "react";
import type { SignupFormData, SignupFormErrors } from "../types";

type SignupTextField = Exclude<keyof SignupFormData, "birthDate">;

type SignupFormStepProps = {
    formData: SignupFormData;
    birthDateInput: string;
    errors: SignupFormErrors;
    onChange: (field: SignupTextField, value: string) => void;
    onBirthDateChange: (value: string) => void;
    onNext: () => void;
};

export default function SignupFormStep({
    formData,
    birthDateInput,
    errors,
    onChange,
    onBirthDateChange,
    onNext,
}: SignupFormStepProps) {
    const handleChange =
        (field: SignupTextField) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            onChange(field, event.target.value);
        };

    const getInputClassName = (hasError: boolean, className = "") =>
        `${className} rounded-md border bg-white px-3 py-2 text-sm outline-none ${
            hasError
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-black"
        }`;

    const renderHelperText = (id: string, message?: string, helper?: string) => {
        const text = message ?? helper;

        if (!text) {
            return null;
        }

        return (
            <p
                id={id}
                className={`mt-1 px-1 text-xs ${
                    message ? "text-red-500" : "text-gray-500"
                }`}
            >
                {text}
            </p>
        );
    };

    return (
        <>
            <div className="mt-12 rounded-lg border border-gray-300 bg-gray-100 p-4">
                <div>
                    <label
                        htmlFor="signup-user-id"
                        className="mb-1 block text-xs font-semibold"
                    >
                        아이디
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="signup-user-id"
                            className={getInputClassName(
                                Boolean(errors.userId),
                                "min-w-0 flex-1",
                            )}
                            placeholder="아이디 입력"
                            value={formData.userId}
                            onChange={handleChange("userId")}
                            aria-invalid={Boolean(errors.userId)}
                            aria-describedby={
                                errors.userId
                                    ? "signup-user-id-helper"
                                    : undefined
                            }
                        />
                        <button
                            type="button"
                            className="rounded-md bg-black px-3 text-xs font-semibold text-white hover:bg-gray-700"
                        >
                            중복확인
                        </button>
                    </div>
                    {renderHelperText("signup-user-id-helper", errors.userId)}
                </div>

                <div className="mt-2">
                    <label
                        htmlFor="signup-password"
                        className="mb-1 block text-xs font-semibold"
                    >
                        비밀번호
                    </label>
                    <input
                        type="password"
                        id="signup-password"
                        className={getInputClassName(
                            Boolean(errors.password),
                            "w-full",
                        )}
                        placeholder="비밀번호 입력"
                        value={formData.password}
                        onChange={handleChange("password")}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={
                            errors.password
                                ? "signup-password-helper"
                                : undefined
                        }
                    />
                    {renderHelperText("signup-password-helper", errors.password)}
                </div>

                <div className="mt-2">
                    <label
                        htmlFor="signup-password-confirm"
                        className="mb-1 block text-xs font-semibold"
                    >
                        비밀번호 확인
                    </label>
                    <input
                        type="password"
                        id="signup-password-confirm"
                        className={getInputClassName(
                            Boolean(errors.passwordConfirm),
                            "w-full",
                        )}
                        placeholder="비밀번호 재입력"
                        value={formData.passwordConfirm}
                        onChange={handleChange("passwordConfirm")}
                        aria-invalid={Boolean(errors.passwordConfirm)}
                        aria-describedby={
                            errors.passwordConfirm
                                ? "signup-password-confirm-helper"
                                : undefined
                        }
                    />
                    {renderHelperText(
                        "signup-password-confirm-helper",
                        errors.passwordConfirm,
                    )}
                </div>

                <div className="mt-2">
                    <label
                        htmlFor="signup-name"
                        className="mb-1 block text-xs font-semibold"
                    >
                        이름
                    </label>
                    <input
                        type="text"
                        id="signup-name"
                        className={getInputClassName(
                            Boolean(errors.name),
                            "w-full",
                        )}
                        placeholder="이름 입력"
                        value={formData.name}
                        onChange={handleChange("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                            errors.name ? "signup-name-helper" : undefined
                        }
                    />
                    {renderHelperText("signup-name-helper", errors.name)}
                </div>

                <div className="mt-2">
                    <label
                        htmlFor="signup-birth-date"
                        className="mb-1 block text-xs font-semibold"
                    >
                        생년월일
                    </label>
                    <input
                        type="text"
                        id="signup-birth-date"
                        inputMode="numeric"
                        maxLength={8}
                        className={getInputClassName(
                            Boolean(errors.birthDate),
                            "w-full",
                        )}
                        placeholder="생년월일 8자리 입력"
                        value={birthDateInput}
                        onChange={(event) =>
                            onBirthDateChange(event.target.value)
                        }
                        aria-invalid={Boolean(errors.birthDate)}
                        aria-describedby="signup-birth-date-helper"
                    />
                    {renderHelperText(
                        "signup-birth-date-helper",
                        errors.birthDate,
                        "예: 19990101",
                    )}
                </div>

                <div className="mt-2">
                    <label
                        htmlFor="signup-email-local"
                        className="mb-1 block text-xs font-semibold"
                    >
                        이메일
                    </label>
                    <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <input
                                type="text"
                                id="signup-email-local"
                                className={getInputClassName(
                                    Boolean(errors.emailLocal),
                                    "w-full",
                                )}
                                placeholder="이메일 입력"
                                value={formData.emailLocal}
                                onChange={handleChange("emailLocal")}
                                aria-invalid={Boolean(errors.emailLocal)}
                                aria-describedby={
                                    errors.emailLocal
                                        ? "signup-email-local-helper"
                                        : undefined
                                }
                            />
                            {renderHelperText(
                                "signup-email-local-helper",
                                errors.emailLocal,
                            )}
                        </div>
                        <span className="pt-2 text-xs text-gray-500">@</span>
                        <div className="min-w-0 flex-1">
                            <input
                                type="text"
                                aria-label="이메일 도메인"
                                className={getInputClassName(
                                    Boolean(errors.emailDomain),
                                    "w-full",
                                )}
                                value={formData.emailDomain}
                                onChange={handleChange("emailDomain")}
                                aria-invalid={Boolean(errors.emailDomain)}
                                aria-describedby={
                                    errors.emailDomain
                                        ? "signup-email-domain-helper"
                                        : undefined
                                }
                            />
                            {renderHelperText(
                                "signup-email-domain-helper",
                                errors.emailDomain,
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="mt-12 w-full bg-black px-4 py-3 font-semibold text-white hover:bg-gray-700"
                onClick={onNext}
            >
                다음
            </button>
        </>
    );
}
