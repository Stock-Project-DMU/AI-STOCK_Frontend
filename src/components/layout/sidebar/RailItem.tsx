import { type MouseEventHandler, type ReactNode } from "react";

type RailItemProps = {
    active?: boolean;
    children: ReactNode;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function RailItem({
    active = false,
    children,
    label,
    onClick,
}: RailItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full flex-col items-center gap-2 px-1 text-center text-[12px] font-bold focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)] ${
                active ? "theme-accent-text" : "text-muted hover:text-ink"
            }`}
        >
            {children}
            <span className="whitespace-nowrap leading-none">{label}</span>
        </button>
    );
}
