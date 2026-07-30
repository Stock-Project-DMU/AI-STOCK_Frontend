import { PlusIcon } from "@/components/icons/Icon";

type PlannerHistoryProps = {
    onNewDiagnosis: () => void;
};

export default function PlannerHistory({ onNewDiagnosis }: PlannerHistoryProps) {
    return (
        <aside className="hidden w-[240px] shrink-0 border-r border-hairline bg-canvas lg:flex lg:flex-col">
            <button
                type="button"
                onClick={onNewDiagnosis}
                className="m-3 flex items-center rounded-pill bg-primary px-5 py-3 text-left text-sm font-bold text-white transition-colors hover:bg-primary-active"
            >
                <PlusIcon className="mr-2.5 h-4 w-4" />새로운 진단 시작
            </button>

            <p className="px-6 pb-2 text-xs font-medium text-muted">최근 대화</p>
            <button className="border-l-2 border-primary bg-primary/6 px-6 py-3 text-left text-sm font-semibold text-primary">
                포트폴리오 리밸런싱 제안
            </button>
            <button className="px-6 py-3 text-left text-sm text-body hover:bg-surface-soft">
                연금 저축 절세 전략
            </button>
            <button className="px-6 py-3 text-left text-sm text-body hover:bg-surface-soft">
                미국 테크주 전망 분석
            </button>
        </aside>
    );
}
