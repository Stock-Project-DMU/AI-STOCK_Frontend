import { NewsIcon, TrendUpIcon } from "@/components/icons/Icon";
import { MARKET_NEWS } from "../constants/marketData";

export function NewsSummary({ onSemiconductor }: { onSemiconductor: () => void }) {
    return (
        <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-canvas">
            <div className="flex items-center justify-between bg-surface-soft px-4 py-3 text-xs font-bold text-ink">
                <span className="flex items-center gap-1.5"><NewsIcon className="h-3.5 w-3.5" /> 핵심 뉴스 샘플 5선</span>
                <span className="font-normal text-muted-soft">2026.05.06 데모</span>
            </div>
            {MARKET_NEWS.map(item => (
                <button key={item.rank} onClick={item.rank === 2 ? onSemiconductor : undefined} className="flex w-full items-center gap-3 border-t border-hairline-soft px-4 py-3 text-left hover:bg-surface-soft">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${item.rank <= 3 ? "bg-primary text-white" : "bg-surface-strong text-muted"}`}>{item.rank}</span>
                    <span className="min-w-0">
                        <strong className="block truncate text-xs text-ink">{item.title}</strong>
                        <small className="mt-1 block text-[10px] text-muted-soft">{item.source} · {item.age}</small>
                    </span>
                </button>
            ))}
        </div>
    );
}

export function SemiconductorBriefing() {
    return (
        <div className="mt-4 rounded-lg border border-hairline bg-surface-soft p-5">
            <h3 className="flex items-center gap-1.5 border-t-2 border-primary pt-4 text-sm font-bold text-primary"><TrendUpIcon className="h-3.5 w-3.5" /> 반도체 섹터 분석</h3>
            <p className="mt-4 text-xs leading-6 text-body">
                삼성전자가 AI 반도체 사업에 <b className="text-primary">10조원 규모 투자</b>를 발표하면서 반도체 밸류체인 전반이 강세를 보이고 있습니다. SK하이닉스는 HBM3E 양산을 본격화하며 <b className="text-up">전일 대비 +5.8%</b> 상승했고, 필라델피아 반도체 지수도 <b className="text-up">+4.63%</b> 급등했습니다.
            </p>
            <p className="mt-4 text-xs leading-6 text-body">
                마이크론·웨스턴디지털 등 메모리 업종도 동반 강세이며, 반도체 장비까지 초호황 국면에 진입했습니다. AI 추론용 eSSD 수요 증가로 가격 상승이 지속될 전망입니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                {["#삼성전자", "#SK하이닉스", "#HBM3E", "#마이크론", "#반도체지수"].map(tag => (
                    <span key={tag} className="rounded-pill bg-canvas px-3 py-1 text-[10px] text-muted">{tag}</span>
                ))}
            </div>
        </div>
    );
}
