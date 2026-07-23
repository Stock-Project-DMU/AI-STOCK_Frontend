import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/navigation";

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-[#050c16] px-6 py-9 text-slate-400">
            <div className="mx-auto grid max-w-[1600px] gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                    <strong className="text-base font-black tracking-[0.14em] text-white">AI STOCK</strong>
                    <p className="theme-accent-text mt-2 text-[11px] font-semibold tracking-[0.12em]">DATA-DRIVEN INVESTMENT LAB</p>
                </div>

                <div>
                    <nav className="flex flex-wrap gap-x-8 gap-y-3">
                        {FOOTER_LINKS.map((link) => (
                            <Link key={link.label} href={link.href} className="text-xs font-bold text-slate-300 hover:text-[var(--market-accent-text)]">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <p className="mt-5 max-w-[960px] text-xs leading-6 text-slate-500">
                        AI STOCK에서 제공하는 투자 정보와 서비스는 학습 및 투자 판단 참고용이며, 투자 제안·권유 또는 수익을 보장하지 않습니다.
                    </p>
                    <address className="mt-3 not-italic text-xs leading-6 text-slate-600">
                        서울특별시 구로구 경인로 445 동양미래대학교 · 대표 김진우, 박찬서, 전우혁, 전유찬
                    </address>
                    <p className="mt-3 text-[11px] font-semibold text-slate-600">Copyright © AI STOCK. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
