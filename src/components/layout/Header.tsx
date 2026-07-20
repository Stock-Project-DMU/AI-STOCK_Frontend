"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HEADER_LINKS } from "@/constants/navigation";

export default function Header() {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <header className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center bg-black px-2 sm:px-3 lg:px-8">
            <Link href="/home" className="flex items-center">
                <img
                    src="/Logo.png"
                    alt="Logo"
                    className="h-8 w-auto sm:h-9 lg:h-12"
                    width={100}
                    height={100}
                />
            </Link>

            <nav className="flex min-w-0 items-center justify-center gap-1 px-1 text-[10px] sm:gap-2 sm:px-2 sm:text-xs lg:gap-6 lg:px-6 lg:text-sm xl:gap-10 xl:px-8 xl:text-base">
                {HEADER_LINKS.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="whitespace-nowrap font-bold text-white hover:text-gray-500"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:gap-5">
                <input
                    className="w-20 rounded-md bg-white px-2 py-1.5 text-xs text-black outline-none placeholder:text-gray-500 sm:w-24 lg:w-44 lg:px-3 lg:text-sm xl:w-52"
                    placeholder="검색"
                />
                <Link href="/login" className="rounded-md bg-gray-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-gray-600 lg:px-4 lg:text-base">
                    로그인
                </Link>
            </div>
        </header>
    );
}
