import { getAccessToken } from "./client";
import type { HogaResponse, StockPriceResponse } from "./types";

// Spring STOMP 텍스트 프레임을 처리한다. 화면 종료 시 구독과 재접속 타이머를 함께 정리한다.
export function subscribeStock(code: string, onPrice: (price: StockPriceResponse) => void, onHoga: (hoga: HogaResponse) => void, onStatus: (status: string) => void) {
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    function connect() {
        if (stopped || !getAccessToken()) return;
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
        socket = new WebSocket(base.replace(/^http/, "ws") + "/ws-stomp", ["v12.stomp"]);
        let buffer = "";
        socket.onopen = () => socket?.send("CONNECT\naccept-version:1.2\nhost:localhost\nheart-beat:0,0\nAuthorization:Bearer " + getAccessToken() + "\n\n\0");
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
                    socket?.send(`SUBSCRIBE\nid:price\ndestination:/topic/stock/${code}\nack:auto\n\n\0`);
                    socket?.send(`SUBSCRIBE\nid:hoga\ndestination:/topic/stock/${code}/hoga\nack:auto\n\n\0`);
                } else if (headers[0] === "MESSAGE") {
                    try {
                        const payload: unknown = JSON.parse(frame.slice(separator + 2));
                        if (headers.includes("subscription:price")) onPrice(payload as StockPriceResponse);
                        else if (headers.includes("subscription:hoga")) onHoga(payload as HogaResponse);
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
