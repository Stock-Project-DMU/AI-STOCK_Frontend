"use client";

import { useEffect, useId, type ReactNode } from "react";

type RecoveryModalProps = {
    title: string;
    children?: ReactNode;
    onClose: () => void;
    closeLabel?: string;
};

export default function RecoveryModal({
    title,
    children,
    onClose,
    closeLabel = "닫기",
}: RecoveryModalProps) {
    const titleId = useId();

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            >
                <div className="rounded-lg border border-gray-300 bg-gray-100 p-4 py-6">
                    <h2
                        id={titleId}
                        className="text-center text-xl font-bold"
                    >
                        {title}
                    </h2>
                    {children ? <div className="mt-4">{children}</div> : null}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg bg-black py-3 font-bold text-white hover:bg-gray-800"
                >
                    {closeLabel}
                </button>
            </div>
        </div>
    );
}
