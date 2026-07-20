import { buildGrowthPoints, formatWon } from "../utils/simulation";

type GrowthChartProps = {
    monthlyPayment: number;
    years: number;
    annualReturn: number;
    aggressive: boolean;
    hasResult: boolean;
};

const chartWidth = 720;
const chartHeight = 340;
const padding = 38;

function toPath(values: number[], maxValue: number) {
    return values
        .map((value, index) => {
            const x = padding + (index / (values.length - 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);
            return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(" ");
}

export default function GrowthChart({
    monthlyPayment,
    years,
    annualReturn,
    aggressive,
    hasResult,
}: GrowthChartProps) {
    if (!hasResult) {
        return (
            <section className="flex min-h-[390px] items-center justify-center rounded-2xl border border-gray-800 bg-white p-5 text-center">
                <div className="text-gray-400">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-gray-300 text-2xl">▤</div>
                    <p className="text-sm font-semibold">시뮬레이션 결과가 없습니다</p>
                    <p className="mt-2 text-xs leading-5">
                        왼쪽에서 목표와 조건을 설정한 후
                        <br />
                        &apos;시뮬레이션 실행&apos; 버튼을 눌러주세요.
                    </p>
                </div>
            </section>
        );
    }

    const baseValues = buildGrowthPoints(monthlyPayment, years, annualReturn);
    const aggressiveValues = buildGrowthPoints(
        monthlyPayment,
        years,
        annualReturn + 2.5,
    );
    const maxValue = Math.max(
        ...baseValues,
        ...(aggressive ? aggressiveValues : []),
    );
    const basePath = toPath(baseValues, maxValue);
    const aggressivePath = toPath(aggressiveValues, maxValue);

    return (
        <section className="min-h-[390px] rounded-2xl border border-gray-800 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold">
                    자산 성장 추이 {aggressive ? "비교" : "시뮬레이션"}
                </h2>
                <div className="flex gap-4 text-[11px] text-gray-500">
                    <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-black" />기본 ({annualReturn.toFixed(1)}%)</span>
                    {aggressive && <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />공격적 ({(annualReturn + 2.5).toFixed(1)}%)</span>}
                </div>
            </div>

            <div className="mt-5 overflow-x-auto">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="h-[310px] min-w-[560px] w-full"
                    role="img"
                    aria-label={`${years}년간 자산 성장 추이`}
                >
                    {[0, 1, 2, 3, 4].map((line) => {
                        const y = padding + (line / 4) * (chartHeight - padding * 2);
                        return <line key={line} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#eeeeee" />;
                    })}
                    <path d={`${basePath} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`} fill="#1111110b" />
                    <path d={basePath} fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {aggressive && <path d={aggressivePath} fill="none" stroke="#ff4444" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" strokeLinejoin="round" />}
                    {[0, 2, 4, 6, 8, 10].map((index) => {
                        const x = padding + (index / 10) * (chartWidth - padding * 2);
                        return <text key={index} x={x} y={chartHeight - 10} textAnchor="middle" fill="#aaaaaa" fontSize="11">{Math.round((years * index) / 10)}년</text>;
                    })}
                    <circle cx={chartWidth - padding} cy={chartHeight - padding - (baseValues.at(-1)! / maxValue) * (chartHeight - padding * 2)} r="5" fill="#111111" />
                    {aggressive && <circle cx={chartWidth - padding} cy={chartHeight - padding - (aggressiveValues.at(-1)! / maxValue) * (chartHeight - padding * 2)} r="5" fill="#ff4444" />}
                </svg>
            </div>
            <p className="sr-only">기본 예상 자산 {formatWon(baseValues.at(-1) ?? 0)}</p>
        </section>
    );
}
