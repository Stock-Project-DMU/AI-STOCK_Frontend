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
            className={`group flex w-full flex-col items-center gap-1.5 px-1 text-center text-[12px] font-bold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--market-accent)] motion-reduce:transition-none ${
                active ? "theme-accent-text" : "text-muted hover:text-ink"
            }`}
        >
            <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-[transform,background-color,box-shadow] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
                    active
                        ? "theme-accent-soft shadow-[0_5px_14px_rgba(0,82,255,0.12)]"
                        : "group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:bg-surface-soft"
                }`}
            >
                {children}
            </span>
            <span className="whitespace-nowrap leading-none transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none">{label}</span>
        </button>
    );
}
