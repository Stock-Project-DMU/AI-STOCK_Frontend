const EOK = 1_0000_0000;
const JO = 1_0000_0000_0000;

// 원 단위 금액을 조/억 단위 한글 표기로 바꾼다. 예: 4_100_000_000_000 -> "4조 1,000억원".
export function formatEokWon(value: number | null | undefined) {
    if (value == null) return "-";
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    const jo = Math.floor(abs / JO);
    const eok = Math.floor((abs % JO) / EOK);

    if (jo > 0) return eok > 0 ? `${sign}${jo}조 ${eok.toLocaleString("ko-KR")}억원` : `${sign}${jo}조원`;
    if (eok > 0) return `${sign}${eok.toLocaleString("ko-KR")}억원`;
    return `${sign}${abs.toLocaleString("ko-KR")}원`;
}
