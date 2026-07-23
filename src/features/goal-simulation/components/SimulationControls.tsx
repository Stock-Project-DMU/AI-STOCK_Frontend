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
        <section className="rounded-2xl border border-gray-800 bg-white p-5">
            <h2 className="font-bold">시뮬레이션 설정</h2>

            <div className="mt-5">
                <p className="text-xs text-gray-500">목표 선택</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {(Object.keys(GOAL_PRESETS) as GoalType[]).map((goal) => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => updateGoal(goal)}
                            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition-colors ${
                                settings.goal === goal
                                    ? "theme-accent-border theme-accent-soft theme-accent-text shadow-[0_0_0_1px_var(--market-accent-soft)]"
                                    : "border-gray-200 text-gray-500 hover:border-[var(--market-accent)] hover:text-[var(--market-accent-text)]"
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

            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span>
                    <strong className="block text-xs">공격적 투자 시나리오</strong>
                    <small className="text-[10px] text-gray-400">
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
                <span className="relative h-6 w-11 rounded-full bg-gray-300 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-red-500 peer-checked:after:translate-x-5" />
            </label>

            <button
                type="button"
                disabled={!settings.goal}
                onClick={onRun}
                className="mt-5 w-full rounded-lg bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                시뮬레이션 실행
            </button>
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
            <span className="flex items-center justify-between text-xs font-semibold">
                {label}
                <strong className="text-sm text-red-500">{displayValue}</strong>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={displayValue === "-"}
                onChange={(event) => onChange(Number(event.target.value))}
                className="simulation-range mt-3 w-full cursor-pointer disabled:cursor-not-allowed"
                style={{
                    background: `linear-gradient(to right, var(--control-accent) 0%, var(--control-accent) ${progress}%, var(--control-track) ${progress}%, var(--control-track) 100%)`,
                }}
            />
        </label>
    );
}
