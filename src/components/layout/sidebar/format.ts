const wonFormatter = new Intl.NumberFormat("ko-KR");

export function formatWon(value: number) {
    return `${wonFormatter.format(value)}원`;
}

export function formatSignedWon(value: number) {
    return `${value >= 0 ? "+" : "-"}${formatWon(Math.abs(value))}`;
}

export function getRateColorClass(rate: string) {
    if (rate.trim().startsWith("-")) {
        return "text-down";
    }

    if (rate.trim() === "0%" || rate.trim() === "0.00%") {
        return "text-muted";
    }

    return "text-up";
}
