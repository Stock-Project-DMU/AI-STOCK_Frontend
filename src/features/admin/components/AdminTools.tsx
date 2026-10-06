"use client";
import { useEffect, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api/client";
import { checkLoginId } from "@/lib/api/auth";
import AdminPager from "./AdminPager";
import { DataTable, StatusBadge, CharCount, SortHeader, type SortState } from "./AdminApp";
import PasswordInput from "@/components/common/PasswordInput";
import { formatDateTime } from "@/lib/format/dateTime";

type Page<T> = { content: T[]; totalPages: number; totalElements: number };
type ToolUser = { userId: number; loginId: string; name: string; email: string | null; status: "ACTIVE" | "SUSPENDED" };
type Tab = "broadcast" | "notices" | "create-admin";

const fields: [string, string][] = [["ALL", "전체"], ["USER_ID", "회원번호"], ["LOGIN_ID", "아이디"], ["NAME", "이름"], ["EMAIL", "이메일"]];
const loginIdPattern = /^[A-Za-z0-9_]{4,50}$/;

export default function AdminTools() {
    const [tab, setTab] = useState<Tab>("broadcast");
    return <div className="space-y-4">
        <div className="flex gap-2">
            <button onClick={() => setTab("broadcast")} className={tab === "broadcast" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>전체 알림 발송</button>
            <button onClick={() => setTab("notices")} className={tab === "notices" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>알림 관리</button>
            <button onClick={() => setTab("create-admin")} className={tab === "create-admin" ? "admin-button-primary rounded px-3 py-1.5" : "rounded border border-hairline px-3 py-1.5"}>관리자 계정 생성</button>
        </div>
        {tab === "broadcast" ? <BroadcastPanel /> : tab === "notices" ? <NoticeManagementPanel /> : <CreateAdminPanel />}
    </div>;
}

function BroadcastPanel() {
    const [users, setUsers] = useState<ToolUser[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [field, setField] = useState("ALL");
    const [matchType, setMatchType] = useState<"CONTAINS" | "EXACT">("CONTAINS");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [allMode, setAllMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [popup, setPopup] = useState(false);
    const [popupEndDate, setPopupEndDate] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [sendResult, setSendResult] = useState("");

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true); setLoadError("");
            try {
                const params = new URLSearchParams({ page: String(page), size: "10" });
                if (search) { params.set("query", search); params.set("field", field); params.set("matchType", matchType); }
                if (status) params.set("status", status);
                const result = await apiRequest<Page<ToolUser>>(`/api/admin/users?${params}`);
                if (active) { setUsers(result.content); setTotalPages(result.totalPages); }
            } catch (error) { if (active) setLoadError(getApiErrorMessage(error, "회원 목록을 불러오지 못했습니다.")); }
            finally { if (active) setLoading(false); }
        }
        void load();
        return () => { active = false; };
    }, [page, search, field, matchType, status]);

    const isChecked = (id: number) => allMode ? !excludedIds.has(id) : selectedIds.has(id);
    const toggleRow = (id: number) => {
        if (allMode) setExcludedIds(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
        else setSelectedIds(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    };
    const selectAllPages = () => { setAllMode(true); setExcludedIds(new Set()); setSelectedIds(new Set()); };
    const selectCurrentPage = () => { setAllMode(false); setSelectedIds(current => { const next = new Set(current); users.forEach(user => next.add(user.userId)); return next; }); };
    const deselectAll = () => { setAllMode(false); setSelectedIds(new Set()); setExcludedIds(new Set()); };

    async function send() {
        if (sending) return;
        if (!title.trim() || !content.trim()) { setSendError("제목과 내용을 입력해 주세요."); return; }
        if (!allMode && selectedIds.size === 0) { setSendError("알림을 보낼 회원을 한 명 이상 선택해 주세요."); return; }
        if (popup && !popupEndDate) { setSendError("팝업으로 보낼 경우 팝업 종료일을 입력해 주세요."); return; }
        setSending(true); setSendError(""); setSendResult("");
        try {
            const body = allMode
                ? { targetType: "ALL", userIds: [], excludedUserIds: [...excludedIds], query: search || null, field: search ? field : null, matchType: search ? matchType : null, status: status || null, title, content, type: "SYSTEM", popup, popupEndDate: popup ? popupEndDate : null }
                : { targetType: "SELECTED", userIds: [...selectedIds], excludedUserIds: [], query: null, field: null, matchType: null, status: null, title, content, type: "SYSTEM", popup, popupEndDate: popup ? popupEndDate : null };
            const result = await apiRequest<{ targetCount: number; sentCount: number }>("/api/admin/notifications/send", { method: "POST", body: JSON.stringify(body) });
            setSendResult(`${result.sentCount}명에게 발송했습니다.`);
            setTitle(""); setContent(""); setPopup(false); setPopupEndDate(""); deselectAll();
        } catch (error) { setSendError(getApiErrorMessage(error, "알림 발송에 실패했습니다.")); }
        finally { setSending(false); }
    }

    return <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-hairline bg-white p-4">
            <form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(0); }} className="flex flex-wrap gap-2">
                <select aria-label="검색 항목" value={field} onChange={event => { setField(event.target.value); setPage(0); }} className="rounded border border-hairline p-2">{fields.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                <select aria-label="일치 방식" value={matchType} onChange={event => { setMatchType(event.target.value as "CONTAINS" | "EXACT"); setPage(0); }} className="rounded border border-hairline p-2"><option value="CONTAINS">포함</option><option value="EXACT">일치</option></select>
                <input aria-label="검색" placeholder="회원번호·아이디·이름·이메일 검색" value={query} onChange={event => setQuery(event.target.value)} className="min-w-[200px] flex-1 rounded border border-hairline p-2" />
                <select aria-label="상태 필터" value={status} onChange={event => { setStatus(event.target.value); setPage(0); }} className="rounded border border-hairline p-2"><option value="">전체 상태</option><option value="ACTIVE">활성</option><option value="SUSPENDED">정지</option></select>
                <button className="admin-button-primary rounded px-4 py-2">검색</button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={selectAllPages} className="rounded border border-hairline px-3 py-1.5 text-sm">전체 선택(모든 페이지)</button>
                <button type="button" onClick={selectCurrentPage} className="rounded border border-hairline px-3 py-1.5 text-sm">현 페이지 선택</button>
                <button type="button" onClick={deselectAll} className="rounded border border-hairline px-3 py-1.5 text-sm">전체 해제</button>
                <span className="text-sm text-muted">{allMode ? `현재 검색 조건 전체 선택됨 (제외 ${excludedIds.size}명)` : `${selectedIds.size}명 선택됨`}</span>
            </div>
            {loadError && <p role="alert" className="mt-3 text-red-500">{loadError}</p>}
            {loading ? <p role="status" className="mt-3">불러오는 중...</p> : <div className="mt-3">
                <DataTable headings={["선택", "회원번호", "아이디", "이름", "이메일", "상태"]}>
                    {users.map(user => <tr key={user.userId}><td><input type="checkbox" checked={isChecked(user.userId)} onChange={() => toggleRow(user.userId)} /></td><td>{user.userId}</td><td>{user.loginId}</td><td>{user.name}</td><td>{user.email ?? "—"}</td><td><StatusBadge value={user.status} /></td></tr>)}
                </DataTable>
                {!users.length && <p className="mt-2 text-sm text-muted">검색 결과가 없습니다.</p>}
            </div>}
            <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
        </section>
        <aside className="rounded-lg border border-hairline bg-white p-4">
            <h3 className="font-bold">알림 내용</h3>
            <label className="mt-3 block text-sm font-semibold">제목</label>
            <input value={title} onChange={event => setTitle(event.target.value.slice(0, 100))} maxLength={100} placeholder="제목" className="mt-1 w-full rounded border border-hairline p-2" />
            <CharCount value={title} max={100} />
            <label className="mt-3 block text-sm font-semibold">내용</label>
            <textarea value={content} onChange={event => setContent(event.target.value.slice(0, 500))} maxLength={500} placeholder="내용" className="mt-1 h-32 w-full rounded border border-hairline p-2" />
            <CharCount value={content} max={500} />
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={popup} onChange={event => setPopup(event.target.checked)} />팝업으로도 띄우기</label>
            {popup && <div className="mt-2"><label className="block text-xs text-muted">팝업 종료일</label><input type="date" value={popupEndDate} onChange={event => setPopupEndDate(event.target.value)} className="mt-1 w-full rounded border border-hairline p-2 text-sm" /></div>}
            {sendError && <p role="alert" className="mt-3 text-sm text-red-500">{sendError}</p>}
            {sendResult && <p className="mt-3 text-sm text-green-600">{sendResult}</p>}
            <button type="button" disabled={sending} onClick={() => void send()} className="admin-button-primary mt-4 w-full rounded px-4 py-2 disabled:opacity-50">{sending ? "발송 중..." : "발송"}</button>
        </aside>
    </div>;
}

type NoticeListItem = { noticeId: number; type: string; title: string; targetType: "SINGLE" | "ALL" | "SEARCH" | "SELECTED"; targetCount: number; sentCount: number; popup: boolean; popupEndDate: string | null; popupActive: boolean; createdByLoginId: string; createdAt: string };
type NoticeDetail = NoticeListItem & { content: string; recipientCount: number; readCount: number };

const noticeFields: [string, string][] = [["ALL", "전체"], ["NOTICE_ID", "공지번호"], ["TITLE", "제목"], ["ADMIN_LOGIN_ID", "작성자"]];
const targetTypeLabel: Record<string, string> = { SINGLE: "개별", ALL: "전체", SEARCH: "검색결과", SELECTED: "선택회원" };

function NoticeManagementPanel() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [listKey, setListKey] = useState(0);
    return selectedId == null ? <NoticeList key={listKey} onOpen={setSelectedId} /> : <NoticeDetailView noticeId={selectedId} onBack={() => { setSelectedId(null); setListKey(value => value + 1); }} />;
}

function NoticeList({ onOpen }: { onOpen: (noticeId: number) => void }) {
    const [items, setItems] = useState<NoticeListItem[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [field, setField] = useState("ALL");
    const [matchType, setMatchType] = useState<"CONTAINS" | "EXACT">("CONTAINS");
    const [popupFilter, setPopupFilter] = useState("");
    const [sortBy, setSortBy] = useState("LATEST");
    const [sort, setSort] = useState<SortState>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true); setError("");
            try {
                const params = new URLSearchParams({ page: String(page), size: "10", sortBy });
                if (sort) { params.set("sortColumn", sort.column); params.set("direction", sort.direction); }
                if (search) { params.set("query", search); params.set("field", field); params.set("matchType", matchType); }
                if (popupFilter) params.set("popup", popupFilter);
                const result = await apiRequest<Page<NoticeListItem>>(`/api/admin/notices?${params}`);
                if (active) { setItems(result.content); setTotalPages(result.totalPages); }
            } catch (cause) { if (active) setError(getApiErrorMessage(cause, "공지 목록을 불러오지 못했습니다.")); }
            finally { if (active) setLoading(false); }
        }
        void load();
        return () => { active = false; };
    }, [page, search, field, matchType, popupFilter, sortBy, sort]);

    const handleSort = (column: string) => { setSort(current => !current || current.column !== column ? { column, direction: "DESC" } : current.direction === "DESC" ? { column, direction: "ASC" } : null); setPage(0); };

    return <div className="space-y-3">
        <form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); setPage(0); }} className="flex flex-wrap gap-2">
            <select aria-label="검색 항목" value={field} onChange={event => { setField(event.target.value); setPage(0); }} className="rounded border border-hairline p-2">{noticeFields.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <select aria-label="일치 방식" value={matchType} onChange={event => { setMatchType(event.target.value as "CONTAINS" | "EXACT"); setPage(0); }} className="rounded border border-hairline p-2"><option value="CONTAINS">포함</option><option value="EXACT">일치</option></select>
            <input aria-label="검색" placeholder="공지번호·제목·작성자 검색" value={query} onChange={event => setQuery(event.target.value)} className="min-w-[200px] flex-1 rounded border border-hairline p-2" />
            <select aria-label="팝업 필터" value={popupFilter} onChange={event => { setPopupFilter(event.target.value); setPage(0); }} className="rounded border border-hairline p-2"><option value="">전체</option><option value="true">팝업만</option><option value="false">일반만</option></select>
            <select aria-label="정렬" value={sortBy} onChange={event => { setSortBy(event.target.value); setPage(0); }} className="rounded border border-hairline p-2"><option value="LATEST">최신순</option><option value="OLDEST">오래된순</option></select>
            <button className="admin-button-primary rounded px-4 py-2">검색</button>
        </form>
        {error && <p role="alert" className="text-red-500">{error}</p>}
        {loading ? <p role="status">불러오는 중...</p> : <>
            <DataTable headings={[
                <SortHeader key="NOTICE_ID" label="공지번호" column="NOTICE_ID" sort={sort} onSort={handleSort} />,
                <SortHeader key="TITLE" label="제목" column="TITLE" sort={sort} onSort={handleSort} />,
                <SortHeader key="TYPE" label="유형" column="TYPE" sort={sort} onSort={handleSort} />,
                <SortHeader key="TARGET_TYPE" label="대상" column="TARGET_TYPE" sort={sort} onSort={handleSort} />,
                <SortHeader key="SENT_COUNT" label="발송수" column="SENT_COUNT" sort={sort} onSort={handleSort} />,
                "팝업",
                <SortHeader key="POPUP_END_DATE" label="팝업 종료일" column="POPUP_END_DATE" sort={sort} onSort={handleSort} />,
                <SortHeader key="CREATED_BY" label="작성자" column="CREATED_BY" sort={sort} onSort={handleSort} />,
                <SortHeader key="CREATED_AT" label="작성일" column="CREATED_AT" sort={sort} onSort={handleSort} />,
                "관리",
            ]}>
                {items.map(item => <tr key={item.noticeId}>
                    <td>{item.noticeId}</td>
                    <td>{item.title}</td>
                    <td>{item.type}</td>
                    <td>{targetTypeLabel[item.targetType] ?? item.targetType} ({item.targetCount})</td>
                    <td>{item.sentCount}</td>
                    <td>{item.popup ? <span className={`ao-badge ${item.popupActive ? "green" : "gray"}`}>{item.popupActive ? "노출중" : "종료"}</span> : "—"}</td>
                    <td>{item.popupEndDate ?? "—"}</td>
                    <td>{item.createdByLoginId}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td><button onClick={() => onOpen(item.noticeId)} className="text-primary">상세</button></td>
                </tr>)}
            </DataTable>
            {!items.length && <p className="text-sm text-muted">공지가 없습니다.</p>}
            <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
        </>}
    </div>;
}

function NoticeDetailView({ noticeId, onBack }: { noticeId: number; onBack: () => void }) {
    const [item, setItem] = useState<NoticeDetail | null>(null);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const [popupEndDate, setPopupEndDate] = useState("");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    useEffect(() => {
        let active = true;
        apiRequest<NoticeDetail>(`/api/admin/notices/${noticeId}`).then(result => { if (active) { setItem(result); setPopupEndDate(result.popupEndDate ?? ""); } }).catch(cause => { if (active) setError(getApiErrorMessage(cause, "공지 상세를 불러오지 못했습니다.")); });
        return () => { active = false; };
    }, [noticeId, revision]);

    async function updatePopupEndDate() {
        if (busy || !popupEndDate) return;
        setBusy(true); setActionError("");
        try { await apiRequest(`/api/admin/notices/${noticeId}/popup`, { method: "PATCH", body: JSON.stringify({ popupEndDate }) }); setRevision(value => value + 1); }
        catch (cause) { setActionError(getApiErrorMessage(cause, "팝업 기한 변경에 실패했습니다.")); }
        finally { setBusy(false); }
    }

    async function endPopupNow() {
        if (busy) return;
        setBusy(true); setActionError("");
        try { await apiRequest(`/api/admin/notices/${noticeId}/popup-end`, { method: "PATCH" }); setRevision(value => value + 1); }
        catch (cause) { setActionError(getApiErrorMessage(cause, "팝업 종료에 실패했습니다.")); }
        finally { setBusy(false); }
    }

    async function deleteNotice() {
        if (busy) return;
        setBusy(true); setActionError("");
        try { await apiRequest(`/api/admin/notices/${noticeId}`, { method: "DELETE" }); onBack(); }
        catch (cause) { setActionError(getApiErrorMessage(cause, "공지 삭제에 실패했습니다.")); setBusy(false); }
    }

    return <div className="space-y-4">
        <button onClick={onBack} className="text-primary">← 목록으로</button>
        {error && <p role="alert" className="text-red-500">{error}</p>}
        {!item && !error && <p>불러오는 중...</p>}
        {item && <section className="rounded-lg border border-hairline bg-white p-5">
            <h2 className="text-lg font-bold">{item.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{item.content}</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <div><dt className="text-muted">유형</dt><dd>{item.type}</dd></div>
                <div><dt className="text-muted">대상</dt><dd>{targetTypeLabel[item.targetType] ?? item.targetType} ({item.targetCount}명)</dd></div>
                <div><dt className="text-muted">발송 수</dt><dd>{item.sentCount}명</dd></div>
                <div><dt className="text-muted">받은 사람</dt><dd>{item.recipientCount}명</dd></div>
                <div><dt className="text-muted">읽은 사람</dt><dd>{item.readCount}명</dd></div>
                <div><dt className="text-muted">작성자</dt><dd>{item.createdByLoginId}</dd></div>
                <div><dt className="text-muted">작성일</dt><dd>{formatDateTime(item.createdAt)}</dd></div>
                <div><dt className="text-muted">팝업 상태</dt><dd>{item.popup ? (item.popupActive ? "노출중" : "종료됨") : "일반 공지"}</dd></div>
            </dl>

            {actionError && <p role="alert" className="mt-3 text-red-500">{actionError}</p>}

            {item.popup && <>
                <h3 className="mt-5 font-bold">팝업 기한 변경</h3>
                <div className="mt-2 flex items-center gap-2">
                    <input type="date" value={popupEndDate} onChange={event => setPopupEndDate(event.target.value)} className="rounded border border-hairline p-2 text-sm" />
                    <button disabled={busy || !popupEndDate} onClick={() => void updatePopupEndDate()} className="rounded border border-hairline px-3 py-2 text-sm disabled:opacity-50">기한 변경</button>
                    {item.popupActive && <button disabled={busy} onClick={() => void endPopupNow()} className="rounded border border-red-500 px-3 py-2 text-sm text-red-500 disabled:opacity-50">팝업 즉시 종료</button>}
                </div>
            </>}

            <h3 className="mt-5 font-bold">공지 삭제</h3>
            <p className="mt-1 text-sm text-muted">삭제하면 받은 회원들의 알림함에서도 함께 삭제됩니다.</p>
            {!confirmingDelete ? (
                <button disabled={busy} onClick={() => setConfirmingDelete(true)} className="mt-2 rounded border border-red-500 px-3 py-2 text-sm text-red-500 disabled:opacity-50">공지 삭제</button>
            ) : (
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-red-500">정말 삭제할까요? 받은 사람 알림함에서도 지워집니다.</span>
                    <button disabled={busy} onClick={() => setConfirmingDelete(false)} className="rounded border border-hairline px-3 py-2 text-sm disabled:opacity-50">취소</button>
                    <button disabled={busy} onClick={() => void deleteNotice()} className="rounded bg-red-500 px-3 py-2 text-sm text-white disabled:opacity-50">{busy ? "삭제 중..." : "삭제 확인"}</button>
                </div>
            )}
        </section>}
    </div>;
}

function CreateAdminPanel() {
    const [loginId, setLoginId] = useState("");
    const [checkedLoginId, setCheckedLoginId] = useState("");
    const [checking, setChecking] = useState(false);
    const [loginIdError, setLoginIdError] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function checkDuplicate() {
        const value = loginId.trim();
        if (!value || !loginIdPattern.test(value)) return;
        setChecking(true); setLoginIdError(""); setCheckedLoginId("");
        try {
            const result = await checkLoginId(value);
            if (result.available) setCheckedLoginId(value);
            else setLoginIdError("이미 사용 중인 아이디입니다.");
        } catch (error) { setLoginIdError(getApiErrorMessage(error, "중복 확인에 실패했습니다.")); }
        finally { setChecking(false); }
    }

    const loginIdValid = loginIdPattern.test(loginId.trim());
    const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password) && new TextEncoder().encode(password).length <= 72;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const canSubmit = loginIdValid && checkedLoginId === loginId.trim() && passwordValid && name.trim().length > 0 && emailValid;

    async function create() {
        if (busy || !canSubmit) return;
        setBusy(true); setError(""); setSuccess("");
        try {
            const created = await apiRequest<{ userId: number; loginId: string; name: string; email: string; role: string; status: string; createdAt: string }>("/api/admin/admins", { method: "POST", body: JSON.stringify({ loginId: loginId.trim(), password, name: name.trim(), email: email.trim() }) });
            setSuccess(`관리자 계정이 생성되었습니다. (${created.loginId})`);
            setLoginId(""); setCheckedLoginId(""); setPassword(""); setName(""); setEmail("");
        } catch (error) { setError(getApiErrorMessage(error, "관리자 계정 생성에 실패했습니다.")); }
        finally { setBusy(false); }
    }

    return <section className="max-w-md rounded-lg border border-hairline bg-white p-5">
        <h3 className="font-bold">관리자 계정 생성</h3>

        <label className="mt-4 block text-sm font-semibold">아이디</label>
        <div className="mt-1 flex gap-2">
            <input value={loginId} onChange={event => { setLoginId(event.target.value.slice(0, 50)); setCheckedLoginId(""); setLoginIdError(""); }} maxLength={50} className="flex-1 rounded border border-hairline p-2" />
            <button type="button" disabled={checking || !loginIdValid} onClick={() => void checkDuplicate()} className="rounded border border-hairline px-3 py-2 text-sm disabled:opacity-50">{checking ? "확인 중..." : "중복확인"}</button>
        </div>
        {loginIdError ? <p className="mt-1 text-xs text-red-500">{loginIdError}</p>
            : checkedLoginId && checkedLoginId === loginId.trim() ? <p className="mt-1 text-xs text-green-600">사용 가능한 아이디입니다.</p>
            : <p className="mt-1 text-xs text-muted">영문, 숫자, 밑줄 4~50자</p>}

        <label className="mt-4 block text-sm font-semibold">비밀번호</label>
        <PasswordInput value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded border border-hairline p-2" />
        <p className="mt-1 text-xs text-muted">8자 이상, 영문+숫자 포함 (72바이트 이하)</p>

        <label className="mt-4 block text-sm font-semibold">이름</label>
        <input value={name} onChange={event => setName(event.target.value.slice(0, 50))} maxLength={50} className="mt-1 w-full rounded border border-hairline p-2" />

        <label className="mt-4 block text-sm font-semibold">이메일</label>
        <input type="email" value={email} onChange={event => setEmail(event.target.value.slice(0, 100))} maxLength={100} className="mt-1 w-full rounded border border-hairline p-2" />

        {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-3 text-sm text-green-600">{success}</p>}
        <button type="button" disabled={busy || !canSubmit} onClick={() => void create()} className="admin-button-primary mt-4 rounded px-4 py-2 disabled:opacity-50">{busy ? "생성 중..." : "관리자 계정 생성"}</button>
    </section>;
}
