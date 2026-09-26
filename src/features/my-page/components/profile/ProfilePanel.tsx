import {
  fundProfileChoices,
  investmentLevelChoices,
  investmentProfileChoices,
} from "../../data";
import type {
  Profile,
  ProfileChoice,
  ProfileChoiceTone,
  ProfileErrors,
  ProfileField,
} from "../../model";

type ProfilePanelProps = {
  profile: Profile;
  draftProfile: Profile;
  isEditing: boolean;
  isSocialAccount: boolean;
  errors: ProfileErrors;
  saveError?: string;
  isSaving?: boolean;
  onDraftChange: (profile: Profile) => void;
  onEdit: () => void;
  onClearError: (field: ProfileField) => void;
  onCancel: () => void;
  onSave: () => void;
  onRequestWithdrawal: () => void;
  onStartSurvey: () => void;
};

const rows: { key: ProfileField; label: string }[] = [
  { key: "userId", label: "아이디" },
  { key: "password", label: "비밀번호" },
  { key: "name", label: "이름" },
  { key: "birthday", label: "생년월일" },
  { key: "email", label: "이메일" },
  { key: "investmentProfile", label: "투자성향" },
  { key: "fundProfile", label: "자금성향" },
  { key: "investmentLevel", label: "투자레벨" },
];

const profileChoiceToneClasses: Record<ProfileChoiceTone, string> = {
  emerald: "border-emerald-500/45 bg-emerald-500/10 text-emerald-500",
  teal: "border-teal-500/45 bg-teal-500/10 text-teal-500",
  blue: "border-blue-500/45 bg-blue-500/10 text-blue-500",
  amber: "border-amber-500/45 bg-amber-500/10 text-amber-500",
  orange: "border-orange-500/45 bg-orange-500/10 text-orange-500",
};

const choicesByKey: Partial<Record<ProfileField, ProfileChoice[]>> = {
  investmentProfile: investmentProfileChoices,
  fundProfile: fundProfileChoices,
  investmentLevel: investmentLevelChoices,
};

export default function ProfilePanel({
  profile,
  draftProfile,
  isEditing,
  isSocialAccount,
  errors,
  saveError,
  isSaving = false,
  onDraftChange,
  onEdit,
  onClearError,
  onCancel,
  onSave,
  onRequestWithdrawal,
  onStartSurvey,
}: ProfilePanelProps) {
  const accountRows = isSocialAccount ? rows.slice(2, 5) : rows.slice(0, 5);
  const investmentRows = rows.slice(5);

  const renderRows = (items: typeof rows, editable = isEditing) => (
    <dl className="divide-y divide-gray-200">
      {items.map((row) => {
        const selectedChoice = choicesByKey[row.key]?.find((choice) => choice.value === profile[row.key]);
        const isChanged =
          row.key === "password"
            ? Boolean(draftProfile.password) && draftProfile.password !== profile.password
            : draftProfile[row.key] !== profile[row.key];
        const error = errors[row.key];

        return (
          <div key={row.key} className="grid min-h-12 grid-cols-[100px_minmax(0,1fr)] items-center gap-3 py-2 sm:grid-cols-[110px_minmax(0,1fr)]">
            <dt className="text-xs font-semibold text-muted sm:text-sm">{row.label}</dt>
            <dd className="min-w-0">
              {editable ? (
                <input
                  aria-label={row.label}
                  type={row.key === "password" ? "password" : row.key === "birthday" ? "date" : row.key === "email" ? "email" : "text"}
                  readOnly={row.key === "userId"}
                  autoComplete={row.key === "password" ? "new-password" : row.key === "email" ? "email" : row.key === "name" ? "name" : undefined}
                  placeholder={row.key === "password" ? "변경할 비밀번호 입력" : undefined}
                  value={draftProfile[row.key]}
                  onChange={(event) => {
                    onDraftChange({ ...draftProfile, [row.key]: event.target.value });
                    onClearError(row.key);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `profile-${row.key}-error` : undefined}
                  className={`w-full rounded-md border px-3 py-2 text-sm font-semibold outline-none transition-colors focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)] ${error ? "border-red-500 bg-red-500/5" : isChanged ? "border-amber-400 bg-amber-50" : "border-hairline bg-surface-soft"}`}
                />
              ) : selectedChoice ? (
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-sm font-bold ${profileChoiceToneClasses[selectedChoice.tone]}`}>{profile[row.key]}</span>
              ) : (
                <span className="block break-words text-sm font-bold text-ink sm:text-base">
                  {row.key === "password"
                    ? "**********"
                    : row.key === "birthday"
                      ? profile[row.key].replaceAll("-", ".")
                      : profile[row.key] || "미설정"}
                </span>
              )}
              {editable && error && <p id={`profile-${row.key}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3"><h1 className="text-xl font-bold">내 정보</h1>{isSocialAccount && <span className="rounded-full border border-hairline px-2.5 py-1 text-xs font-semibold text-muted">소셜 로그인 계정</span>}</div>
        <div className="flex gap-2">
          {isEditing && <button type="button" onClick={onCancel} className="rounded-lg border border-hairline px-3.5 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>}
          <button type="button" onClick={isEditing ? onSave : onEdit} disabled={isSaving} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "저장 중..." : isEditing ? "완료" : "정보 수정"}</button>
        </div>
      </div>
      {saveError ? <p role="alert" className="mb-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">{saveError}</p> : null}

      <div className={isEditing ? "space-y-4" : "cq-profile-layout grid gap-4"}>
        <section className="rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
          <div className="mb-2"><h2 className="font-bold">기본 정보</h2></div>
          {renderRows(accountRows)}
        </section>

        <section className="rounded-lg border border-hairline p-4 sm:p-5">
          <div className="mb-2"><h2 className="font-bold">투자 프로필</h2></div>
          {renderRows(investmentRows, false)}
          <p className="mt-4 text-xs leading-5 text-muted">투자 성향, 자금 성향, 투자 레벨은 설문 결과로 자동 결정됩니다.</p>
          <button type="button" onClick={onStartSurvey} disabled={isSaving} className="theme-accent-bg mt-3 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-60">{profile.investmentProfile ? "투자 성향 설문 다시 하기" : "투자 성향 설문 시작하기"}</button>
        </section>
      </div>

      <section className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:px-5">
        <div><h2 className="text-sm font-bold text-red-500">회원 탈퇴</h2><p className="mt-1 text-xs leading-5 text-muted">계정과 저장된 투자 데이터를 삭제합니다.</p></div>
        <button type="button" onClick={onRequestWithdrawal} className="shrink-0 rounded-lg border border-red-500/30 px-3.5 py-2 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white">AI STOCK 탈퇴하기</button>
      </section>
    </div>
  );
}

