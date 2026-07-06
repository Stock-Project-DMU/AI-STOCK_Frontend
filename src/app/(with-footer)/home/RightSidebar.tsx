export default function RightSidebar() {
    return (
        <aside className="flex flex-col gap-5">
            <section className="rounded-xl bg-white shadow-sm p-5">
                <h2 className="mb-4 font-bold">AI 재무설계사 진단</h2>

                <div
                    className="mb-3 rounded-xl bg-gray-100 p-3 text-sm"
                >
                    안녕하세요 AI 재무설계사입니다.
                </div>
                <div
                    className="mb-3 rounded-xl bg-gray-100 p-3 text-sm"
                >
                    제 보유 종목을 분석해주세요.
                </div>
                <div 
                    className="flex gap-2"
                >
                    <input
                        placeholder="AI에게 물어보기"
                        className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm outline-none"
                    />
                    <button
                        className="rounded bg-black hover:bg-gray-500 px-4 py-2 text-sm text-white font-semibold"
                    >
                        전송
                    </button>
                </div>  
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
                <h2 
                    className="mb-4 font-bold"
                >
                    AI 맞춤 전략 팁
                </h2>

                <div 
                    className="flex h-32 items-center justify-center rounded-lg bg-gray-100"
                >
                    <button className="rounded bg-black hover:bg-gray-500 px-4 py-2 text-sm text-white font-semibold">
                        상세 보기
                    </button>
                </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
                <h2 
                    className="mb-4 font-bold"
                >
                    뉴스 리포트
                </h2>
                <div className="flex flex-col gap-3 text-sm">
                    <div 
                        className="border-b pb-2 flex items-center justify-between"
                    >
                        <span className="font-semibold">관세, 삼성 투자 소식...</span>
                        <img 
                            src="new1.png" 
                            alt="뉴스 이미지" 
                            className="text-right ml-2 h-20 w-30 object-cover rounded-lg"
                        />
                    </div>
                    <div 
                        className="border-b pb-2 flex items-center justify-between"
                    >
                        <span className="font-semibold">미국 빅테크 관련 뉴스...</span>
                        <img 
                            src="new1.png" 
                            alt="뉴스 이미지" 
                            className="text-right ml-2 h-20 w-30 object-cover rounded-lg"
                        />
                    </div>
                    <div 
                        className="pb-2 flex items-center justify-between"
                    >
                        <span className="font-semibold">오늘의 증시 주요 이슈...</span>
                        <img 
                            src="new1.png" 
                            alt="뉴스 이미지" 
                            className="text-right ml-2 h-20 w-30 object-cover rounded-lg"
                        />
                    </div>
                </div>
            </section>
        </aside>
    );
}