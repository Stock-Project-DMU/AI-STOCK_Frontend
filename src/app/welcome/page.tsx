import Link from "next/link";

export default function Welcome() {
    return (
        <main className="market-theme market-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 text-center">
            <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black tracking-[0.16em] text-emerald-300">ACCOUNT READY</span>
                <h1 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-6xl">AI STOCK에 오신 것을 환영합니다</h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">시장 데이터와 AI 분석을 연결해 나만의 투자 판단 체계를 만들어 보세요.</p>
                <div className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                    {[['01', '시장 탐색'], ['02', 'AI 진단'], ['03', '목표 시뮬레이션']].map(([step, label]) => <div key={step} className="rounded-2xl border border-white/10 bg-[#0b1726]/85 p-5"><span className="theme-accent-text text-xs font-black">{step}</span><strong className="mt-2 block text-sm text-slate-200">{label}</strong></div>)}
                </div>
                <Link href="/home" className="theme-accent-bg theme-accent-shadow mt-10 inline-flex items-center gap-3 rounded-xl px-7 py-4 text-sm font-black">대시보드 시작하기 <span>→</span></Link>
            </div>
        </main>
    );
}
