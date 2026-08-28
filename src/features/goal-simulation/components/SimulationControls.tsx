import { Button } from "@/components/common/Button";
import { GOAL_PRESETS } from "../constants/simulationData";
import type { GoalType, SimulationSettings } from "../types";

type SimulationControlsProps = {
    settings: SimulationSettings;
    onChange: (settings: SimulationSettings) => void;
    onRun: () => void;
};

const ranges = {
    monthlyPayment: { min: 100_000, max: 5_000_000, step: 100_000 },
    years: { min: 1, max: 50, step: 1 },
    annualReturn: { min: 1, max: 12, step: 0.5 },
} as const;

export default function SimulationControls({
    settings,
    onChange,
    onRun,
}: SimulationControlsProps) {
    const updateGoal = (goal: GoalType) => {
        const preset = GOAL_PRESETS[goal];
        onChange({
            ...settings,
            goal,
            monthlyPayment: preset.monthlyPayment,
            years: preset.years,
            annualReturn: preset.annualReturn,
        });
    };

    return (
        <section className="rounded-lg border border-hairline bg-canvas p-5">
            <h2 className="text-sm font-bold text-ink">시뮬레이션 설정</h2>

            <div className="mt-4">
                <p className="text-xs text-muted">목표 선택</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {(Object.keys(GOAL_PRESETS) as GoalType[]).map((goal) => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => updateGoal(goal)}
                            className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
                                settings.goal === goal
                                    ? "theme-accent-border theme-accent-soft theme-accent-text shadow-[0_0_0_1px_var(--market-accent-soft)]"
                                    : "border-hairline text-muted hover:border-[var(--market-accent)] hover:text-[var(--market-accent-text)]"
                            }`}
                        >
                            {GOAL_PRESETS[goal].label}
                        </button>
                    ))}
                </div>
            </div>

            <RangeField
                label="월 납입 금액"
                value={settings.monthlyPayment}
                displayValue={
                    settings.goal
                        ? settings.monthlyPayment.toLocaleString("ko-KR")
                        : "-"
                }
                {...ranges.monthlyPayment}
                onChange={(monthlyPayment) =>
                    onChange({ ...settings, monthlyPayment })
                }
            />
            <RangeField
                label="목표 기간"
                value={settings.years}
                displayValue={settings.goal ? `${settings.years}년` : "-"}
                {...ranges.years}
                onChange={(years) => onChange({ ...settings, years })}
            />
            <RangeField
                label="기대 수익률 (연)"
                value={settings.annualReturn}
                displayValue={
                    settings.goal ? `${settings.annualReturn.toFixed(1)}%` : "-"
                }
                {...ranges.annualReturn}
                onChange={(annualReturn) =>
                    onChange({ ...settings, annualReturn })
                }
            />

            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-md bg-surface-soft px-4 py-3">
                <span>
                    <strong className="block text-xs text-ink">공격적 투자 시나리오</strong>
                    <small className="text-[12px] text-muted-soft">
                        수익률 +2.5% 추가 반영 시 비교
                    </small>
                </span>
                <input
                    type="checkbox"
                    checked={settings.aggressive}
                    onChange={(event) =>
                        onChange({ ...settings, aggressive: event.target.checked })
                    }
                    className="peer sr-only"
                />
                <span className="relative h-6 w-11 rounded-full bg-hairline transition-colors after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5" />
            </label>

            <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!settings.goal}
                onClick={onRun}
                className="mt-5"
            >
                시뮬레이션 실행
            </Button>
        </section>
    );
}

type RangeFieldProps = {
    label: string;
    value: number;
    displayValue: string;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
};

function RangeField({
    label,
    value,
    displayValue,
    min,
    max,
    step,
    onChange,
}: RangeFieldProps) {
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <label className="mt-5 block">
            <span className="flex items-center justify-between text-xs font-semibold text-ink">
                {label}
                <strong className="text-sm text-primary">{displayValue}</strong>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={displayValue === "-"}
                onInput={(event) => onChange(Number(event.currentTarget.value))}
                className="simulation-range mt-3 w-full cursor-pointer disabled:cursor-not-allowed"
                style={{
                    background: `linear-gradient(to right, var(--control-accent) 0%, var(--control-accent) ${progress}%, var(--control-track) ${progress}%, var(--control-track) 100%)`,
                }}
            />
        </label>
    );
}
