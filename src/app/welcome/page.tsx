export default function Welcome() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-5">
        <span 
            className="text-4xl font-bold text-white"
        >
            회원가입을 환영합니다
        </span>
        <span 
            className="text-lg font-semibold text-white"
        >
            성공적인 투자 공식을 얻어가세요
        </span>
        <img 
            src="/Logo.png" alt="Logo"
            className="m-5"
            width={400}
            height={400}
        />
        <button 
            className="text-white hover:text-blue-300 font-bold"
        > 
            ◁ 메인으로
        </button>
    </div>
  );
}
