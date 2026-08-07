import type { MyPageTab, Order, Profile, ProfileChoice, RechargeRecord } from "./model";

export const navItems: { id: MyPageTab; label: string; description: string }[] = [
  { id: "profile", label: "내 정보", description: "회원 정보 및 투자 성향" },
  { id: "account", label: "계좌관리", description: "가상계좌와 충전 내역" },
  { id: "orders", label: "주문내역", description: "완료된 주문 확인" },
  { id: "returns", label: "수익률", description: "실현수익과 종목 분석" },
];

export const initialProfile: Profile = {
  userId: "jin050183",
  password: "**********",
  name: "김진우",
  birthday: "2000-05-01",
  email: "jin0501833@naver.com",
  investmentProfile: "적극투자형",
  fundProfile: "수익추구형",
  investmentLevel: "숙련 투자자",
};

export const investmentProfileChoices: ProfileChoice[] = [
  { value: "안정형", description: "원금 보존 최우선\n예금·채권 위주", tone: "emerald" },
  { value: "안정추구형", description: "손실 최소화 우선\n채권·배당주 중심", tone: "teal" },
  { value: "위험중립형", description: "수익·위험 균형\n혼합 포트폴리오", tone: "blue" },
  { value: "적극투자형", description: "일정 손실 감수\n성장주·ETF 위주", tone: "amber" },
  { value: "공격투자형", description: "최대 수익 추구\n레버리지·테마주", tone: "orange" },
];

export const fundProfileChoices: ProfileChoice[] = [
  { value: "안정저축형", description: "목돈 모으기 목적\n적금·CMA 위주", tone: "emerald" },
  { value: "수익추구형", description: "투자 수익 목적\n주식·펀드 중심", tone: "blue" },
  { value: "목표달성형", description: "내 집 마련·은퇴\n구체적 목표 설정", tone: "amber" },
  { value: "자유소비형", description: "여유 자금 운용\n유동성 중시", tone: "orange" },
];

export const investmentLevelChoices: ProfileChoice[] = [
  { value: "입문자", description: "주식 계좌가 없거나\n투자 경험 1년 미만\n용어가 낯선 단계", tone: "emerald" },
  { value: "일반 투자자", description: "투자 경험 1~3년\n기본 종목 거래 경험\nETF·펀드 알고 있음", tone: "blue" },
  { value: "숙련 투자자", description: "투자 경험 3년 이상\n재무제표·차트 분석\n파생·레버리지 경험", tone: "amber" },
];

export const rechargeAmounts = [
  10_000_000,
  30_000_000,
  50_000_000,
  80_000_000,
  100_000_000,
  200_000_000,
  500_000_000,
  1_000_000_000,
];

export const rechargeHistory: RechargeRecord[] = [
  { id: 1, date: "2023.10.27 14:35", type: "추가 충전", amount: 100_000_000, balance: 200_000_000, status: "승인", requester: "김철수", note: "학습 목적 정당 요청. 거래 패턴 정상, 수익률 양호. 승인 처리." },
  { id: 2, date: "2023.10.27 14:35", type: "추가 충전", amount: 100_000_000, balance: 100_000_000, status: "거절", requester: "박지성", note: "누적 지급액 한도 초과 (₩200,000,000). 계정 정지 이력 존재." },
  { id: 3, date: "2023.10.27 14:35", type: "추가 충전", amount: 500_000_000, balance: 100_000_000, status: "거절", requester: "김진우", note: "누적 지급액 한도를 확인해 주세요." },
  { id: 4, date: "2023.10.27 14:35", type: "초기 지급", amount: 100_000_000, balance: 100_000_000, status: "승인", requester: "김진우", note: "초기 가상캐시 지급 완료." },
];

export const orders: Order[] = [
  { id: 1, name: "삼성전자", side: "판매완료", quantity: "100주", price: "1,000,000원" },
  { id: 2, name: "삼성전자", side: "구매완료", quantity: "100주", price: "1,000,000원" },
  { id: 3, name: "SK하이닉스", side: "판매완료", quantity: "100주", price: "1,000,000원" },
  { id: 4, name: "SK하이닉스", side: "구매완료", quantity: "100주", price: "1,000,000원" },
];

export const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
