export type SignupStep = "terms" | "account" | "experience";

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
    emailVerification?: string;
    submit?: string;
};

export type InvestmentExperienceLevel = "beginner" | "intermediate" | "advanced";
