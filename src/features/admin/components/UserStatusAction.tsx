"use client";
import { useRef, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";

type User = { userId: number; loginId: string; name: string; status: string; suspensionReason?: string | null; suspendedUntil?: string | null };
export default function UserStatusAction({ user, onChanged }: { user: User; onChanged: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [category, setCategory] = useState("");
    const [reason, setReason] = useState("");
    const [duration, setDuration] = useState("7");
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const suspended = user.status === "SUSPENDED";
    const action = suspended ? "정지 해제" : "계정 정지";
    const period = duration === "0" ? "무기한" : `${duration}일`;
    function open() { setCategory(""); setReason(""); setDuration("7"); setConfirming(false); setError(""); dialog.current?.showModal(); }
    async function save() {
        if (busy) return;
        setBusy(true); setError("");
        try {
            await apiRequest(`/api/admin/users/${user.userId}/status`, { method: "PATCH", body: JSON.stringify({
                status: suspended ? "ACTIVE" : "SUSPENDED", reason: `${category}: ${reason.trim()}`,
                durationDays: suspended || duration === "0" ? null : Number(duration),
            }) });
            dialog.current?.close(); onChanged();
        } catch (cause) { setError(getApiErrorMessage(cause, "상태 변경에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="ao-status-action">
        {suspended && <div className="ao-suspension-info"><strong>계정 이용이 정지되어 있습니다.</strong><p>사유: {user.suspensionReason || "기존 정지 내역에 사유가 등록되지 않았습니다."}</p><p>종료: {user.suspendedUntil ? `${user.suspendedUntil.replace("T", " ").slice(0, 16)} (한국 시간)` : "무기한 · 관리자 해제 필요"}</p></div>}
        <button className={suspended ? "ao-status-restore" : "ao-status-danger"} onClick={open}>{action}</button>
        <dialog ref={dialog} className="ao-status-dialog" onCancel={event => { if (busy) event.preventDefault(); }}>
            <form onSubmit={event => { event.preventDefault(); if (!category || !reason.trim()) { setError("사유 유형과 상세 사유를 입력해 주세요."); return; } if (confirming) void save(); else { setError(""); setConfirming(true); } }}>
                <span className="ao-eyebrow">ACCOUNT STATUS</span><h2>{confirming ? `${action} 내용을 확인해 주세요` : `${action} 설정`}</h2>
                <div className="ao-status-target"><strong>{user.name}</strong><span>{user.loginId} · 회원 #{user.userId}</span></div>
                {!confirming ? <>
                    <label>사유 유형 <select required value={category} onChange={event => setCategory(event.target.value)}><option value="">선택해 주세요</option>{(suspended ? ["이의 신청 수용", "정지 사유 해소", "오처리 정정", "기타"] : ["서비스 운영 정책 위반", "비정상적인 서비스 이용", "계정 도용 의심", "부적절한 콘텐츠", "기타"]).map(item => <option key={item}>{item}</option>)}</select></label>
                    <label>상세 사유 <textarea required maxLength={400} rows={4} value={reason} onChange={event => setReason(event.target.value)} placeholder="확인된 사실과 처리 근거를 구체적으로 입력해 주세요." /></label><small>{reason.length}/400자 · 관리자 감사 기록에 저장됩니다.</small>
                    {!suspended && <label>정지 기간 <select value={duration} onChange={event => setDuration(event.target.value)}>{[1, 3, 7, 30, 90].map(days => <option key={days} value={days}>{days}일</option>)}<option value="0">무기한</option></select></label>}
                </> : <div className="ao-status-summary"><p><b>변경</b>{action}</p>{!suspended && <p><b>기간</b>{period} · 확정 시점부터 적용</p>}<p><b>사유</b>{category}</p><blockquote>{reason}</blockquote></div>}
                <p className="ao-status-help">{suspended ? "정지를 해제하면 사용자가 다시 로그인할 수 있습니다." : duration === "0" ? "로그인이 차단되며, 관리자가 직접 해제할 때까지 정지가 유지됩니다." : "로그인이 차단되며, 설정한 기간이 끝나면 자동으로 해제됩니다."}</p>
                {error && <p role="alert" className="ao-error">{error}</p>}
                <div className="ao-status-buttons"><button type="button" disabled={busy} onClick={() => confirming ? setConfirming(false) : dialog.current?.close()}>{confirming ? "이전" : "취소"}</button><button type="submit" disabled={busy || !category || !reason.trim()} className={suspended ? "ao-status-restore" : "ao-status-danger"}>{busy ? "처리 중…" : confirming ? `${action} 확정` : "다음: 내용 확인"}</button></div>
            </form>
        </dialog>
    </div>;
}
