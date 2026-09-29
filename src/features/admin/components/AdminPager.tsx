"use client";

// 이전 · 페이지 번호(최대 5개) · 다음. more가 true면 마지막으로 불러온 페이지 뒤로도 넘어갈 수 있다.
export default function AdminPager({ page, totalPages, onChange, more = false, className = "" }: { page: number; totalPages: number; onChange: (page: number) => void; more?: boolean; className?: string }) {
    const total = Math.max(1, totalPages);
    const start = Math.max(0, Math.min(page - 2, total - 5));
    const pages = Array.from({ length: Math.min(5, total) }, (_, index) => start + index);
    return <div className={`flex justify-center gap-4 ${className}`}>
        <button disabled={page === 0} onClick={() => onChange(page - 1)}>이전</button>
        {pages.map(value => <button key={value} aria-current={value === page ? "page" : undefined} aria-label={`${value + 1}페이지`} onClick={() => onChange(value)}>{value + 1}</button>)}
        <button disabled={page + 1 >= total && !more} onClick={() => onChange(page + 1)}>다음</button>
    </div>;
}
