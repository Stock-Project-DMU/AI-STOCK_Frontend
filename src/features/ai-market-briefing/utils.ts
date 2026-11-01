import type { NewsBriefing, NewsChatSession } from "@/lib/api/ai";

export function belongsToSession(briefing: NewsBriefing, session: NewsChatSession) {
    return briefing.outletDomain === session.outletDomain
        && (briefing.deliveryTime ?? null) === (session.deliveryTime ?? null);
}

// 같은 날짜에 설정(언론사·시각)이 다른 브리핑이 여러 건 있을 수 있어 날짜만으로는 서로 다른 브리핑을 구분할 수 없다.
export function briefingKey(briefing: NewsBriefing) {
    return `${briefing.briefingDate}|${briefing.outletDomain}|${briefing.deliveryTime ?? ""}`;
}

// 저장 목록은 날짜만 기억하므로, 같은 날짜에 브리핑이 여러 건이면 가장 최근에 만들어진 것을 그 날짜의 대표로 삼는다.
export function findLatestByDate(list: NewsBriefing[], date: string) {
    return list.filter(item => item.briefingDate === date).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}
