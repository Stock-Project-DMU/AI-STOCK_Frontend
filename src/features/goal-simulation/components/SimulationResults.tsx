import type { SimulationSettings } from "../types";
import { calculateFutureValue, formatWon } from "../utils/simulation";

type SimulationResultsProps = {
    settings: SimulationSettings;
};

export default function SimulationResults({ settings }: SimulationResultsProps) {
    const principal = settings.monthlyPayment * settings.years * 12;
    const baseValue = calculateFutureValue(
        settings.monthlyPayment,
        settings.years,
        settings.annualReturn,
    );
    const aggressiveValue = calculateFutureValue(
        settings.monthlyPayment,
        settings.years,
        settings.annualReturn + 2.5,
    );
    const additionalReturn = aggressiveValue - baseValue;

    if (settings.aggressive) {
        return (
            <div className="mt-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50 px-5 py-4">
                    <span>
                        <strong className="block text-sm text-amber-700">▤　공격적 시나리오 추가 수익</strong>
                        <small className="text-gray-500">기본 대비 수익률 2.5%p 상승 시, {settings.years}년 후 추가로 확보 가능한 금액</small>
                    </span>
                    <strong className="text-2xl text-red-500">+{formatWon(additionalReturn)}</strong>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ResultCard title={`기본 시나리오 · 연 ${settings.annualReturn.toFixed(1)}%`} years={settings.years} value={baseValue} principal={principal} rate={settings.annualReturn} />
                    <ResultCard title={`공격적 시나리오 · 연 ${(settings.annualReturn + 2.5).toFixed(1)}%`} years={settings.years} value={aggressiveValue} principal={principal} rate={settings.annualReturn + 2.5} accent />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <TextCard title="AI 인사이트">공격적 시나리오를 채택할 경우 기본 대비 약 <em>{formatWon(additionalReturn)}</em>의 추가 수익이 발생합니다. 높은 수익률을 위해서는 <em>주식 비중 70%</em> 이상의 공격적 포트폴리오가 필요합니다.</TextCard>
                    <TextCard title="전략 팁">두 시나리오의 중간 지점인 <em>6.25%</em>를 목표로 주식 60% + 채권 30% + 대체 10% 배분 전략을 추천합니다.</TextCard>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <ResultCard title={`${settings.years}년 후 예상 자산`} years={settings.years} value={baseValue} principal={principal} rate={settings.annualReturn} />
            <TextCard title="AI 인사이트">현재 설정된 연 {settings.annualReturn.toFixed(1)}%의 수익률은 <em>안정적인 복리 성장</em>을 보이고 있습니다. 목표 달성을 위해 꾸준한 납입과 장기 투자가 중요합니다.</TextCard>
            <TextCard title="전략 팁">납입 금액을 <em>20%</em> 조정하거나 수익률을 높이면 목표 도달 시점을 앞당길 수 있습니다. 시장 상황에 맞춰 정기적으로 재점검하세요.</TextCard>
        </div>
    );
}

type ResultCardProps = {
    title: string;
    years: number;
    value: number;
    principal: number;
    rate: number;
    accent?: boolean;
};

function ResultCard({ title, years, value, principal, rate, accent }: ResultCardProps) {
    return (
        <article className={`rounded-2xl border bg-white p-5 ${accent ? "border-t-2 border-red-500" : "border-gray-800"}`}>
            <p className={`text-xs ${accent ? "text-red-500" : "text-gray-500"}`}>{title}</p>
            <p className={`mt-2 text-2xl font-black ${accent ? "text-red-500" : "text-black"}`}>{Math.round(value).toLocaleString("ko-KR")}</p>
            <div className="mt-4 border-t pt-3 text-xs text-gray-500">
                <div className="flex justify-between"><span>원금 합계</span><strong className="text-gray-700">{Math.round(principal).toLocaleString("ko-KR")}</strong></div>
                <div className="mt-1 flex justify-between"><span>예상 수익</span><strong className="text-emerald-500">+{Math.round(value - principal).toLocaleString("ko-KR")}</strong></div>
                <div className="mt-1 flex justify-between"><span>{years}년 평균 수익률</span><strong className={accent ? "text-red-500" : "text-gray-700"}>{rate.toFixed(1)}%</strong></div>
            </div>
        </article>
    );
}

function TextCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <article className="rounded-2xl border border-gray-800 bg-white p-5">
            <p className="text-xs text-gray-400">{title}</p>
            <p className="mt-3 text-sm leading-7 text-gray-700 [&_em]:font-bold [&_em]:not-italic [&_em]:text-[var(--market-accent-text)]">{children}</p>
        </article>
    );
}
