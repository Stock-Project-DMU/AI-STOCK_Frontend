"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import FinancialSummary from "@/features/ai-financial-planner/components/FinancialSummary";
import { Button } from "@/components/common/Button";
import { useLivePortfolio } from "@/hooks/LivePortfolioProvider";
import { runSimulation, saveSimulation, type SimulationResult } from "@/lib/api/ai";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { formatMonths, formatWon, formatYearMonth } from "../utils/simulation";
import ProjectionPanel from "./ProjectionPanel";
import SimulationHistoryModal from "./SimulationHistoryModal";

const GOAL_EXAMPLES = ["3년 안에 5천만원 모으기", "총자산 1억 만들기", "2030년까지 3억"];
const MAX_MONTHLY_CONTRIBUTION = 100_000_000;
// 투자성향 설문 화면 — 설문을 안 한 사용자가 마이페이지에 ?survey=1로 들어가면 설문이 바로 열린다(MyPageDashboard).
const SURVEY_PATH = "/my-page?survey=1";

const CURRENT_COLOR = "var(--chart-label)";
const CURRENT_SOFT_COLOR = "rgba(143, 149, 158, 0.14)";
const REBALANCED_COLOR = "var(--chart-primary)";
const REBALANCED_SOFT_COLOR = "var(--chart-primary-soft)";

function describeShortening(result: SimulationResult) {
    const { shortenedMonths, current, rebalanced } = result;
    if (shortenedMonths !== null) {
        if (shortenedMonths > 0) return { tone: "good" as const, text: `리밸런싱하면 목표 도달이 약 ${formatMonths(shortenedMonths)} 앞당겨질 것으로 예상됩니다.` };
        if (shortenedMonths < 0) return { tone: "bad" as const, text: `리밸런싱하면 목표 도달이 약 ${formatMonths(-shortenedMonths)} 늦어질 것으로 예상됩니다.` };
        return { tone: "neutral" as const, text: "리밸런싱해도 목표 도달 시점은 같을 것으로 예상됩니다." };
    }
    if (current.reachDate === null && rebalanced.reachDate !== null) {
        return { tone: "good" as const, text: `현재 구성으로는 30년 안에 도달이 어렵지만, 리밸런싱하면 ${formatYearMonth(rebalanced.reachDate)}쯤 도달할 것으로 예상됩니다.` };
    }
    if (current.reachDate !== null && rebalanced.reachDate === null) {
        return { tone: "bad" as const, text: "리밸런싱 구성으로는 30년 안에 도달이 어려울 것으로 예상됩니다." };
    }
    return { tone: "bad" as const, text: "두 구성 모두 현재 조건으로는 도달이 어렵습니다. 목표 금액·기한이나 월 추가 납입액을 조정해 보세요." };
}

export default function GoalSimulator() {
    const [goalText, setGoalText] = useState("");
    const [contributionInput, setContributionInput] = useState("0");
    // 현재 계좌(보유종목 평가금액 + 예수금)를 시작 금액으로 쓸지 여부. 끄면 0원에서 월 추가 납입액만으로 시작한다.
    const [includeCurrentPortfolio, setIncludeCurrentPortfolio] = useState(true);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    // POST /api/simulations의 403은 투자성향 설문 미완료(INVESTMENT_PROFILE_REQUIRED)뿐이라 상태 코드로 구분한다.
    const [surveyRequired, setSurveyRequired] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [historyOpen, setHistoryOpen] = useState(false);

    const live = useLivePortfolio();
    // 백엔드 SimulationService와 같은 기준: 예수금 = 잔액 + 지정가 매수 대기 금액(frozenBalance)
    const liveCashAmount = live.account ? live.account.balance + live.account.frozenBalance : 0;

    const monthlyContribution = Number(contributionInput.replace(/[^0-9]/g, "") || "0");
    // 계좌를 반영하지 않으면 시작 금액이 0원이라 납입액도 0원이면 곡선이 0에서 움직이지 않는다.
    const needsContribution = !includeCurrentPortfolio && monthlyContribution === 0;
    // 첫 조회(isLoading)가 끝나기 전에는 계좌·보유종목이 비어 있어 미리보기가 0원으로 보이므로 실행을 잠시 막는다.
    // 10초 주기 갱신은 isLoading을 바꾸지 않아(LivePortfolioProvider의 silent 조회) 버튼이 깜빡이지 않는다.
    const portfolioLoading = includeCurrentPortfolio && live.isLoading;
    const canRun = goalText.trim().length > 0 && goalText.trim().length <= 200 && monthlyContribution <= MAX_MONTHLY_CONTRIBUTION && !needsContribution && !portfolioLoading && !busy;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canRun) return;
        setBusy(true);
        setError("");
        setSurveyRequired(false);
        setSaveError("");
        try {
            setResult(await runSimulation(goalText.trim(), monthlyContribution, includeCurrentPortfolio));
        } catch (runError) {
            setError(getApiErrorMessage(runError, "시뮬레이션 실행에 실패했습니다."));
            setSurveyRequired(runError instanceof ApiError && runError.status === 403);
        } finally {
            setBusy(false);
        }
    };

    const handleSave = async () => {
        if (!result?.pendingSimulationId || saving) return;
        setSaving(true);
        setSaveError("");
        try {
            setResult(await saveSimulation(result.pendingSimulationId));
        } catch (saveFailure) {
            setSaveError(getApiErrorMessage(saveFailure, "저장에 실패했습니다."));
        } finally {
            setSaving(false);
        }
    };

    const saved = result !== null && result.simulationId !== null;
    const chartMax = result
        ? Math.max(result.targetAmount, ...result.current.points.map((point) => point.value), ...result.rebalanced.points.map((point) => point.value)) * 1.08
        : 0;
    const shortening = result ? describeShortening(result) : null;

    return (
        <div className="cq-simulation-shell market-theme market-grid flex min-h-[calc(100vh-4rem)] min-w-0 flex-col">
            <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <section className="mx-auto max-w-[1220px] rounded-lg border border-hairline bg-canvas p-5 shadow-[0_4px_12px_rgba(0,0,0,.04)] sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="border-l-4 border-primary pl-3">
                            <h1 className="text-xl font-bold text-ink">목표 도달 시뮬레이션</h1>
                            <p className="mt-1 text-xs text-muted">
                                목표를 문장으로 입력하면 지금 보유한 종목을 그대로 둘 때와 투자성향에 맞게 리밸런싱할 때의 목표 도달 시점을 비교합니다.
                            </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>저장 목록</Button>
                            <Button variant="primary" size="sm" onClick={() => void handleSave()} disabled={!result || saved || saving || busy}>
                                {saving ? "저장 중..." : saved ? "저장됨" : "저장"}
                            </Button>
                        </div>
                    </div>
                    {saveError && <p role="alert" className="mt-3 text-sm text-red-600">{saveError}</p>}

                    <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 rounded-lg border border-hairline bg-surface-soft p-4">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
                            <label className="block min-w-0 text-sm font-semibold text-ink">
                                목표
                                <input
                                    type="text"
                                    value={goalText}
                                    maxLength={200}
                                    onChange={(event) => setGoalText(event.target.value)}
                                    placeholder="예) 3년 안에 5천만원 모으기"
                                    className="mt-1.5 h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-sm font-normal text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                                />
                            </label>
                            <label className="block text-sm font-semibold text-ink">
                                월 추가 납입액
                                <span className="relative mt-1.5 block">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={monthlyContribution.toLocaleString("ko-KR")}
                                        onChange={(event) => setContributionInput(event.target.value)}
                                        className="num h-11 w-full rounded-md border border-hairline bg-canvas pl-3 pr-8 text-right text-sm font-normal text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                                        aria-describedby="contribution-help"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-normal text-muted">원</span>
                                </span>
                            </label>
                            <Button type="submit" variant="primary" size="md" disabled={!canRun}>
                                {busy ? "분석 중..." : "시뮬레이션 실행"}
                            </Button>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-hairline bg-canvas px-3 py-2.5">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={includeCurrentPortfolio}
                                aria-describedby="portfolio-include-help"
                                onClick={() => setIncludeCurrentPortfolio((value) => !value)}
                                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink"
                            >
                                <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${includeCurrentPortfolio ? "bg-primary" : "bg-hairline"}`} aria-hidden="true">
                                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${includeCurrentPortfolio ? "translate-x-4" : "translate-x-0.5"}`} />
                                </span>
                                현재 계좌 반영
                                <span className={`text-xs font-bold ${includeCurrentPortfolio ? "text-primary" : "text-muted"}`}>{includeCurrentPortfolio ? "ON" : "OFF"}</span>
                            </button>
                            <p id="portfolio-include-help" className="num min-w-0 text-xs text-body">
                                {!includeCurrentPortfolio
                                    ? "월 납입액부터 시작하는 시뮬레이션입니다."
                                    : live.isLoading
                                        ? "현재 포트폴리오를 불러오는 중입니다..."
                                        : live.account
                                            ? `현재 포트폴리오: 보유종목 ${formatWon(live.totalEvaluationAmount)} + 예수금 ${formatWon(liveCashAmount)} = ${formatWon(live.totalAsset)}`
                                            : live.error
                                                ? "계좌 정보를 불러오지 못했습니다. 실행 시 서버에서 계좌를 다시 확인합니다."
                                                : "개설된 계좌가 없어 현재 계좌를 반영할 수 없습니다. 계좌 반영을 끄고 실행해 주세요."}
                            </p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted">예시</span>
                            {GOAL_EXAMPLES.map((example) => (
                                <button key={example} type="button" onClick={() => setGoalText(example)} className="rounded-full border border-hairline bg-canvas px-3 py-1 text-xs text-body hover:border-primary hover:text-primary">
                                    {example}
                                </button>
                            ))}
                        </div>
                        <p id="contribution-help" className="mt-2 text-xs text-muted">
                            {includeCurrentPortfolio ? "시작 금액은 내 계좌의 보유종목 평가금액과 예수금으로 자동 계산됩니다. " : "시작 금액 0원에서 매달 납입액만 쌓아 계산합니다. "}
                            월 추가 납입액은 최대 1억원까지 입력할 수 있습니다.
                        </p>
                        {monthlyContribution > MAX_MONTHLY_CONTRIBUTION && <p role="alert" className="mt-1 text-xs text-red-600">월 추가 납입액은 1억원 이하로 입력해 주세요.</p>}
                        {needsContribution && <p role="alert" className="mt-1 text-xs text-red-600">현재 계좌를 반영하지 않으면 월 추가 납입액을 입력해 주세요.</p>}
                    </form>

                    {busy && (
                        <p role="status" className="mt-4 rounded-md bg-primary/5 px-4 py-3 text-sm text-primary">
                            AI가 목표를 해석하고, 보유종목과 투자성향을 바탕으로 리밸런싱 구성을 분석하고 있습니다. 10~30초 정도 걸릴 수 있어요.
                        </p>
                    )}
                    {error && (
                        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md bg-red-500/5 px-4 py-3 text-sm text-red-600">
                            <p>{error}</p>
                            {surveyRequired && (
                                <Link href={SURVEY_PATH} className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                                    투자성향 설문하러 가기
                                </Link>
                            )}
                        </div>
                    )}

                    {result && shortening ? (
                        <div className="mt-5 space-y-4">
                            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-hairline p-4 text-sm md:grid-cols-4">
                                <div className="col-span-2 min-w-0 md:col-span-1">
                                    <dt className="text-xs text-muted">목표</dt>
                                    <dd className="mt-1 truncate font-semibold text-ink" title={result.goalText}>{result.goalText}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted">목표 금액 · 기한</dt>
                                    <dd className="num mt-1 font-semibold text-ink">
                                        {formatWon(result.targetAmount)}
                                        <span className="ml-1 font-normal text-muted">{result.periodMonths !== null ? `· ${formatMonths(result.periodMonths)}` : "· 기한 없음"}</span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted">시작 금액</dt>
                                    <dd className="num mt-1 font-semibold text-ink">{formatWon(result.startAmount)}</dd>
                                    <dd className="text-xs text-muted">
                                        {result.startAmount === 0 ? "월 납입액부터 시작" : `보유종목 ${formatWon(result.holdingsAmount)} + 예수금 ${formatWon(result.cashAmount)}`}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted">월 추가 납입</dt>
                                    <dd className="num mt-1 font-semibold text-ink">{formatWon(result.monthlyContribution)}</dd>
                                </div>
                            </dl>

                            <div className="cq-simulation-compare grid gap-4">
                                <ProjectionPanel
                                    title="현재 보유 유지"
                                    description={result.startAmount === 0 ? "납입금을 종목 없이 모두 예수금(현금)으로 둘 때" : "지금 보유한 종목과 예수금 비중을 그대로 유지할 때"}
                                    projection={result.current}
                                    targetAmount={result.targetAmount}
                                    periodMonths={result.periodMonths}
                                    maxValue={chartMax}
                                    color={CURRENT_COLOR}
                                    softColor={CURRENT_SOFT_COLOR}
                                />
                                <ProjectionPanel
                                    title="투자성향 맞춤 리밸런싱"
                                    description="투자성향에 맞게 종목과 비중을 조정할 때"
                                    projection={result.rebalanced}
                                    targetAmount={result.targetAmount}
                                    periodMonths={result.periodMonths}
                                    maxValue={chartMax}
                                    color={REBALANCED_COLOR}
                                    softColor={REBALANCED_SOFT_COLOR}
                                />
                            </div>

                            <div className={`rounded-lg border px-5 py-4 ${shortening.tone === "good" ? "border-primary/20 bg-primary/5" : shortening.tone === "bad" ? "border-red-500/20 bg-red-500/5" : "border-hairline bg-surface-soft"}`}>
                                <strong className={`block text-sm ${shortening.tone === "good" ? "text-primary" : shortening.tone === "bad" ? "text-red-600" : "text-ink"}`}>목표 도달 시간 변화</strong>
                                <p className="mt-1 text-base font-semibold text-ink">{shortening.text}</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-lg border border-hairline p-4 sm:p-5">
                                    <h3 className="text-sm font-bold text-ink">리밸런싱 이유</h3>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-body">{result.rebalanceReason}</p>
                                </article>
                                <article className="rounded-lg border border-hairline p-4 sm:p-5">
                                    <h3 className="text-sm font-bold text-ink">목표 도달 시간 단축 설명</h3>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-body">{result.timeReductionExplanation}</p>
                                </article>
                            </div>

                            <aside className="rounded-lg bg-surface-soft px-4 py-3 text-xs leading-5 text-muted" aria-label="참고 안내">
                                <strong className="text-body">참고용 데이터입니다.</strong> 이 결과는 종목별 최근 3년 월봉의 복리 기준(기하평균) 수익률을 30% 낮추고 월 5%를 넘지 않게 잡은 보수적 성장률과
                                AI(Gemini)의 분석을 바탕으로 계산한 모의 결과이며, 실제 수익이나 목표 달성을 보장하지 않습니다. 투자 권유가 아니며,
                                세금·수수료·물가 상승은 반영하지 않았습니다. 투자 판단과 그 결과의 책임은 본인에게 있습니다.
                            </aside>
                        </div>
                    ) : (
                        !busy && (
                            <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface-soft p-6 text-center">
                                <p className="text-sm font-semibold text-ink">아직 시뮬레이션 결과가 없습니다</p>
                                <p className="mt-2 text-xs leading-5 text-muted">
                                    목표를 입력하고 &apos;시뮬레이션 실행&apos;을 누르면
                                    <br />
                                    현재 보유 유지와 리밸런싱 결과를 나란히 비교해 드려요.
                                </p>
                            </div>
                        )
                    )}
                </section>
            </div>

            <FinancialSummary />

            {historyOpen && (
                <SimulationHistoryModal
                    onClose={() => setHistoryOpen(false)}
                    onSelect={(selected) => {
                        setResult(selected);
                        // 불러온 결과와 입력창이 어긋나지 않도록 목표 문장·월 추가 납입액도 저장 당시 값으로 맞춘다.
                        setGoalText(selected.goalText);
                        setContributionInput(String(selected.monthlyContribution));
                        setError("");
                        setSurveyRequired(false);
                        setSaveError("");
                        setHistoryOpen(false);
                    }}
                    onDeleted={(simulationId) => { if (result?.simulationId === simulationId) setResult(null); }}
                />
            )}
        </div>
    );
}
