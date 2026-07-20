export default function StockHeader() {
    return (
        <section className="border-b bg-white px-5 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">S</span>
                    <strong>삼성전자</strong>
                    <span className="text-xs text-gray-400">SAM</span>
                    <span className="ml-3 text-2xl font-semibold">191,000원</span>
                    <span className="text-sm font-semibold text-red-500">+3,303원 (1.76%)</span>
                </div>
                <dl className="grid grid-cols-4 gap-6 text-center text-[10px] text-gray-400">
                    <div><dt>1일 최고</dt><dd className="font-bold text-gray-700">192,500</dd></div>
                    <div><dt>1일 최저</dt><dd className="font-bold text-gray-700">189,708</dd></div>
                    <div><dt>52주 최고</dt><dd className="font-bold text-gray-700">210,780</dd></div>
                    <div><dt>52주 최저</dt><dd className="font-bold text-gray-700">58,780</dd></div>
                </dl>
            </div>
        </section>
    );
}
