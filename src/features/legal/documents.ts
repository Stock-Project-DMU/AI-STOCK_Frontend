import { TERMS_AND_CONDITIONS } from "@/features/signup/constants/terms";

export type LegalSection = { title: string; paragraphs: string[] };
export type LegalDocument = {
    title: string;
    sourceTitle: string;
    sections: LegalSection[];
};

// Verified against Figma qApadZJQ5cA1a8KC45ot42, nodes
// 662:4715 (service), 669:4719 (privacy), 669:4721 (risk), 669:4720 (AI/API).
// Reuse signup text so signup and footer documents keep the same wording.
function getTerm(id: string) {
    const term = TERMS_AND_CONDITIONS.find((item) => item.id === id);
    if (!term) throw new Error(`Missing legal document: ${id}`);
    return term;
}

function getSections(id: string): LegalSection[] {
    const sections: LegalSection[] = [];
    for (const line of getTerm(id).content.split(/\r?\n/)) {
        if (/^제\d+조\s*\(|^\d+\. 개인정보|^6\. 회원의 권리|^부칙$/.test(line)) {
            sections.push({ title: line, paragraphs: [] });
        } else if (line.trim()) {
            sections.at(-1)?.paragraphs.push(line);
        }
    }
    return sections;
}

const serviceSections = getSections("service");
const privacySections = getSections("privacy");

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
    privacy: {
        title: "개인정보 처리 방침",
        sourceTitle: getTerm("privacy").title,
        sections: privacySections,
    },
    service: {
        title: "서비스 이용 약관",
        sourceTitle: getTerm("service").title,
        sections: serviceSections,
    },
    investment: {
        title: "투자 유의사항",
        sourceTitle: getTerm("investment-risk").title,
        sections: getSections("investment-risk"),
    },
    rights: {
        title: "이용자 권리 및 유의사항",
        sourceTitle: "회원의 권리·의무 및 AI 재무설계·증권 API 데이터 연동 안내",
        sections: [
            privacySections[5],
            serviceSections[6],
            serviceSections[10],
            { title: getTerm("ai-api").title, paragraphs: [] },
            ...getSections("ai-api"),
        ],
    },
};

// Figma represents these tables as continuous text. The cells below preserve
// its wording and order while restoring the column structure for the web.
export const LEGAL_TABLES = [
    {
        prefix: "구분수집 항목수집 목적",
        headers: ["구분", "수집 항목", "수집 목적"],
        rows: [
            ["필수", "이메일(ID), 비밀번호, 닉네임", "회원 식별, 서비스 이용, 고객 상담"],
            ["필수", "투자 성향 설문 결과", "맞춤형 AI 재무설계 리포트 생성"],
            ["자동 수집", "서비스 이용 기록 (매매 내역, 접속 로그, 접속 IP, 쿠키, 기기 정보)", "서비스 개선, 부정 이용 방지, 통계 분석"],
            ["자동 수집", "포트폴리오 구성 데이터, 수익률 기록", "랭킹 산정, AI 분석 서비스 제공"],
        ],
    },
    {
        prefix: "보유 사유보유 기간관련 법령",
        headers: ["보유 사유", "보유 기간", "관련 법령"],
        rows: [
            ["부정 이용 방지", "탈퇴 후 6개월", "내부 정책"],
            ["계약 또는 청약철회 등에 관한 기록", "5년", "전자상거래법"],
            ["대금결제 및 재화 등의 공급에 관한 기록", "5년", "전자상거래법"],
            ["소비자 불만 또는 분쟁 처리에 관한 기록", "3년", "전자상거래법"],
            ["표시·광고에 관한 기록", "6개월", "전자상거래법"],
            ["서비스 방문 기록", "3개월", "통신비밀보호법"],
        ],
    },
    {
        prefix: "데이터 항목활용 목적",
        headers: ["데이터 항목", "활용 목적"],
        rows: [
            ["매매 내역 (매수/매도 종목, 수량, 가격, 시점)", "투자 패턴 분석, 포트폴리오 진단"],
            ["보유 종목 및 비중", "자산 배분 분석, 리밸런싱 제안"],
            ["수익률 추이", "성과 평가, 리스크 분석"],
            ["투자 성향 설문 결과", "맞춤형 투자 전략 수립"],
            ["서비스 이용 패턴 (접속 빈도, 관심 종목 등)", "개인화된 정보 추천"],
        ],
    },
];
