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
            className={`flex w-full flex-col items-center gap-1.5 px-1 text-center text-[11px] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-300 ${
                active ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
        >
            {children}
            <span className="whitespace-nowrap leading-none">{label}</span>
        </button>
    );
}
