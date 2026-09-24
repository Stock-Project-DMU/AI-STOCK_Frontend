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
            <div className="mt-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/15 bg-primary/5 px-5 py-4">
                    <span>
                        <strong className="block text-sm text-primary">▤　공격적 시나리오 추가 수익</strong>
                        <small className="text-muted">기본 대비 수익률 2.5%p 상승 시, {settings.years}년 후 추가로 확보 가능한 금액</small>
                    </span>
                    <strong className="num text-2xl font-bold text-up">+{formatWon(additionalReturn)}</strong>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <ResultCard title={`기본 시나리오 · 연 ${settings.annualReturn.toFixed(1)}%`} years={settings.years} value={baseValue} principal={principal} rate={settings.annualReturn} />
                    <ResultCard title={`공격적 시나리오 · 연 ${(settings.annualReturn + 2.5).toFixed(1)}%`} years={settings.years} value={aggressiveValue} principal={principal} rate={settings.annualReturn + 2.5} accent />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <TextCard title="계산 해설">가정 수익률을 2.5%p 높였을 때 계산상 차이는 <em>{formatWon(additionalReturn)}</em>입니다. 실제 수익을 보장하는 값이 아닙니다.</TextCard>
                    <TextCard title="계산 가정">매월 말 동일 금액을 납입하고 일정한 월 복리 수익률을 적용합니다. 세금·수수료·물가 상승은 반영하지 않습니다.</TextCard>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <ResultCard title={`${settings.years}년 후 예상 자산`} years={settings.years} value={baseValue} principal={principal} rate={settings.annualReturn} />
            <TextCard title="계산 해설">연 {settings.annualReturn.toFixed(1)}%를 고정 가정하여 월 복리로 계산한 예상값입니다. 실제 투자에서는 손실이 발생할 수 있습니다.</TextCard>
            <TextCard title="계산 가정">매월 말 납입 기준이며 세금·수수료·물가 상승은 제외합니다. 설정을 변경하여 가정별 결과를 비교할 수 있습니다.</TextCard>
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
        <article className={`rounded-lg border bg-canvas p-5 ${accent ? "border-t-2 border-primary" : "border-hairline"}`}>
            <p className={`text-xs ${accent ? "text-primary" : "text-muted"}`}>{title}</p>
            <p className={`mt-2 text-2xl font-bold ${accent ? "text-primary" : "text-ink"}`}>{Math.round(value).toLocaleString("ko-KR")}</p>
            <div className="mt-4 border-t border-hairline-soft pt-3 text-xs text-muted">
                <div className="flex justify-between"><span>원금 합계</span><strong className="text-body">{Math.round(principal).toLocaleString("ko-KR")}</strong></div>
                <div className="mt-1 flex justify-between"><span>예상 수익</span><strong className="text-up">+{Math.round(value - principal).toLocaleString("ko-KR")}</strong></div>
                <div className="mt-1 flex justify-between"><span>{years}년 평균 수익률</span><strong className={accent ? "text-primary" : "text-body"}>{rate.toFixed(1)}%</strong></div>
            </div>
        </article>
    );
}

function TextCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <article className="rounded-lg border border-hairline bg-canvas p-5">
            <p className="text-xs text-muted">{title}</p>
            <p className="mt-3 text-sm leading-7 text-body [&_em]:font-bold [&_em]:not-italic [&_em]:text-[var(--market-accent-text)]">{children}</p>
        </article>
    );
}
