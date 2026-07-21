type PlannerHistoryProps = {
    onNewDiagnosis: () => void;
};

export default function PlannerHistory({ onNewDiagnosis }: PlannerHistoryProps) {
    return (
        <aside className="hidden w-[250px] shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
            <button
                type="button"
                onClick={onNewDiagnosis}
                className="m-4 rounded-lg bg-black px-5 py-3 text-left text-sm font-bold text-white transition hover:bg-gray-800"
            >
                <span className="mr-3 text-lg font-normal">＋</span>새로운 진단 시작
            </button>

            <p className="px-6 pb-3 text-xs text-gray-400">최근 대화</p>
            <button className="border-l-2 border-red-500 bg-red-50 px-6 py-3 text-left text-sm font-semibold text-red-500">
                포트폴리오 리밸런싱 제안
            </button>
            <button className="px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">
                연금 저축 절세 전략
            </button>
            <button className="px-6 py-3 text-left text-sm text-gray-700 hover:bg-gray-50">
                미국 테크주 전망 분석
            </button>
        </aside>
    );
}
