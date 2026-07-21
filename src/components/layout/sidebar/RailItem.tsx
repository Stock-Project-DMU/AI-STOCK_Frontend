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
            className={`flex w-full flex-col items-center gap-1.5 px-1 text-center text-[10px] font-bold focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)] ${
                active ? "theme-accent-text" : "text-slate-600 hover:text-slate-200"
            }`}
        >
            {children}
            <span className="whitespace-nowrap leading-none">{label}</span>
        </button>
    );
}
