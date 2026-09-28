const EMAIL_DOMAIN_OPTIONS = ["naver.com", "gmail.com", "daum.net", "hanmail.net", "kakao.com"] as const;

type RecoveryEmailFieldProps = {
    idPrefix: string;
    emailLocal: string;
    emailDomain: string;
    localError?: string;
    domainError?: string;
    onLocalChange: (value: string) => void;
    onDomainChange: (value: string) => void;
};

export default function RecoveryEmailField({
    idPrefix, emailLocal, emailDomain, localError, domainError, onLocalChange, onDomainChange,
}: RecoveryEmailFieldProps) {
    const emailError = localError ?? domainError;
    const inputClassName = `w-full rounded-md border bg-canvas px-3 py-2 text-sm outline-none ${emailError ? "border-red-400 focus:border-red-500" : "border-hairline focus:border-primary"}`;

    return (
        <div className="mt-2">
            <label htmlFor={`${idPrefix}-email-local`} className="mb-1 block text-xs font-semibold text-ink">이메일</label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
                <input
                    id={`${idPrefix}-email-local`}
                    type="text"
                    autoComplete="off"
                    value={emailLocal}
                    onChange={(event) => onLocalChange(event.target.value)}
                    placeholder="이메일 입력"
                    aria-invalid={Boolean(localError)}
                    aria-describedby={emailError ? `${idPrefix}-email-error` : undefined}
                    className={inputClassName}
                />
                <span className="pt-2 text-sm text-muted">@</span>
                <input
                    aria-label="이메일 도메인"
                    type="text"
                    value={emailDomain}
                    onChange={(event) => onDomainChange(event.target.value)}
                    placeholder="도메인 입력"
                    aria-invalid={Boolean(domainError)}
                    aria-describedby={emailError ? `${idPrefix}-email-error` : undefined}
                    className={inputClassName}
                />
            </div>
            <select
                aria-label="이메일 도메인 선택"
                value={EMAIL_DOMAIN_OPTIONS.includes(emailDomain as (typeof EMAIL_DOMAIN_OPTIONS)[number]) ? emailDomain : ""}
                onChange={(event) => onDomainChange(event.target.value)}
                className={`mt-2 w-full rounded-md border bg-canvas px-3 py-2 text-sm outline-none ${emailError ? "border-red-400 focus:border-red-500" : "border-hairline focus:border-primary"}`}
            >
                <option value="">직접 입력</option>
                {EMAIL_DOMAIN_OPTIONS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
            </select>
            {emailError && <p id={`${idPrefix}-email-error`} role="alert" className="mt-1 px-1 text-xs text-red-500">{emailError}</p>}
        </div>
    );
}
