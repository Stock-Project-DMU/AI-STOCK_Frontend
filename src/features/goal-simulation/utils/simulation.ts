export function formatWon(value: number) {
    return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

// 차트 축·요약처럼 좁은 자리에 쓰는 짧은 금액 표기 (예: 1.2억, 3,500만)
export function formatCompactWon(value: number) {
    if (value >= 100_000_000) {
        const eok = value / 100_000_000;
        return `${eok >= 10 ? Math.round(eok).toLocaleString("ko-KR") : eok.toFixed(1).replace(/\.0$/, "")}억`;
    }
    if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
    return Math.round(value).toLocaleString("ko-KR");
}

// 개월 수를 "2년 3개월" 형태로
export function formatMonths(months: number) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (years === 0) return `${rest}개월`;
    return rest === 0 ? `${years}년` : `${years}년 ${rest}개월`;
}

// "2033-06-01" → "2033년 6월"
export function formatYearMonth(date: string) {
    const [year, month] = date.split("-");
    return `${year}년 ${Number(month)}월`;
}

// "2033-06-01" → "2033.06" (수치 요약처럼 좁은 자리용)
export function formatYearMonthDot(date: string) {
    return date.slice(0, 7).replace("-", ".");
}

// 월 성장률(소수) → "0.35%"
export function formatMonthlyRate(rate: number) {
    return `${(rate * 100).toFixed(2)}%`;
}

// 월 성장률(소수)을 복리로 연 환산 → "4.3%"
export function formatAnnualizedRate(monthlyRate: number) {
    return `${((Math.pow(1 + monthlyRate, 12) - 1) * 100).toFixed(1)}%`;
}
