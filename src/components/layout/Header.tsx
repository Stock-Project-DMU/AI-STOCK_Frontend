"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_LINKS } from "@/constants/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Header() {
    const pathname = usePathname();

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#06101d]/95 px-3 text-slate-100 shadow-[0_8px_30px_rgba(0,0,0,.24)] backdrop-blur-xl lg:px-7">
            <div className="mx-auto grid h-full max-w-[1760px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <Link href="/home" className="flex items-center gap-2.5" aria-label="AI STOCK 홈">
                    <span className="theme-accent-border theme-accent-soft flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border">
                        <img src="/Logo.png" alt="" className="h-8 w-8 object-contain" width={32} height={32} />
                    </span>
                    <span className="hidden sm:block">
                        <strong className="block text-sm font-black tracking-[0.12em]">AI STOCK</strong>
                        <small className="theme-accent-text block text-[9px] font-semibold tracking-[0.16em]">INVESTMENT LAB</small>
                    </span>
                </Link>

                <nav className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="주요 메뉴">
                    {HEADER_LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`whitespace-nowrap rounded-lg px-2 py-2 text-[10px] font-bold sm:px-3 sm:text-xs xl:px-4 xl:text-sm ${active ? "theme-accent-soft theme-accent-text" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-2">
                    <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-[10px] font-bold text-emerald-300 xl:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> DEMO MARKET
                    </span>
                    <label className="hidden items-center rounded-lg border border-white/10 bg-white/5 px-3 2xl:flex">
                        <span className="text-xs text-slate-500">⌕</span>
                        <input className="w-36 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-slate-600" placeholder="종목명·코드 검색" />
                    </label>
                    <ThemeToggle />
                    <Link href="/login" className="theme-accent-bg theme-accent-border theme-accent-shadow rounded-lg border px-3 py-2 text-[11px] font-bold sm:px-4 sm:text-xs">
                        로그인
                    </Link>
                </div>
            </div>
        </header>
    );
}
