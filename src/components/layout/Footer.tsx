import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/navigation";

export default function Footer() {
    return (
        <footer className="w-full border-t border-hairline bg-canvas px-6 py-6 text-body lg:px-8 lg:py-7">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex flex-col items-center text-center">
                    <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2.5">
                        {FOOTER_LINKS.map((link) => (
                            <Link key={link.label} href={link.href} className="text-xs font-bold text-body hover:text-primary">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <p className="mx-auto mt-4 max-w-[720px] text-xs leading-6 text-muted">
                        AI STOCK에서 제공하는 투자 정보와 서비스는 학습 및 투자 판단 참고용이며, 투자 제안·권유 또는 수익을 보장하지 않습니다.
                    </p>
                    <address className="mt-2.5 not-italic text-xs leading-6 text-muted-soft">
                        서울특별시 구로구 경인로 445 동양미래대학교 · 대표 김진우, 박찬서, 전우혁, 전유찬
                    </address>
                    <p className="mt-2.5 text-[11px] font-semibold text-muted-soft">Copyright © AI STOCK. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
