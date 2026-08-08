const summaryMetrics = [
  { label: "판매 수익", value: "+123,000원" },
  { label: "배당금", value: "+21원" },
  { label: "계좌 이자", value: "+20원" },
];

const balanceMetrics = [
  { label: "계좌 잔액", value: "1,002,000원" },
  { label: "총 평가 금액", value: "152,002,000원" },
  { label: "주문 가능 금액", value: "1,000,000원" },
];

const returnRows = [
  ["26.01.01", "삼성전자", "+100,000원", "+1.0%", "100원", "200,000원", "10주", "120원", "230원", "90,000원"],
  ["26.01.01", "SK하이닉스", "+100,000원", "-1.0%", "100원", "200,000원", "10주", "120원", "230원", "90,000원"],
];

export default function ReturnsPanel() {
  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4"><h1 className="text-xl font-extrabold">수익률</h1></div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted">총 실현 수익</p>
          <strong className="num mt-1.5 block text-2xl font-black text-red-500 sm:text-3xl">+123,000원</strong>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">{summaryMetrics.map((metric) => <div key={metric.label} className="rounded-lg border border-hairline bg-white p-3"><p className="text-xs font-semibold text-muted">{metric.label}</p><p className="num mt-1.5 text-right text-sm font-extrabold text-red-500">{metric.value}</p></div>)}</div>
        </section>
        <section className="flex flex-col items-center justify-center rounded-lg border border-hairline p-4">
          <div aria-label="종목별 수익 구성 원형 차트" className="h-32 w-32 rounded-full bg-[conic-gradient(#14b8a6_0_25%,#fb7185_25%_48%,#8b5cf6_48%_92%,#94a3b8_92%)] p-6 shadow-[0_10px_30px_rgba(0,0,0,.12)]"><div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white"><strong className="text-base">3종목</strong><span className="mt-1 text-[11px] text-muted">수익 구성</span></div></div>
          <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs"><span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-teal-500" />삼성전자</span><span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-rose-400" />SK하이닉스</span><span><i className="mx-auto mb-1 block h-2 w-2 rounded-full bg-violet-500" />메리츠</span></div>
        </section>
      </div>

      <dl className="mt-3 grid gap-2.5 sm:grid-cols-3">{balanceMetrics.map((metric) => <div key={metric.label} className="rounded-lg border border-hairline bg-white p-3 sm:p-4"><dt className="text-xs font-semibold text-muted">{metric.label}</dt><dd className="num mt-1.5 text-right text-sm font-extrabold">{metric.value}</dd></div>)}</dl>

      <section className="mt-3 overflow-hidden rounded-lg border border-hairline">
        <div className="border-b border-hairline bg-surface-soft px-4 py-3"><h2 className="font-bold">종목별 실현 수익</h2><p className="mt-1 text-xs text-muted">최근 체결된 매도 주문 기준</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead className="bg-surface-soft"><tr>{["판매일", "종목명", "총 판매수익", "수익률", "총 판매금액", "총 구매금액", "판매수량", "수수료", "1주당 수익", "1주당 판매가격"].map((head) => <th key={head} className="border-b border-hairline px-3 py-2 font-semibold text-muted">{head}</th>)}</tr></thead>
            <tbody>{returnRows.map((row, index) => <tr key={row[1]} className="border-b border-hairline last:border-0 hover:bg-surface-soft">{row.map((cell, cellIndex) => <td key={`${row[1]}-${cellIndex}`} className={`whitespace-nowrap px-3 py-2 ${cellIndex !== 1 ? "num text-right" : ""} ${cellIndex === 1 ? "font-bold" : ""} ${cellIndex === 2 || cellIndex === 3 ? (index ? "text-blue-500" : "text-red-500") + " font-bold" : ""}`}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
