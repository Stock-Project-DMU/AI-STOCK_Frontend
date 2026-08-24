const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const NAME_PATTERN = /^[가-힣A-Za-z ]+$/;
const EMAIL_LOCAL_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const EMAIL_DOMAIN_PATTERN = /^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

export function parseBirthDate(value: string) {
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

export function validatePassword(password: string) {
    if (!password) {
        return "비밀번호를 입력해 주세요.";
    }

    if (!PASSWORD_PATTERN.test(password)) {
        return "비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다.";
    }

    if (new TextEncoder().encode(password).length > 72) {
        return "비밀번호는 72바이트를 초과할 수 없습니다.";
    }
}

export function validateName(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
        return "이름을 입력해 주세요.";
    }

    if (trimmedName.length < 2 || trimmedName.length > 20) {
        return "이름은 2자 이상 20자 이하로 입력해 주세요.";
    }

    if (!NAME_PATTERN.test(trimmedName)) {
        return "이름은 한글 또는 영문으로 입력해 주세요.";
    }
}

export function validateBirthDate(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return "생년월일을 입력해 주세요.";
    }

    if (!/^\d{8}$/.test(trimmedValue)) {
        return "생년월일은 숫자 8자리로 입력해 주세요.";
    }

    const date = parseBirthDate(trimmedValue);

    if (!date) {
        return "올바른 생년월일을 입력해 주세요.";
    }

    if (date.getFullYear() < 1900) {
        return "생년월일은 1900년 이후 날짜로 입력해 주세요.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
        return "생년월일은 오늘 이후 날짜로 입력할 수 없습니다.";
    }
}

export function validateEmailLocal(emailLocal: string) {
    const local = emailLocal.trim();

    if (!local) {
        return "이메일 아이디를 입력해 주세요.";
    }

    if (
        !EMAIL_LOCAL_PATTERN.test(local) ||
        local.startsWith(".") ||
        local.endsWith(".") ||
        local.includes("..")
    ) {
        return "올바른 이메일 아이디 형식으로 입력해 주세요.";
    }
}

export function validateEmailDomain(emailDomain: string) {
    const domain = emailDomain.trim();

    if (!domain) {
        return "이메일 도메인을 입력해 주세요.";
    }

    if (!EMAIL_DOMAIN_PATTERN.test(domain)) {
        return "올바른 이메일 도메인 형식으로 입력해 주세요.";
    }
}

export function validateEmail(emailLocal: string, emailDomain: string) {
    return validateEmailLocal(emailLocal) ?? validateEmailDomain(emailDomain);
}

export function validateEmailWhileTyping(
    emailLocal: string,
    emailDomain: string,
    changedField: "emailLocal" | "emailDomain",
) {
    if (changedField === "emailLocal") {
        return validateEmailLocal(emailLocal) ??
            (emailDomain ? validateEmailDomain(emailDomain) : undefined);
    }

    return validateEmailDomain(emailDomain) ??
        (emailLocal ? validateEmailLocal(emailLocal) : undefined);
}
