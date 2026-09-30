"use client";

import { useEffect, useState } from "react";
import { getNewsOutlets, getNewsSetting, saveNewsSetting, type NewsOutlet, type NewsSetting } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";

export default function BriefingSettings({ onSaved }: { onSaved: (setting: NewsSetting) => void }) {
    const [outlets, setOutlets] = useState<NewsOutlet[]>([]);
    const [outlet, setOutlet] = useState("");
    const [deliveryTime, setDeliveryTime] = useState("07:00");
    const [savedSetting, setSavedSetting] = useState<NewsSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        Promise.all([getNewsOutlets(), getNewsSetting()])
            .then(([available, setting]) => {
                if (!active) return;
                setOutlets(available);
                setSavedSetting(setting);
                setOutlet(setting?.outletDomain ?? "");
                setDeliveryTime(setting?.deliveryTime.slice(0, 5) ?? "07:00");
            })
            .catch(cause => { if (active) setError(getApiErrorMessage(cause, "브리핑 설정을 불러오지 못했습니다.")); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    async function saveSetting() {
        if (busy || !outlet || !deliveryTime) return;
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const setting = await saveNewsSetting(outlet, deliveryTime);
            setSavedSetting(setting);
            setMessage("설정을 저장했습니다. 같은 언론사와 수신 시간을 다시 선택하면 이전 채팅이 이어집니다.");
            onSaved(setting);
        } catch (cause) {
            setError(getApiErrorMessage(cause, "설정 저장에 실패했습니다."));
        } finally {
            setBusy(false);
        }
    }

    return <div className="market-theme market-grid min-w-0 bg-surface-soft">
        <header className="flex h-14 items-center border-b border-hairline bg-canvas px-6 font-bold text-ink">시황 브리핑 설정</header>
        <section className="mx-auto w-full max-w-[680px] p-5 lg:p-8">
            <h1 className="text-xl font-bold text-ink">AI 맞춤 시황 브리핑</h1>
            <p className="mt-2 text-sm text-muted">언론사와 브리핑 수신 시간을 설정하세요. 기사와 저장 기능은 채팅에서 이용할 수 있습니다.</p>
            <div className="mt-6 rounded-xl border border-hairline bg-canvas p-5">
                <p className="text-xs text-muted">현재 설정</p>
                <p role="status" className="mt-2 text-sm font-semibold text-primary">
                    {loading ? "확인 중..." : savedSetting ? `${savedSetting.outletName} · 매일 ${savedSetting.deliveryTime.slice(0, 5)} (한국시간)` : "설정 없음"}
                </p>
                <div className="mt-5 flex flex-wrap items-end gap-3">
                    <label className="text-xs text-body">언론사
                        <select value={outlet} onChange={event => setOutlet(event.target.value)} disabled={busy || loading}
                            className="mt-1 block rounded-lg border border-hairline bg-canvas p-2 text-sm">
                            <option value="">언론사 선택</option>
                            {savedSetting && !outlets.some(item => item.outletDomain === savedSetting.outletDomain) && <option value={savedSetting.outletDomain}>{savedSetting.outletName}</option>}
                            {outlets.map(item => <option key={item.outletDomain} value={item.outletDomain}>{item.outletName}</option>)}
                        </select>
                    </label>
                    <label className="text-xs text-body">받고 싶은 시간 (한국시간)
                        <input type="time" step="60" value={deliveryTime} onChange={event => setDeliveryTime(event.target.value)}
                            disabled={busy || loading} className="mt-1 block rounded-lg border border-hairline bg-canvas p-2 text-sm" />
                    </label>
                    <button type="button" onClick={() => void saveSetting()}
                        disabled={busy || loading || !outlet || !deliveryTime || (!!savedSetting && outlet === savedSetting.outletDomain && deliveryTime === savedSetting.deliveryTime.slice(0, 5))}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {busy ? "저장 중..." : "설정 저장"}
                    </button>
                </div>
                {outlet && (outlet !== savedSetting?.outletDomain || deliveryTime !== savedSetting?.deliveryTime.slice(0, 5))
                    && <p className="mt-3 text-xs text-muted">아직 저장하지 않은 설정입니다.</p>}
                <p className="mt-4 text-xs leading-5 text-muted">새 설정은 다음 브리핑부터 적용됩니다. 오늘 브리핑이 이미 만들어졌다면 변경은 내일부터 반영됩니다.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
                {message && <p role="status" className="mt-3 text-sm text-primary">{message}</p>}
            </div>
        </section>
    </div>;
}
