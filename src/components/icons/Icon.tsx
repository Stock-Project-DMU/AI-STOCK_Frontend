export function EmptyPortfolioIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-10 w-10 text-gray-300"
            viewBox="0 0 32 32"
            fill="none"
        >
            <path d="M7 5h18v17l-6 6H7V5Z" fill="currentColor" />
            <path d="M19 22h6l-6 6v-6Z" fill="#BFC3C9" />
        </svg>
    );
}

export function UserIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M10 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M2.5 18.5a7.5 7.5 0 0 1 15 0H2.5Z" />
        </svg>
    );
}

export function HeartIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M10 17.5 8.9 16.6C4.8 13.1 2 10.7 2 7.6 2 5.1 3.9 3.2 6.4 3.2c1.4 0 2.8.7 3.6 1.8.8-1.1 2.2-1.8 3.6-1.8 2.5 0 4.4 1.9 4.4 4.4 0 3.1-2.8 5.5-6.9 9L10 17.5Z" />
        </svg>
    );
}

export function ClockIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
        >
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" />
            <path
                d="M10 5.5V10l3.2 2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

type IconProps = {
    className?: string;
};

/** AI 브랜드 지표(챗봇 아바타, AI 제안 헤더)에 쓰는 스파클 글리프. */
export function SparkleIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M12 3.5c.6 3.4 1.9 4.7 5.3 5.3-3.4.6-4.7 1.9-5.3 5.3-.6-3.4-1.9-4.7-5.3-5.3 3.4-.6 4.7-1.9 5.3-5.3Z"
                fill="currentColor"
            />
            <path
                d="M18.5 15.2c.34 1.9 1.08 2.64 2.98 2.98-1.9.34-2.64 1.08-2.98 2.98-.34-1.9-1.08-2.64-2.98-2.98 1.9-.34 2.64-1.08 2.98-2.98Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function SendIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path
                d="M4 12.5 20 4l-5 16-4.2-6.3L4 12.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M10.8 13.7 20 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

export function SearchIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m19.5 19.5-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

export function GearIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
            <path
                d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6M17.7 17.7l-1.6-1.6M7.9 7.9 6.3 6.3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function CheckIcon({ className = "h-3.5 w-3.5" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5 9.8 17 19 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CloseIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="M4.5 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function ChevronLeftIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function ChevronRightSmallIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function DashboardIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

export function SwapIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="M4 8h13.5M17.5 8 14 4.5M20 16H6.5M6.5 16 10 19.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function WalletIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="6" width="17" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="16.5" cy="14" r="1.3" fill="currentColor" />
        </svg>
    );
}

export function UsersGroupIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M15.3 5.3c1.4.3 2.5 1.5 2.5 3s-1.1 2.7-2.5 3M18 13.9c1.7.5 3 2.2 3 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function TrendUpIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="M4 16.5 10 10l4 4 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.5 7h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function PlusIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 4.5v15M4.5 12h15" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    );
}

export function NewsIcon({ className = "h-4 w-4" }: IconProps) {
    return (
        <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="4.5" width="17" height="15" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 8.5h6M7 12h10M7 15.3h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}
