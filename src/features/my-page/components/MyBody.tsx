import { myDatas } from "../constants/myDatas";

export default function MyBody() {

    const basicInfos = [
        { label: "아이디", value: myDatas.userId },
        { label: "이름", value: myDatas.name },
        { label: "생년월일", value: myDatas.birthday.toLocaleDateString('ko-KR') },
        { label: "이메일", value: myDatas.email },
    ]

    return(
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-[80%] max-w-[1800px] flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-sm gap-5">
                <div className="w-full grid grid-cols-2 items-center gap-4">
                    <p 
                        className="font-bold ml-5"
                    >
                        내 정보
                    </p>
                    <button 
                        className="w-[150px] cursor-pointer bg-black hover:bg-gray-500 font-semibold text-white px-5 p-2 mr-5 rounded-lg justify-self-end"
                    >
                        정보 수정
                    </button>
                </div>
                <div className="w-full flex text-gray-500 font-bold border border-gray-300 rounded-lg gap-5 p-4 shadow-sm">
                    <div className="w-full flex flex-col gap-3">
                        {basicInfos.map((info, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-gray-400 ml-3">{info.label}</span>
                                <span className="mr-20 font-medium">{info.value}</span>
                            </div>
                        ))}

                        <div className="flex justify-between">
                            <span className="text-gray-400 ml-3">투자성향</span>
                            <span className="mr-20 font-bold text-red-600">{myDatas.investmentProfile}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-400 ml-3">자금성향</span>
                            <span className="mr-20 font-bold text-red-600">{myDatas.natureOfFunds}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-400 ml-3">투자레벨</span>
                            <span className="mr-20 font-bold text-amber-900">{myDatas.investmentLevel}</span>
                        </div>
                    </div>
                </div>
                <button className="font-bold self-start ml-5 hover:underline cursor-pointer">AI STOCK 탈퇴하기 →</button>
            </div>
        </div>
    );
}