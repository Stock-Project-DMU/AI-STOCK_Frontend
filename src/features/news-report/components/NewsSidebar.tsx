import { MARKET_SNAPSHOT, TRENDING_KEYWORDS } from "../data";

export default function NewsSidebar() {
    return (
        <aside className="space-y-3 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-xl border border-hairline bg-white p-4">
                <div className="flex items-center justify-between"><h2 className="text-sm font-black text-ink">시장 스냅샷</h2><span className="text-[12px] text-muted">샘플</span></div>
                <div className="mt-3 divide-y divide-hairline-soft">
                    {MARKET_SNAPSHOT.map(([name, value, change, tone]) => (
                        <div key={name} className="grid grid-cols-[80px_1fr_auto] items-center py-3 text-[12px]">
                            <strong className="text-ink">{name}</strong>
                            <span className="num text-right text-body">{value}</span>
                            <span className={`num ml-3 font-bold ${tone}`}>{change}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-xl border border-hairline bg-white p-4">
                <h2 className="text-sm font-black text-ink">주요 키워드</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {TRENDING_KEYWORDS.map((keyword, index) => <span key={keyword} className={`rounded-full border px-3 py-1.5 text-[12px] font-bold ${index < 2 ? "border-primary/20 bg-primary/5 text-primary" : "border-hairline bg-surface-soft text-body"}`}>#{keyword}</span>)}
                </div>
            </section>

            <section className="rounded-xl border border-hairline bg-white p-4">
                <h2 className="text-sm font-black text-ink">많이 본 리포트</h2>
                <ol className="mt-3 divide-y divide-hairline-soft">
                    {["시장 변동성 대응 체크리스트", "이번 주 주요 경제 일정", "업종별 수급 변화 읽는 법"].map((title, index) => (
                        <li key={title} className="grid grid-cols-[24px_1fr] gap-2 py-3 text-xs">
                            <strong className={index === 0 ? "text-primary" : "text-muted"}>0{index + 1}</strong>
                            <span className="font-bold leading-5 text-ink">{title}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </aside>
    );
}
