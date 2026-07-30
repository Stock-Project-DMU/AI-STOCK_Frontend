"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_LINKS } from "@/constants/navigation";
import { SearchIcon } from "@/components/icons/Icon";

export default function Header() {
    const pathname = usePathname();

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 h-[72px] border-b border-hairline bg-canvas/95 px-4 text-ink shadow-[0_1px_0_rgba(10,11,13,0.04)] backdrop-blur-xl lg:px-7">
            <div className="mx-auto grid h-full max-w-[1760px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                <Link href="/home" className="flex items-center gap-2.5" aria-label="AI STOCK 홈">
                    <img src="/Logo.png" alt="" className="h-9 w-9 object-contain" width={36} height={36} />
                    <strong className="hidden text-base font-black tracking-[0.12em] text-ink sm:block">AI STOCK</strong>
                </Link>

                <nav className="flex min-w-0 items-center justify-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="주요 메뉴">
                    {HEADER_LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold sm:px-3.5 sm:text-sm ${active ? "theme-accent-soft theme-accent-text" : "text-body hover:bg-surface-soft hover:text-ink"}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-2.5">
                    <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 xl:flex">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 모의투자
                    </span>
                    <label className="hidden items-center rounded-full border border-hairline bg-surface-soft px-3.5 2xl:flex">
                        <SearchIcon className="h-4 w-4 text-muted" />
                        <input className="w-36 bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-muted-soft" placeholder="종목명·코드 검색" />
                    </label>
                    <Link
                        href="/login"
                        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 text-xs font-bold text-white transition-colors hover:bg-primary-active sm:px-5 sm:text-sm"
                    >
                        로그인
                    </Link>
                </div>
            </div>
        </header>
    );
}
