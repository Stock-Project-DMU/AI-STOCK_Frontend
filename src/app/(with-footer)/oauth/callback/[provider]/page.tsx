"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { finishOAuth, type OAuthProvider } from "@/lib/api/oauth";
import { getLoginDestination } from "@/lib/api/auth-navigation";

export default function OAuthCallbackPage() {
    const started = useRef(false);
    const [error, setError] = useState("");
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const url = new URL(window.location.href);
        const provider = url.pathname.split("/").pop()?.toUpperCase() as OAuthProvider;
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        // 브라우저 히스토리에 일회용 인증 코드를 남기지 않습니다.
        window.history.replaceState(null, "", url.pathname);
        if (!["GOOGLE", "NAVER", "KAKAO"].includes(provider) || !code || !state || url.searchParams.has("error")) {
            void Promise.resolve().then(() => setError("소셜 로그인이 취소되었거나 인증 정보를 받지 못했습니다."));
            return;
        }
        finishOAuth(provider, code, state).then(getLoginDestination).then(destination => window.location.replace(destination))
            .catch(cause => setError(cause instanceof Error ? cause.message : "소셜 로그인에 실패했습니다."));
    }, []);
    return <main className="mx-auto max-w-xl p-10"><h1 className="text-xl font-bold">소셜 로그인</h1><p role={error ? "alert" : "status"} className="my-5">{error || "인증 결과를 확인하고 있습니다…"}</p>{error && <Link href="/login" className="text-primary">로그인 화면으로 돌아가기</Link>}</main>;
}
