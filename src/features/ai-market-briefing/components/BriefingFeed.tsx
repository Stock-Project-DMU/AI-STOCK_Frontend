import { SparkleIcon } from "@/components/icons/Icon";
import { NewsSummary, SemiconductorBriefing } from "./BriefingContent";

type BriefingFeedProps = {
    showDetail: boolean;
    onShowDetail: () => void;
    onSave: () => void;
};

const TODAY_LABEL = "2026.05.06 (수) 오전 브리핑";

export default function BriefingFeed({ showDetail, onShowDetail, onSave }: BriefingFeedProps) {
    return (
        <section className="flex min-w-0 flex-1 flex-col bg-surface-soft">
            <div className="flex h-14 items-center gap-3 border-b border-hairline bg-canvas px-6 font-bold text-ink">
                <span className="theme-accent-bg flex h-8 w-8 items-center justify-center rounded-md">
                    <SparkleIcon className="h-4 w-4" />
                </span>
                AI 시황 브리핑 비서
                <span className="ml-auto text-xs font-normal text-muted-soft">{TODAY_LABEL}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="mx-auto max-w-[680px]">
                    <p className="text-xs font-black tracking-[0.12em] text-primary">오늘의 시황</p>
                    <h1 className="mt-1.5 text-xl font-bold leading-snug text-ink">
                        좋은 아침입니다. 오늘 시장은 이렇게 움직이고 있어요.
                    </h1>

                    <div className="mt-5 rounded-lg border border-hairline bg-canvas px-5 py-5 text-sm leading-6 text-body">
                        <p>
                            오늘 주요 시황 뉴스를 5개로 정리해 드렸어요. 지수는 전반적으로 강세를 보이고 있고,
                            그중에서도 반도체 섹터의 움직임이 특히 눈에 띕니다.
                        </p>

                        <NewsSummary onSemiconductor={onShowDetail} />
                        {showDetail && <SemiconductorBriefing />}

                        <button onClick={onSave} className="theme-accent-bg mt-5 rounded-pill px-6 py-2.5 text-xs font-bold">
                            이 브리핑 저장
                        </button>
                    </div>

                    <p className="mt-4 text-center text-[12px] text-muted-soft">
                        매일 오전, AI가 그날의 시황을 자동으로 정리해 드립니다.
                    </p>
                </div>
            </div>
        </section>
    );
}
