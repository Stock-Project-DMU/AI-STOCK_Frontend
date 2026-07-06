import Link from "next/link";

export default function Header() {
    return (
        <div className="flex items-center justify-center gap-6 bg-black">
            <img 
                src="/Logo.png" alt="Logo"
                className="m-2 mr-8"
                width={100}
                height={100}
            />
            <Link
                href="/home" 
                className="text-white hover:text-blue-300 font-bold"
            >
                홈
            </Link>
            <Link 
                href="/home" 
                className="text-white hover:text-blue-300 font-bold"
            >
                AI 재무설계사
            </Link>
            <Link 
                href="/home" 
                className="text-white hover:text-blue-300 font-bold"
            >
                AI 맞춤 시황 브리핑
            </Link>
            <Link 
                href="/home" 
                className="text-white hover:text-blue-300 font-bold"
            >
                목표 도달 시뮬레이션
            </Link>
            <Link 
                href="/home" 
                className="text-white hover:text-blue-300 font-bold"
            >
                마이페이지
            </Link>
            <input
                className="bg-white rounded-md px-4 py-1"
                placeholder="검색"
                
            >

            </input>
            <button 
                className="text-white font-bold px-3 py-1 rounded-md bg-gray-500 hover:bg-gray-600"
            >
                로그인
            </button>
        </div>
    );
}