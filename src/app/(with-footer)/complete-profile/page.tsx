"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { needsSocialProfileCompletion } from "@/lib/api/auth-navigation";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { getMyInfo, updateMyInfo } from "@/lib/api/user";
import { validateProfileBasics } from "@/features/my-page/validation";
import type { ProfileErrors } from "@/features/my-page/model";

type BasicProfile = { name: string; birthday: string; email: string };

export default function CompleteProfilePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [profile, setProfile] = useState<BasicProfile>({ name: "", birthday: "", email: "" });
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
            <label className="block text-sm font-bold text-ink" htmlFor="complete-profile-birthday">생년월일
              <input id="complete-profile-birthday" type="date" autoComplete="bday" value={profile.birthday} onChange={(event) => change("birthday", event.target.value)} aria-invalid={Boolean(errors.birthday)} aria-describedby={errors.birthday ? "complete-profile-birthday-error" : undefined} className="mt-2 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm outline-none focus:border-[var(--market-accent)] focus:ring-2 focus:ring-[var(--market-accent-soft)]" />
            </label>
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
