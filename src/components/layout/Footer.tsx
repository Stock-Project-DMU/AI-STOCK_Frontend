import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/navigation";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white px-6 py-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center text-center">
        <nav className="mb-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-gray-900 transition-colors hover:text-gray-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mb-2 max-w-[900px] text-sm leading-relaxed text-gray-700">
          AI STOCK 에서 제공하는 투자 정보와 서비스는 고객의 투자 판단을
          위한 단순 참고용일 뿐, 투자 제안 및 권유, 종목 추천을 위해 작성된
          것이 아닙니다.
        </p>

        <address className="not-italic">
          <p className="text-sm text-gray-700">
            주소 : 08221 서울특별시 구로구 경인로 445 동양미래대학교 3호관
            5층
          </p>
          <p className="mt-1 text-sm text-gray-700">
            대표 : 김진우, 박찬서, 전우혁, 전유찬
          </p>
        </address>

        <p className="mt-4 text-sm font-semibold text-gray-500">
          Copyright © AI STOCK. All rights reserved.
        </p>
      </div>
    </footer>
  );
}