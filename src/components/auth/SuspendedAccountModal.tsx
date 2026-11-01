"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/common/Button";

type SuspendedAccountModalProps = {
    message?: string;
    onClose: () => void;
};

// 백엔드 메시지에 실제 줄바꿈이 없어 "정지사유" 앞부분과 한 줄로 이어 붙어 오므로, 화면에서는 그 앞에 강제로 줄을 바꿔 보여준다.
function formatSuspendedMessage(message?: string) {
    if (!message) return "관리자에 의해 정지된 계정입니다.\n계정 상태는 관리자에게 문의해 주세요.";
    const index = message.indexOf("정지사유");
    if (index <= 0) return message;
    return <>{message.slice(0, index).trim()}<br />{message.slice(index)}</>;
}

export default function SuspendedAccountModal({ message, onClose }: SuspendedAccountModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();

        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={event => {
                event.preventDefault();
                onClose();
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-hairline bg-white p-6 text-center text-ink shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        >
            <h2 id={titleId} className="text-xl font-bold">계정 이용이 정지되었습니다</h2>
            <p id={descriptionId} className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-body">
                {formatSuspendedMessage(message)}
            </p>
            <Button fullWidth onClick={onClose} className="mt-6">로그인 화면으로 돌아가기</Button>
        </dialog>
    );
}
