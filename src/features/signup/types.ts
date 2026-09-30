export type SignupStep = "terms" | "account" | "survey";

export type SignupFormData = {
    userId: string;
    password: string;
    passwordConfirm: string;
    name: string;
    birthDate: Date | null;
    emailLocal: string;
    emailDomain: string;
};

export type SignupFormErrors = Partial<Record<keyof SignupFormData, string>> & {
    email?: string;
    emailVerification?: string;
    submit?: string;
};
