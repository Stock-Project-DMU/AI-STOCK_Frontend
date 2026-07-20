import Link from "next/link";
import type { ReactNode } from "react";

type RecoveryCardProps = {
    title: string;
    children: ReactNode;
    backHref?: string;
    backLabel?: string;
};

export default function RecoveryCard({
    title,
    children,
    backHref = "/login",
    backLabel = "로그인으로 이동",
}: RecoveryCardProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
            <div className="w-full max-w-[420px] rounded-lg border border-gray-300 bg-white p-8 shadow-md">
                <div className="relative flex w-full items-center justify-center">
                    <Link
                        href={backHref}
                        aria-label={backLabel}
                        className="absolute left-0 text-3xl leading-none hover:text-gray-300"
                    >
                        ←
                    </Link>

                    <h1 className="text-center text-3xl font-semibold">
                        {title}
                    </h1>
                </div>

                {children}
            </div>
        </div>
    );
}
