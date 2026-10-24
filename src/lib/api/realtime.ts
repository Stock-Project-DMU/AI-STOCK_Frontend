import { getAccessToken } from "./client";
import type { HogaResponse, StockPriceResponse } from "./types";
import type { MarketIndex, MarketRanking } from "./market";

type StompTopic = { id: string; destination: string; onMessage: (payload: unknown) => void };

// Spring STOMP 텍스트 프레임을 처리하는 공용 연결기. 화면 종료 시 구독과 재접속 타이머를 함께 정리한다.
// 비회원은 Authorization 헤더 없이 연결한다 — 서버는 익명 세션에도 시세·호가·시장 토픽 구독을 허용한다.
function connectStomp(topics: StompTopic[], onStatus: (status: string) => void) {
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    function connect() {
        if (stopped) return;
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
        socket = new WebSocket(base.replace(/^http/, "ws") + "/ws-stomp", ["v12.stomp"]);
        let buffer = "";
        socket.onopen = () => {
            const token = getAccessToken();
            const authorization = token ? `Authorization:Bearer ${token}\n` : "";
            socket?.send(`CONNECT\naccept-version:1.2\nhost:localhost\nheart-beat:0,0\n${authorization}\n\0`);
        };
        socket.onmessage = event => {
            buffer += String(event.data);
            let end: number;
            while ((end = buffer.indexOf("\0")) >= 0) {
                const frame = buffer.slice(0, end).replace(/^\s+/, "").replaceAll("\r\n", "\n");
                buffer = buffer.slice(end + 1);
                const separator = frame.indexOf("\n\n");
                const headers = frame.slice(0, separator).split("\n");
                if (headers[0] === "CONNECTED") {
                    attempts = 0; onStatus("실시간 연결됨");
                    for (const topic of topics) socket?.send(`SUBSCRIBE\nid:${topic.id}\ndestination:${topic.destination}\nack:auto\n\n\0`);
                } else if (headers[0] === "MESSAGE") {
                    try {
                        const payload: unknown = JSON.parse(frame.slice(separator + 2));
                        const topic = topics.find(item => headers.includes(`subscription:${item.id}`));
                        topic?.onMessage(payload);
                    } catch { onStatus("실시간 응답을 확인할 수 없습니다."); }
                } else if (headers[0] === "ERROR") { onStatus("실시간 인증 또는 구독 실패"); socket?.close(); }
            }
        };
        socket.onerror = () => onStatus("실시간 연결을 확인해 주세요.");
        socket.onclose = () => {
            if (stopped) return;
            onStatus("실시간 재연결 중...");
            retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** attempts++));
        };
    }
    connect();
    return () => { stopped = true; clearTimeout(retry); if (socket?.readyState === WebSocket.OPEN) socket.send("DISCONNECT\n\n\0"); socket?.close(); };
}

export function subscribeStock(code: string, onPrice: (price: StockPriceResponse) => void, onHoga: (hoga: HogaResponse) => void, onStatus: (status: string) => void) {
    return connectStomp([
        { id: "price", destination: `/topic/stock/${code}`, onMessage: payload => onPrice(payload as StockPriceResponse) },
        { id: "hoga", destination: `/topic/stock/${code}/hoga`, onMessage: payload => onHoga(payload as HogaResponse) },
    ], onStatus);
}

// 홈 화면 종목 목록 — sort가 바뀌면 호출부에서 기존 구독을 해제하고 새로 구독해야 한다(이전 토픽은 자동 해제되지 않음).
export function subscribeMarketRankings(sort: string, onRankings: (rankings: MarketRanking[]) => void, onStatus: (status: string) => void = () => {}) {
    return connectStomp([
        { id: "rankings", destination: `/topic/market/rankings/${sort}`, onMessage: payload => onRankings(payload as MarketRanking[]) },
    ], onStatus);
}

export function subscribeMarketIndexes(onIndexes: (indexes: MarketIndex[]) => void, onStatus: (status: string) => void = () => {}) {
    return connectStomp([
        { id: "indexes", destination: "/topic/market/indexes", onMessage: payload => onIndexes(payload as MarketIndex[]) },
    ], onStatus);
}
