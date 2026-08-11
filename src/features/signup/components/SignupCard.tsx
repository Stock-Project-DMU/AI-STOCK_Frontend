import type { ReactNode } from "react";

type SignupCardProps = {
    title: string;
    onBack: () => void;
    children: ReactNode;
    wide?: boolean;
};

export default function SignupCard({ title, onBack, children, wide = false }: SignupCardProps) {
    return (
        <div className="market-theme auth-shell flex min-h-screen items-center justify-center px-4 py-12">
            <div className={`auth-card w-full rounded-3xl p-8 transition-[max-width] sm:p-10 ${wide ? "max-w-[860px]" : "max-w-[480px]"}`}>
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
