import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/Icon";

export default function Welcome() {
    return (
        <main className="market-theme auth-shell flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 text-center">
            <div className="max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">AI STOCK에 오신 것을 환영합니다</h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-body sm:text-lg">시장 데이터와 AI 분석을 연결해 나만의 투자 판단 체계를 만들어 보세요.</p>
                <div className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                    {[['01', '시장 탐색'], ['02', 'AI 진단'], ['03', '목표 시뮬레이션']].map(([step, label]) => <div key={step} className="rounded-lg border border-hairline bg-surface-soft p-5"><span className="theme-accent-text text-xs font-bold">{step}</span><strong className="mt-2 block text-sm text-ink">{label}</strong></div>)}
                </div>
                <Link href="/home" className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-md bg-primary px-8 text-base font-semibold text-white transition-colors hover:bg-primary-active">대시보드 시작하기 <ArrowRightIcon className="h-4 w-4" /></Link>
            </div>
        </main>
    );
}
