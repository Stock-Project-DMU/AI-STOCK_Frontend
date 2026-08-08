import type { FormEvent } from "react";
import Modal from "../Modal";

type PasswordCheckModalProps = {
  value: string;
  error: string;
  isChecking: boolean;
  onValueChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export function PasswordCheckModal({ value, error, isChecking, onValueChange, onSubmit, onClose }: PasswordCheckModalProps) {
  return (
    <Modal ariaLabel="정보 수정 비밀번호 확인" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <h2 className="text-lg font-extrabold">비밀번호 확인</h2>
        <p className="mt-2 text-sm leading-6 text-muted">회원 정보를 수정하려면 현재 비밀번호를 입력해 주세요.</p>
        <label className="mt-5 block text-left text-sm font-bold" htmlFor="profile-password-check">현재 비밀번호</label>
        <input
          autoFocus
          id="profile-password-check"
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "profile-password-check-error" : undefined}
          className={`mt-2 w-full rounded-lg border px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--market-accent-soft)] ${error ? "border-red-500 focus:border-red-500" : "border-hairline focus:border-[var(--market-accent)]"}`}
        />
        {error && <p id="profile-password-check-error" role="alert" className="mt-2 text-left text-sm font-semibold text-red-500">{error}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={isChecking} className="rounded-lg border border-hairline px-4 py-2.5 text-sm font-bold hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50">취소</button>
          <button type="submit" disabled={isChecking} className="theme-accent-bg rounded-lg px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">{isChecking ? "확인 중..." : "확인"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function ProfileSavedModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal ariaLabel="정보 수정 완료" onClose={onClose}>
      <p className="text-base font-bold">변경되었습니다</p>
      <p className="mt-2 text-sm text-muted">회원 정보가 화면에 반영되었습니다.</p>
      <button type="button" onClick={onClose} className="theme-accent-bg mt-5 rounded-lg px-4 py-2 text-sm font-bold">확인</button>
    </Modal>
  );
}

export function WithdrawalModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal ariaLabel="회원 탈퇴 확인" onClose={onClose}>
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-lg font-black text-red-500">!</div>
      <h2 className="mt-3 text-lg font-extrabold">정말 탈퇴하시겠어요?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">탈퇴하면 저장된 투자 성향, 주문 내역과 수익률 정보를 다시 확인할 수 없습니다.</p>
      <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-left text-xs leading-5 text-red-500">이 작업은 되돌릴 수 없습니다. 계속하기 전에 필요한 정보를 확인해 주세요.</div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>
        <button type="button" onClick={onClose} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600">탈퇴하기</button>
      </div>
    </Modal>
  );
}
