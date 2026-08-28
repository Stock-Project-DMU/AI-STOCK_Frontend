"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { initialProfile, orders } from "../data";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import type { AccountView, MyPageTab, ProfileErrors, ProfileField, RechargeRecord } from "../model";
import { verifyProfilePassword } from "../services/profileAuth";
import { hasProfileChanges, validateProfile } from "../validation";
import AccountPanel from "./account/AccountPanel";
import Modal from "./Modal";
import { DesktopMyPageNavigation, MobileMyPageNavigation } from "./MyPageNavigation";
import OrdersPanel from "./orders/OrdersPanel";
import ProfilePanel from "./profile/ProfilePanel";
import { PasswordCheckModal, ProfileSavedModal, UnsavedChangesModal, WithdrawalModal } from "./profile/ProfileModals";
import ReturnsPanel from "./returns/ReturnsPanel";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { getAccountProfit, getAccounts, getOrders } from "@/lib/api/portfolio";
import type { AccountInfoResponse, OrderHistoryResponse, ProfitResponse } from "@/lib/api/types";
import { getMyInfo, updateMyInfo } from "@/lib/api/user";

export default function MyPageDashboard() {
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const [accountView, setAccountView] = useState<AccountView>("summary");
  const [profile, setProfile] = useState(initialProfile);
  const [draftProfile, setDraftProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [passwordCheckValue, setPasswordCheckValue] = useState("");
  const [passwordCheckError, setPasswordCheckError] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requestComplete, setRequestComplete] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RechargeRecord | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0].id);
  const [accounts, setAccounts] = useState<AccountInfoResponse[] | null>(null);
  const [accountProfit, setAccountProfit] = useState<ProfitResponse | null>(null);
  const [apiOrders, setApiOrders] = useState<OrderHistoryResponse[] | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) return;

    let cancelled = false;

    const loadDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const [user, accountList] = await Promise.all([getMyInfo(), getAccounts()]);
        if (cancelled) return;

        setProfile((current) => ({
          ...current,
          userId: user.loginId,
          name: user.name,
          email: user.email,
        }));
        setDraftProfile((current) => ({
          ...current,
          userId: user.loginId,
          name: user.name,
          email: user.email,
        }));
        setAccounts(accountList);

        const primaryAccount = accountList[0];
        if (!primaryAccount) {
          setApiOrders([]);
          setAccountProfit(null);
          return;
        }

        const [orderList, profit] = await Promise.all([
          getOrders(primaryAccount.accountId),
          getAccountProfit(primaryAccount.accountId),
        ]);
        if (cancelled) return;

        setApiOrders(orderList);
        setAccountProfit(profit);
        if (orderList[0]) setSelectedOrderId(orderList[0].orderId);
      } catch (error) {
        if (!cancelled) setDashboardError(getApiErrorMessage(error, "마이페이지 정보를 불러오지 못했습니다."));
      } finally {
        if (!cancelled) setIsDashboardLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestedAmount = useMemo(
    () => selectedAmount ?? (Number(customAmount.replaceAll(",", "")) || 0),
    [customAmount, selectedAmount],
  );

  const hasUnsavedProfileChanges = useMemo(
    () => isEditing && hasProfileChanges(draftProfile, profile),
    [draftProfile, isEditing, profile],
  );

  const {
    isLeaveModalOpen,
    requestNavigation,
    stayOnPage,
    leavePage,
  } = useUnsavedChangesGuard(hasUnsavedProfileChanges);

  const changeTab = (tab: MyPageTab) => {
    if (tab === activeTab) return;

    requestNavigation(() => {
      if (activeTab === "profile") {
        setDraftProfile(profile);
        setProfileErrors({});
        setIsEditing(false);
      }

      setActiveTab(tab);
      if (tab === "account") setAccountView("summary");
    });
  };

  const clearProfileError = (field: ProfileField) => {
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  };

  const saveProfile = async () => {
    const nextErrors = validateProfile(draftProfile, profile);

    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      return;
    }

    setProfileErrors({});
    setProfileSaveError("");
    setIsSavingProfile(true);

    try {
      let savedName = draftProfile.name;
      let savedEmail = draftProfile.email;

      if (isAuthenticated()) {
        const updated = await updateMyInfo(draftProfile.name.trim(), draftProfile.email.trim());
        savedName = updated.name;
        savedEmail = updated.email;
      }

      setProfile({
        ...draftProfile,
        name: savedName,
        email: savedEmail,
        password: draftProfile.password || profile.password,
      });
      setIsEditing(false);
      setShowSaved(true);
    } catch (error) {
      setProfileSaveError(getApiErrorMessage(error, "회원 정보를 저장하지 못했습니다."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const closePasswordCheck = () => {
    if (isCheckingPassword) return;
    setShowPasswordCheck(false);
    setPasswordCheckValue("");
    setPasswordCheckError("");
  };

  const confirmPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordCheckValue) {
      setPasswordCheckError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsCheckingPassword(true);
    setPasswordCheckError("");

    try {
      const result = await verifyProfilePassword(passwordCheckValue);

      if (!result.ok) {
        setPasswordCheckError(
          result.reason === "invalid-password"
            ? "비밀번호가 일치하지 않습니다."
            : "비밀번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.",
        );
        return;
      }

      setDraftProfile({ ...profile, password: "" });
      setProfileErrors({});
      setIsEditing(true);
      setShowPasswordCheck(false);
      setPasswordCheckValue("");
    } catch {
      setPasswordCheckError("비밀번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsCheckingPassword(false);
    }
  };

  const resetRechargeRequest = () => {
    setSelectedAmount(null);
    setCustomAmount("");
    setReason("");
    setRequestComplete(false);
    setAccountView("summary");
  };

  const discardProfileChangesAndLeave = () => {
    setDraftProfile(profile);
    setProfileErrors({});
    setIsEditing(false);
    leavePage();
  };

  return (
    <div className="market-theme market-grid flex min-h-[calc(100vh-4rem)] break-keep text-ink">
      <DesktopMyPageNavigation activeTab={activeTab} onChange={changeTab} />

      <section className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-8">
        <MobileMyPageNavigation activeTab={activeTab} onChange={changeTab} />

        <div className="mx-auto w-full max-w-[1540px] rounded-xl border border-hairline bg-white px-4 py-5 shadow-[0_4px_12px_rgba(10,11,13,.04)] sm:px-6 lg:px-8 lg:py-6">
          {activeTab === "profile" && (
            <ProfilePanel
              profile={profile}
              draftProfile={draftProfile}
              isEditing={isEditing}
              errors={profileErrors}
              saveError={profileSaveError}
              isSaving={isSavingProfile}
              onDraftChange={setDraftProfile}
              onEdit={() => setShowPasswordCheck(true)}
              onClearError={clearProfileError}
              onCancel={() => {
                setProfileErrors({});
                setProfileSaveError("");
                setIsEditing(false);
              }}
              onSave={saveProfile}
              onRequestWithdrawal={() => setShowWithdrawal(true)}
            />
          )}

          {activeTab === "account" && (
            <AccountPanel
              view={accountView}
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              requestedAmount={requestedAmount}
              reason={reason}
              selectedHistory={selectedHistory}
              onViewChange={setAccountView}
              onSelectAmount={(amount) => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              onCustomAmount={(value) => {
                setCustomAmount(value.replace(/[^0-9]/g, ""));
                setSelectedAmount(null);
              }}
              onReasonChange={setReason}
              onRequest={() => setRequestComplete(true)}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={resetRechargeRequest}
              accounts={accounts}
              profit={accountProfit}
              isLoading={isDashboardLoading}
              error={dashboardError}
            />
          )}

          {activeTab === "orders" && <OrdersPanel selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} apiOrders={apiOrders} isLoading={isDashboardLoading} error={dashboardError} />}
          {activeTab === "returns" && <ReturnsPanel profit={accountProfit} account={accounts?.[0] ?? null} />}
        </div>
      </section>

      {showSaved && <ProfileSavedModal onClose={() => setShowSaved(false)} />}

      {showPasswordCheck && (
        <PasswordCheckModal
          value={passwordCheckValue}
          error={passwordCheckError}
          isChecking={isCheckingPassword}
          onValueChange={(value) => {
            setPasswordCheckValue(value);
            setPasswordCheckError("");
          }}
          onSubmit={confirmPassword}
          onClose={closePasswordCheck}
        />
      )}

      {requestComplete && (
        <Modal ariaLabel="충전 요청 완료" onClose={() => setRequestComplete(false)}>
          <p className="text-base font-bold">충전 요청이 완료되었습니다</p>
          <p className="mt-2 text-sm text-muted">관리자 검토 후 계좌에 반영됩니다.</p>
          <button type="button" onClick={() => { setRequestComplete(false); setAccountView("history"); }} className="mt-5 cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-bold text-white">이력 확인</button>
        </Modal>
      )}

      {showWithdrawal && <WithdrawalModal onClose={() => setShowWithdrawal(false)} />}
      {isLeaveModalOpen && (
        <UnsavedChangesModal
          onStay={stayOnPage}
          onLeave={discardProfileChangesAndLeave}
        />
      )}
    </div>
  );
}
