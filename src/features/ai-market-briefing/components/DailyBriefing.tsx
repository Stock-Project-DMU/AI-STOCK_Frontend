"use client";
import { useEffect, useState } from "react";
import { getBriefingHistory, getNewsOutlets, getNewsSetting, saveNewsSetting, getPlanningPreferences, savePlanningPreferences, type NewsBriefing, type NewsOutlet } from "@/lib/api/ai";
import { getApiErrorMessage } from "@/lib/api/client";
import MarketDashboard from "./MarketDashboard";
export default function DailyBriefing() {
    const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
    const [selected, setSelected] = useState<NewsBriefing | null>(null);
    const [outlets, setOutlets] = useState<NewsOutlet[]>([]);
    const [outlet, setOutlet] = useState("");
    const [savedOutlet, setSavedOutlet] = useState<NewsOutlet | null>(null);
    const [settingLoading, setSettingLoading] = useState(true);
    const [settingError, setSettingError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let active = true;
        getBriefingHistory().then(items => {
            if (active) { setBriefings(items); setSelected(items[0] ?? null); }
        }).catch(error => { if (active) setMessage(getApiErrorMessage(error, "브리핑 조회에 실패했습니다.")); });
        getNewsOutlets().then(items => { if (active) setOutlets(items); })
            .catch(error => { if (active) setMessage(getApiErrorMessage(error, "언론사 목록을 불러오지 못했습니다.")); });
        getNewsSetting().then(setting => {
            if (active) { setSavedOutlet(setting); setOutlet(setting?.outletDomain ?? ""); }
        }).catch(error => { if (active) setSettingError(getApiErrorMessage(error, "저장된 언론사를 불러오지 못했습니다.")); })
            .finally(() => { if (active) setSettingLoading(false); });
        return () => { active = false; };
    }, []);
    async function saveSetting() {
        if (busy || !outlet) return;
        setBusy(true);
        try {
            const setting = await saveNewsSetting(outlet);
            setSavedOutlet(setting); setSettingError("");
            setMessage(`${setting.outletName}를 저장했습니다. 다음 정기 브리핑부터 반영됩니다.`);
        }
        catch (error) { setMessage(getApiErrorMessage(error, "설정 저장에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    async function bookmark() {
        if (!selected || busy) return;
        setBusy(true);
        try {
            const preferences = await getPlanningPreferences();
            await savePlanningPreferences({ ...preferences, savedBriefingDates: [...new Set([...preferences.savedBriefingDates, selected.briefingDate])] });
            setMessage("브리핑을 저장했습니다. AI 재무설계사의 데이터 연동 설정에서 선택할 수 있습니다.");
        } catch (error) { setMessage(getApiErrorMessage(error, "저장에 실패했습니다.")); }
        finally { setBusy(false); }
    }
    return <div className="market-theme market-grid flex min-h-[calc(100vh-72px)] min-w-0">
        <aside className="cq-medium-show hidden w-[240px] shrink-0 border-r border-hairline bg-canvas p-4">
            <h2 className="mb-4 font-bold">브리핑 기록</h2>
            {briefings.map(item => <button key={item.briefingDate} onClick={() => setSelected(item)} className="mb-2 block w-full rounded p-3 text-left text-sm hover:bg-surface-soft">{item.briefingDate}<br />{item.outletName}</button>)}
        </aside>
        <section className="min-w-0 flex-1 p-5">
            <h1 className="text-xl font-bold">AI 맞춤 시황 브리핑</h1>
            <div className="my-5 rounded-xl border border-hairline bg-canvas p-4">
                <p className="text-xs text-muted">현재 저장된 브리핑 언론사</p>
                <p role="status" className="mt-2"><strong className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">{settingLoading ? "확인 중..." : settingError ? "설정 확인 실패" : savedOutlet?.outletName ?? "선택한 언론사 없음"}</strong></p>
                {settingError && <p role="alert" className="mt-2 text-sm text-red-500">{settingError}</p>}
                <div className="mt-4 flex flex-wrap gap-2"><select aria-label="브리핑 언론사 변경" disabled={busy || settingLoading} value={outlet} onChange={event => setOutlet(event.target.value)} className="rounded-lg border border-hairline bg-canvas p-2"><option value="">언론사 선택</option>{savedOutlet && !outlets.some(item => item.outletDomain === savedOutlet.outletDomain) && <option value={savedOutlet.outletDomain}>{savedOutlet.outletName}</option>}{outlets.map(item => <option key={item.outletDomain} value={item.outletDomain}>{item.outletName}</option>)}</select><button disabled={busy || settingLoading || !outlet || outlet === savedOutlet?.outletDomain} onClick={() => void saveSetting()} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">{busy ? "처리 중..." : "설정 저장"}</button></div>
                {outlet && outlet !== savedOutlet?.outletDomain && <p className="mt-2 text-xs text-muted">아직 저장하지 않은 선택입니다. 설정 저장을 눌러 적용해 주세요.</p>}
            </div>
            {message && <p role="status" className="my-4 text-sm">{message}</p>}
            {selected ? <article className="rounded-lg border border-hairline bg-canvas p-5">
                <div className="flex justify-between gap-3"><h2 className="font-bold">{selected.briefingDate} · {selected.outletName}</h2><button disabled={busy} onClick={() => void bookmark()} className="text-primary">저장</button></div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7">{selected.content}</p>
                <h3 className="mt-6 font-bold">근거 기사</h3>
                {selected.sources.map((source, index) => /^https?:\/\//.test(source.link) && <a key={index} href={source.link} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-primary underline">{source.title} · {source.outlet}</a>)}
            </article> : <p className="rounded-lg border border-hairline bg-canvas p-6 text-sm text-muted">아직 생성된 브리핑이 없습니다. 언론사를 선택하면 정기 생성된 브리핑을 이곳에서 확인할 수 있습니다.</p>}
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">{briefings.map(item => <button key={item.briefingDate} onClick={() => setSelected(item)} className="rounded border p-2 text-xs">{item.briefingDate}</button>)}</div>
        </section>
        <MarketDashboard />
    </div>;
}
