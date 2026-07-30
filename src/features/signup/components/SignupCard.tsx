import type { ReactNode } from "react";

type SignupCardProps = {
    title: string;
    onBack: () => void;
    children: ReactNode;
};

export default function SignupCard({ title, onBack, children }: SignupCardProps) {
    return (
        <div className="market-theme auth-shell flex min-h-screen items-center justify-center px-4 py-12">
            <div className="auth-card w-full max-w-[480px] rounded-3xl p-8 sm:p-10">
                <div className="relative flex w-full items-center justify-center">
                    <button
                        type="button"
                        aria-label="이전 단계로 이동"
                        className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl border border-hairline text-xl leading-none text-muted hover:bg-surface-soft hover:text-ink"
                        onClick={onBack}
                    >
                        ←
                    </button>

                    <h1 className="text-center text-2xl font-black text-ink">
                        {title}
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
