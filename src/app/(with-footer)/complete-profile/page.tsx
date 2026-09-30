"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { needsSocialProfileCompletion } from "@/lib/api/auth-navigation";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { getMyInfo, updateMyInfo } from "@/lib/api/user";
import { validateProfileBasics } from "@/features/my-page/validation";
import type { ProfileErrors } from "@/features/my-page/model";

type BasicProfile = { name: string; birthday: string; email: string };
type BirthdayParts = { year: string; month: string; day: string };

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));
const birthMonths = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

type BirthdayDropdownProps = {
  label: string;
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  invalid: boolean;
  errorId: string;
};

function BirthdayDropdown({ label, placeholder, value, options, onChange, invalid, errorId }: BirthdayDropdownProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function focusOption(index: number) {
    const option = optionRefs.current[index];
    option?.focus();
    option?.scrollIntoView({ block: "nearest" });
  }

  function toggle() {
    setOpen((current) => !current);
    if (!open) requestAnimationFrame(() => focusOption(Math.max(selectedIndex, 0)));
  }

  function select(value: string) {
    onChange(value);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (!open) {
      setOpen(true);
      requestAnimationFrame(() => focusOption(Math.max(selectedIndex, 0)));
      return;
    }
    const focusedIndex = optionRefs.current.findIndex((option) => option === document.activeElement);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? Math.min(focusedIndex + 1, options.length - 1)
      : Math.max(focusedIndex - 1, 0);
    focusOption(nextIndex);
  }

  return (
    <div ref={rootRef} className="relative mt-2 min-w-0" onKeyDown={handleKeyDown}>
      <button ref={triggerRef} type="button" aria-label={`${label}: ${options[selectedIndex]?.label ?? placeholder}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-describedby={invalid ? errorId : undefined} onClick={toggle} className={`flex w-full min-w-0 items-center justify-between gap-1 rounded-xl border bg-white px-3 py-3 text-left text-sm font-semibold shadow-[0_2px_8px_rgba(10,11,13,0.04)] transition-colors hover:border-[var(--market-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--market-accent-soft)] ${open ? "border-[var(--market-accent)] ring-2 ring-[var(--market-accent-soft)]" : invalid ? "border-red-500" : "border-hairline"} ${value ? "text-ink" : "text-muted"}`}>
        <span className="truncate">{options[selectedIndex]?.label ?? placeholder}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div id={listId} role="listbox" aria-label={label} className="absolute inset-x-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-hairline bg-white p-1.5 shadow-[0_14px_36px_rgba(10,11,13,0.14)]">
          {options.map((option, index) => (
            <button key={option.value} ref={(element) => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={option.value === value} onClick={() => select(option.value)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--market-accent-soft)] ${option.value === value ? "theme-accent-soft theme-accent-text font-bold" : "text-body hover:bg-surface-soft hover:text-ink"}`}>
              <span>{option.label}</span>
              {option.value === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [profile, setProfile] = useState<BasicProfile>({ name: "", birthday: "", email: "" });
  const [birthdayParts, setBirthdayParts] = useState<BirthdayParts>({ year: "", month: "", day: "" });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [requestError, setRequestError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    getMyInfo().then((user) => {
      if (cancelled) return;
      if (user.loginId !== null) {
        router.replace(user.role === "ADMIN" ? "/admin" : "/home");
        return;
      }
      if (!needsSocialProfileCompletion(user)) {
        router.replace("/my-page");
        return;
      }
      setProfile({
        name: user.name === "회원" ? "" : user.name,
        birthday: user.birthdate ?? "",
        email: user.email ?? "",
      });
      const [year = "", month = "", day = ""] = (user.birthdate ?? "").split("-");
      setBirthdayParts({ year, month, day });
      setStatus("ready");
    }).catch((error) => {
      if (cancelled) return;
      setRequestError(getApiErrorMessage(error, "회원 정보를 불러오지 못했습니다."));
      setStatus("error");
    });
    return () => { cancelled = true; };
  }, [router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validateProfileBasics(profile);
    if (profile.name.trim() === "회원") nextErrors.name = "사용할 이름을 입력해 주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setRequestError("");
    try {
      await updateMyInfo(profile.name.trim(), profile.email.trim(), profile.birthday);
      router.replace("/my-page?survey=1");
    } catch (error) {
      setRequestError(getApiErrorMessage(error, "정보를 저장하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  }

  function change(field: keyof BasicProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError("");
  }

  function changeBirthday(part: keyof BirthdayParts, value: string) {
    const next = { ...birthdayParts, [part]: value };
    if (next.year && next.month && Number(next.day) > new Date(Number(next.year), Number(next.month), 0).getDate()) {
      next.day = "";
    }
    setBirthdayParts(next);
    change("birthday", next.year && next.month && next.day ? `${next.year}-${next.month}-${next.day}` : "");
  }

  const daysInMonth = birthdayParts.year && birthdayParts.month
    ? new Date(Number(birthdayParts.year), Number(birthdayParts.month), 0).getDate()
    : 31;

  return (
    <main className="market-theme auth-shell flex min-h-[calc(100vh-4rem)] items-center px-4 py-10 sm:px-6">
      <section className="auth-card mx-auto w-full max-w-xl rounded-3xl p-7 sm:p-10">
        <p className="theme-accent-text text-xs font-bold">소셜 로그인</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">기본 정보를 입력해 주세요</h1>
        <p className="mt-3 text-sm leading-6 text-muted">마이페이지에서 사용할 이름, 생년월일, 이메일을 확인해 주세요.</p>

        {status === "loading" && <p role="status" className="mt-8 text-sm text-muted">회원 정보를 확인하고 있습니다…</p>}
        {status === "error" && (
          <div className="mt-8 space-y-4">
            <p role="alert" className="text-sm font-semibold text-red-500">{requestError}</p>
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-hairline px-4 py-2 text-sm font-bold">다시 시도</button>
          </div>
        )}
        {status === "ready" && (
          <form onSubmit={saveProfile} noValidate className="mt-8 space-y-5">
            <label className="block text-sm font-bold text-ink" htmlFor="complete-profile-name">이름
              <input id="complete-profile-name" type="text" autoComplete="name" maxLength={50} value={profile.name} onChange={(event) => change("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "complete-profile-name-error" : undefined} className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" />
            </label>
            {errors.name && <p id="complete-profile-name-error" role="alert" className="-mt-3 text-xs text-red-500">{errors.name}</p>}
            <fieldset>
              <legend className="text-sm font-bold text-ink">생년월일</legend>
              <div className="grid grid-cols-3 gap-2">
                <BirthdayDropdown label="태어난 연도" placeholder="연도 선택" value={birthdayParts.year} options={birthYears.map((year) => ({ value: year, label: `${year}년` }))} onChange={(value) => changeBirthday("year", value)} invalid={Boolean(errors.birthday)} errorId="complete-profile-birthday-error" />
                <BirthdayDropdown label="태어난 월" placeholder="월 선택" value={birthdayParts.month} options={birthMonths.map((month) => ({ value: month, label: `${Number(month)}월` }))} onChange={(value) => changeBirthday("month", value)} invalid={Boolean(errors.birthday)} errorId="complete-profile-birthday-error" />
                <BirthdayDropdown label="태어난 일" placeholder="일 선택" value={birthdayParts.day} options={Array.from({ length: daysInMonth }, (_, index) => ({ value: String(index + 1).padStart(2, "0"), label: `${index + 1}일` }))} onChange={(value) => changeBirthday("day", value)} invalid={Boolean(errors.birthday)} errorId="complete-profile-birthday-error" />
              </div>
            </fieldset>
            {errors.birthday && <p id="complete-profile-birthday-error" role="alert" className="-mt-3 text-xs text-red-500">{errors.birthday}</p>}
            <label className="block text-sm font-bold text-ink" htmlFor="complete-profile-email">이메일
              <input id="complete-profile-email" type="email" autoComplete="email" maxLength={100} value={profile.email} onChange={(event) => change("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "complete-profile-email-error" : undefined} className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" />
            </label>
            {errors.email && <p id="complete-profile-email-error" role="alert" className="-mt-3 text-xs text-red-500">{errors.email}</p>}
            {requestError && <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">{requestError}</p>}
            <button type="submit" disabled={saving} className="theme-accent-bg w-full rounded-xl px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60">{saving ? "저장 중..." : "저장하고 마이페이지로 이동"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
