import { NewsIcon } from "@/components/icons/Icon";

type BriefingHistoryProps = {
    onSelectToday: () => void;
};

const PAST_BRIEFINGS = ["2026.05.05 시황 브리핑", "2026.05.04 시황 브리핑", "2026.05.01 시황 브리핑"];

export default function BriefingHistory({ onSelectToday }: BriefingHistoryProps) {
    return (
        <aside className="hidden w-[240px] shrink-0 border-r border-hairline bg-canvas lg:flex lg:flex-col">
            <button
                type="button"
                onClick={onSelectToday}
                className="m-3 flex items-center gap-2.5 rounded-pill bg-primary px-5 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-primary-active"
            >
                <NewsIcon className="h-4 w-4" />
                오늘의 브리핑
            </button>

            <p className="px-6 pb-2 text-xs font-medium text-muted">지난 브리핑</p>
            {PAST_BRIEFINGS.map((label, index) => (
                <button
                    key={label}
                    className={`px-6 py-3 text-left text-sm ${
                        index === 0
                            ? "border-l-2 border-primary bg-primary/6 font-semibold text-primary"
                            : "text-body hover:bg-surface-soft"
                    }`}
                >
                    {label}
                </button>
            ))}
        </aside>
    );
}
