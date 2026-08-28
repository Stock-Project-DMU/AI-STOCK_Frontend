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
  errors: ProfileErrors;
  saveError?: string;
  isSaving?: boolean;
  onDraftChange: (profile: Profile) => void;
  onEdit: () => void;
  onClearError: (field: ProfileField) => void;
  onCancel: () => void;
  onSave: () => void;
  onRequestWithdrawal: () => void;
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

const profileChoiceSelectedClasses: Record<ProfileChoiceTone, string> = {
  emerald: "ring-2 ring-emerald-500",
  teal: "ring-2 ring-teal-500",
  blue: "ring-2 ring-blue-500",
  amber: "ring-2 ring-amber-500",
  orange: "ring-2 ring-orange-500",
};

const profileChoiceCheckClasses: Record<ProfileChoiceTone, string> = {
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
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
  errors,
  saveError,
  isSaving = false,
  onDraftChange,
  onEdit,
  onClearError,
  onCancel,
  onSave,
  onRequestWithdrawal,
}: ProfilePanelProps) {
  const accountRows = rows.slice(0, 5);
  const investmentRows = rows.slice(5);

  const renderRows = (items: typeof rows) => (
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
              {isEditing ? (
                <input
                  aria-label={row.label}
                  type={row.key === "birthday" ? "date" : row.key === "email" ? "email" : "text"}
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
                      : profile[row.key]}
                </span>
              )}
              {isEditing && error && <p id={`profile-${row.key}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-bold">내 정보</h1>
        <div className="flex gap-2">
          {isEditing && <button type="button" onClick={onCancel} className="rounded-lg border border-hairline px-3.5 py-2 text-sm font-bold hover:bg-surface-soft">취소</button>}
          <button type="button" onClick={isEditing ? onSave : onEdit} disabled={isSaving} className="theme-accent-bg rounded-lg px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "저장 중..." : isEditing ? "완료" : "정보 수정"}</button>
        </div>
      </div>
      {saveError ? <p role="alert" className="mb-3 rounded-lg bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">{saveError}</p> : null}

      <div className={isEditing ? "space-y-4" : "grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]"}>
        <section className="rounded-lg border border-hairline bg-surface-soft p-4 sm:p-5">
          <div className="mb-2"><h2 className="font-bold">기본 정보</h2></div>
          {renderRows(accountRows)}
        </section>

        <section className="rounded-lg border border-hairline p-4 sm:p-5">
          <div className="mb-2"><h2 className="font-bold">투자 프로필</h2></div>
          {isEditing ? (
            <div className="mt-5 space-y-6">
              <ProfileChoiceGroup label="투자 성향" helper="감당할 수 있는 위험 수준을 선택해 주세요." options={investmentProfileChoices} selected={draftProfile.investmentProfile} columns={5} scaleLabels={["낮은 위험", "높은 위험"]} onSelect={(value) => onDraftChange({ ...draftProfile, investmentProfile: value })} />
              <ProfileChoiceGroup label="자금 성향" helper="투자 자금의 목적과 운용 방식을 선택해 주세요." options={fundProfileChoices} selected={draftProfile.fundProfile} columns={4} scaleLabels={["저축·보존", "수익·유동성"]} onSelect={(value) => onDraftChange({ ...draftProfile, fundProfile: value })} />
              <ProfileChoiceGroup label="투자 경험 레벨" helper="현재 투자 경험에 가장 가까운 단계를 선택해 주세요." options={investmentLevelChoices} selected={draftProfile.investmentLevel} columns={3} onSelect={(value) => onDraftChange({ ...draftProfile, investmentLevel: value })} />
            </div>
          ) : (
            <>
              {renderRows(investmentRows)}
              <div className="theme-accent-soft mt-4 rounded-lg px-3.5 py-2.5"><p className="theme-accent-text text-pretty text-xs font-semibold leading-5">현재 선택한 성향을 기반으로 맞춤 분석이 제공되고 있습니다.</p></div>
            </>
          )}
        </section>
      </div>

      <section className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:px-5">
        <div><h2 className="text-sm font-bold text-red-500">회원 탈퇴</h2><p className="mt-1 text-xs leading-5 text-muted">계정과 저장된 투자 데이터를 삭제합니다.</p></div>
        <button type="button" onClick={onRequestWithdrawal} className="shrink-0 rounded-lg border border-red-500/30 px-3.5 py-2 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white">AI STOCK 탈퇴하기</button>
      </section>
    </div>
  );
}

type ProfileChoiceGroupProps = {
  label: string;
  helper: string;
  options: ProfileChoice[];
  selected: string;
  columns: 3 | 4 | 5;
  scaleLabels?: [string, string];
  onSelect: (value: string) => void;
};

function ProfileChoiceGroup({ label, helper, options, selected, columns, scaleLabels, onSelect }: ProfileChoiceGroupProps) {
  const columnClass = columns === 5 ? "sm:grid-cols-2 lg:grid-cols-5" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";

  return (
    <fieldset>
      <legend className="text-sm font-bold sm:text-base">{label}</legend>
      <p className="mt-1 text-xs text-muted">{helper}</p>
      <div role="radiogroup" aria-label={label} className={`mt-3 grid gap-2.5 ${columnClass}`}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button key={option.value} type="button" role="radio" aria-checked={isSelected} onClick={() => onSelect(option.value)} className={`relative min-h-24 rounded-lg border px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:brightness-110 ${profileChoiceToneClasses[option.tone]} ${isSelected ? `${profileChoiceSelectedClasses[option.tone]} ring-offset-2 ring-offset-[var(--market-panel)] shadow-[0_2px_4px_rgba(0,0,0,.16)]` : "opacity-75 hover:opacity-100"}`}>
              {isSelected && <span aria-hidden="true" className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${profileChoiceCheckClasses[option.tone]}`}>✓</span>}
              <strong className="block text-sm sm:text-base">{option.value}</strong>
              <span className="mt-2 block whitespace-pre-line text-xs font-semibold leading-5 opacity-80 sm:text-xs">{option.description}</span>
            </button>
          );
        })}
      </div>
      {scaleLabels && <div aria-hidden="true" className="mt-4 flex items-center gap-3 text-xs font-semibold text-muted"><span className="shrink-0">{scaleLabels[0]}</span><span className="h-px flex-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500" /><span className="shrink-0">{scaleLabels[1]}</span></div>}
    </fieldset>
  );
}
