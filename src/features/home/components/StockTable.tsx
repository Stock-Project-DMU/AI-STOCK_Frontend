import { FavoriteButton } from "@/components/common/Button";

export default function StockTable() {
    const stockData = [
        { name: "삼성전자", changeRate: "+1.05%", currentPrice: "191,700원", tradingValue: "6.7억원" },
        { name: "LG전자", changeRate: "-0.85%", currentPrice: "120,500원", tradingValue: "3.2억원" },
        { name: "SK하이닉스", changeRate: "+0.50%", currentPrice: "95,300원", tradingValue: "4.1억원" },
        { name: "현대자동차", changeRate: "+2.10%", currentPrice: "220,000원", tradingValue: "5.5억원" },
        { name: "카카오", changeRate: "-1.20%", currentPrice: "85,400원", tradingValue: "2.8억원" },
        { name: "네이버", changeRate: "+0.75%", currentPrice: "310,000원", tradingValue: "7.3억원" },
        { name: "셀트리온", changeRate: "-0.60%", currentPrice: "250,000원", tradingValue: "3.9억원" },
        { name: "현대모비스", changeRate: "+1.80%", currentPrice: "280,000원", tradingValue: "4.5억원" },
        { name: "LG화학", changeRate: "-0.95%", currentPrice: "700,000원", tradingValue: "6.1억원" },
        { name: "삼성바이오로직스", changeRate: "+0.40%", currentPrice: "900,000원", tradingValue: "5.2억원" },
        { name: "포스코", changeRate: "-1.10%", currentPrice: "350,000원", tradingValue: "3.7억원" },
        { name: "현대제철", changeRate: "+0.90%", currentPrice: "150,000원", tradingValue: "2.5억원" },
        { name: "LG디스플레이", changeRate: "-0.70%", currentPrice: "80,000원", tradingValue: "1.9억원" },
    ];

    return (
        <div className="">
            <div className="bg-white rounded-lg shadow-md p-1.5 flex justify-end gap-1">
                <button 
                    className="text-[12px] font-semibold shadow-md bg-gray-200 hover:bg-gray-300 rounded-lg px-2 p-1"
                >
                    현재가
                </button>
                <button 
                    className="text-[12px] font-semibold shadow-md bg-gray-200 hover:bg-gray-300 rounded-lg px-2 p-1"
                >
                    급상승
                </button>
                <button 
                    className="text-[12px] font-semibold shadow-md bg-gray-200 hover:bg-gray-300 rounded-lg px-2 p-1"
                >
                    급하락
                </button>
                <button 
                    className="text-[12px] font-semibold shadow-md bg-gray-200 hover:bg-gray-300 rounded-lg px-2 p-1"
                >
                    거래량
                </button>
                <button 
                    className="text-[12px] font-semibold shadow-md bg-gray-200 hover:bg-gray-300 rounded-lg px-2 p-1"
                >
                    거래대금
                </button>
            </div>
            <div 
                className="bg-white rounded-lg shadow-md p-1 overflow-x-auto mt-0.5"
            >
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="px-4 py-2 text-left">관심</th>
                            <th className="px-4 py-2 text-left">종목명</th>
                            <th className="px-4 py-2 text-right">등락률</th>
                            <th className="px-4 py-2 text-right">현재가</th>
                            <th className="px-4 py-2 text-right">거래대금</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: stockData.length }).map((_, index) => (
                            <tr key={index} className="border-b">
                                <td className="w-16 px-3 text-center align-middle">
                                    <FavoriteButton />
                                </td>
                                <td className="p-3">{stockData[index]?.name}</td>
                                <td className="p-3 text-right text-red-500">{stockData[index]?.changeRate}</td>
                                <td className="p-3 text-right">{stockData[index]?.currentPrice}</td>
                                <td className="p-3 text-right">{stockData[index]?.tradingValue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
