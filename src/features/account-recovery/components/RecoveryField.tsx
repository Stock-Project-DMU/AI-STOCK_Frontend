import type {
    ChangeEventHandler,
    HTMLInputTypeAttribute,
    InputHTMLAttributes,
} from "react";

type RecoveryFieldProps = {
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    errorMessage?: string;
    helperText?: string;
    type?: HTMLInputTypeAttribute;
    placeholder?: string;
    autoComplete?: string;
    inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
    required?: boolean;
};

export default function RecoveryField({
    id,
    name,
    label,
    value,
    onChange,
    errorMessage,
    helperText,
    type = "text",
    placeholder,
    autoComplete,
    inputMode,
    maxLength,
    required = true,
}: RecoveryFieldProps) {
    const helperId = `${id}-helper`;
    const hasError = Boolean(errorMessage);
    const visibleHelperText = errorMessage ?? helperText;

    return (
        <div className="mt-2 first:mt-0">
            <label htmlFor={id} className="mb-1 block text-xs font-semibold">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                maxLength={maxLength}
                required={required}
                aria-invalid={hasError}
                aria-describedby={visibleHelperText ? helperId : undefined}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ${
                    hasError
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-black"
                }`}
            />
            {visibleHelperText ? (
                <p
                    id={helperId}
                    className={`mt-1 px-1 text-xs ${
                        hasError ? "text-red-500" : "text-gray-500"
                    }`}
                >
                    {visibleHelperText}
                </p>
            ) : null}
        </div>
    );
}
