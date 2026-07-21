export function calculateFutureValue(
    monthlyPayment: number,
    years: number,
    annualReturn: number,
) {
    const months = years * 12;
    const monthlyRate = annualReturn / 100 / 12;

    if (monthlyRate === 0) {
        return monthlyPayment * months;
    }

    return (
        monthlyPayment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    );
}

export function formatWon(value: number) {
    return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function buildGrowthPoints(
    monthlyPayment: number,
    years: number,
    annualReturn: number,
) {
    return Array.from({ length: 11 }, (_, index) => {
        const elapsedYears = (years * index) / 10;
        return calculateFutureValue(monthlyPayment, elapsedYears, annualReturn);
    });
}
