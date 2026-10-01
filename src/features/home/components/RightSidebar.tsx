"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getMarketNews, type MarketNews } from "@/lib/api/market";
import { getApiErrorMessage } from "@/lib/api/client";
import { ArrowRightIcon, SparkleIcon } from "@/components/icons/Icon";
// 카드가 멈출 화면 위 위치 — 상단바(72px) 아래로 24px 띄운다.
const FOLLOW_TOP_PX = 96;
export default function RightSidebar() {
    const asideRef = useRef<HTMLElement>(null);
    const [news, setNews] = useState<MarketNews[]>([]);
    const [error, setError] = useState("");
    useEffect(() => { let active = true; getMarketNews("코스피").then(result => { if (active) setNews(result.results.slice(0, 5)); }).catch(error => { if (active) setError(getApiErrorMessage(error, "뉴스를 불러오지 못했습니다.")); }); return () => { active = false; }; }, []);
    // 홈은 1024px부터 주요 종목 옆에 두 카드를 나란히 두므로(.cq-home-main), 같은 기준으로 카드가 스크롤을 따라오게 한다.
    // sticky는 스크롤과 똑같이 즉시 붙어 딱딱해 보여서, 목표 위치만 계산해 transform으로 옮기고 transition으로 감속시켜
    // 부드럽게 내려오거나 올라가게 한다. 무한 스크롤로 목록이 길어지면 ResizeObserver로 이동 한계를 다시 계산한다.
    useEffect(() => {
        const aside = asideRef.current;
        const grid = aside?.parentElement;
        if (!aside || !grid) return;
        const wide = window.matchMedia("(min-width: 1024px)");
        let frame = 0;
        const update = () => {
            frame = 0;
            if (!wide.matches) { aside.style.transform = ""; return; }
            const gridTop = grid.getBoundingClientRect().top + window.scrollY;
            const maxOffset = Math.max(0, grid.offsetHeight - aside.offsetHeight);
            const offset = Math.min(Math.max(window.scrollY + FOLLOW_TOP_PX - gridTop, 0), maxOffset);
            aside.style.transform = `translateY(${Math.round(offset)}px)`;
        };
        const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(grid);
        resizeObserver.observe(aside);
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        wide.addEventListener("change", schedule);
        update();
        return () => {
            window.cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            wide.removeEventListener("change", schedule);
        };
    }, []);
    // 카드 묶음이 화면보다 길면(위 96px + 아래 여백 16px 제외) 내부에서 따로 스크롤한다.
    return <aside ref={asideRef} className="flex flex-col gap-3 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 lg:transition-transform lg:duration-[400ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:will-change-transform">
        <section className="always-dark rounded-lg border border-primary/25 bg-[linear-gradient(145deg,#16295c,#0a0b0d_68%)] p-4 shadow-[0_4px_16px_rgba(0,0,0,.22)]">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">재무 진단 브리핑</h2><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white"><SparkleIcon className="h-4 w-4" /></span></div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/15 p-3 text-xs leading-6 text-white/70">보유 자산과 투자 성향을 연결해 상담할 수 있습니다.</div>
            <Link href="/ai-financial-planner" className="mt-3 flex items-center justify-between rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-active">AI 분석 시작하기 <ArrowRightIcon className="h-3.5 w-3.5" /></Link>
        </section>
        <section className="rounded-lg border border-hairline bg-white p-4">
            <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-ink">뉴스 리포트</h2><Link href="/news-report" className="theme-accent-text text-[12px] font-bold">전체 보기</Link></div>
            {error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}
            {!error && !news.length && <p className="mt-3 text-xs text-muted">표시할 뉴스가 없습니다.</p>}
            <div className="mt-2 divide-y divide-hairline-soft">{news.map((item, index) => /^https?:\/\//.test(item.link) && <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="group relative block rounded-md py-3 pl-3 pr-1 transition-colors hover:bg-primary/[0.045]"><span className="text-[12px] font-black text-primary">0{index + 1}</span><h3 className="mt-1 text-xs font-bold leading-5 text-ink group-hover:text-primary">{item.title}</h3><p className="mt-1 text-[12px] text-muted">{item.outlet}</p></a>)}</div>
        </section>
    </aside>;
}
