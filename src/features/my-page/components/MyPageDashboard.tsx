"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { initialProfile, investmentProfileChoices, fundProfileChoices, investmentLevelChoices } from "../data";
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
import InvestmentSurvey from "@/features/ai-financial-planner/components/InvestmentSurvey";
import { getApiErrorMessage, isAuthenticated } from "@/lib/api/client";
import { getAccountProfit, getAccounts, getOrders, getChargeRequests, getRealizedReturns, requestCharge } from "@/lib/api/portfolio";
import type { AccountInfoResponse, OrderHistoryResponse, ProfitResponse, RealizedReturnResponse } from "@/lib/api/types";
import { getMyInfo, updateProfile, getInvestmentProfile } from "@/lib/api/user";

export default function MyPageDashboard() {
  const [showSurvey, setShowSurvey] = useState(false);
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
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [chargeHistory, setChargeHistory] = useState<RechargeRecord[]>([]);
  const [requestingCharge, setRequestingCharge] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [accounts, setAccounts] = useState<AccountInfoResponse[] | null>(null);
  const [accountProfit, setAccountProfit] = useState<ProfitResponse | null>(null);
  const [apiOrders, setApiOrders] = useState<OrderHistoryResponse[] | null>(null);
  const [realizedReturns, setRealizedReturns] = useState<RealizedReturnResponse[]>([]);
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
        const [user, accountList, investment] = await Promise.all([getMyInfo(), getAccounts(), getInvestmentProfile()]);
        if (cancelled) return;

        setProfile((current) => ({
          ...current,
          userId: user.loginId,
          name: user.name,
          email: user.email,
          birthday: user.birthdate ?? "",
          investmentProfile: investment ? investmentProfileChoices[investment.investmentTendency - 1]?.value ?? "" : "",
          fundProfile: investment ? fundProfileChoices[investment.fundTendency - 1]?.value ?? "" : "",
          investmentLevel: investment ? investmentLevelChoices[["BEGINNER", "INTERMEDIATE", "EXPERT"].indexOf(investment.investmentLevel)]?.value ?? "" : "",
        }));
        setDraftProfile((current) => ({
          ...current,
          userId: user.loginId,
          name: user.name,
          email: user.email,
          birthday: user.birthdate ?? "",
        }));
        setAccounts(accountList);

        const primaryAccount = accountList[0];
        if (!primaryAccount) {
          setApiOrders([]);
          setAccountProfit(null);
          setRealizedReturns([]);
          return;
        }

        const [orderList, profit, charges, returns] = await Promise.all([
          getOrders(primaryAccount.accountId),
          getAccountProfit(primaryAccount.accountId),
          getChargeRequests(primaryAccount.accountId),
          getRealizedReturns(primaryAccount.accountId),
        ]);
        if (cancelled) return;

        setApiOrders(orderList);
        setAccountProfit(profit);
        setRealizedReturns(returns);
        setChargeHistory(charges.content.map(item => ({ id: item.requestId, date: item.requestedAt, type: "추가 충전", amount: item.amount, balance: null, status: item.status === "APPROVED" ? "승인" : item.status === "REJECTED" ? "거절" : "대기", requester: user.name, note: item.decisionReason ?? item.reason })));
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
      if (tab === "recharge") setAccountView("recharge");
    });
  };

  const clearProfileError = (field: ProfileField) => {
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  };

  const saveProfile = async () => {
    const nextErrors = validateProfile(draftProfile, profile);

    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      setProfileSaveError(Object.values(nextErrors).filter(Boolean).join(" "));
      return;
    }

    setProfileErrors({});
    setProfileSaveError("");
    setIsSavingProfile(true);

    try {
      let savedName = draftProfile.name;
      let savedEmail = draftProfile.email;

      if (!isAuthenticated()) throw new Error("로그인이 필요합니다.");
      {
        const updated = await updateProfile({
          currentPassword: verifiedPassword,
          user: { name: draftProfile.name.trim(), email: draftProfile.email.trim(), birthdate: draftProfile.birthday },
          ...(draftProfile.password ? { passwordChange: { currentPassword: verifiedPassword, newPassword: draftProfile.password } } : {}),
        });
        savedName = updated.name;
        savedEmail = updated.email;
      }

      setProfile({
        ...draftProfile,
        name: savedName,
        email: savedEmail,
        password: "",
      });
      setIsEditing(false);
      setVerifiedPassword("");
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
      setVerifiedPassword(passwordCheckValue);
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
    setAccountView("recharge");
  };

  const submitRechargeRequest = async () => {
    const account = accounts?.[0];
    if (!account || requestingCharge) return;
    setRequestingCharge(true);
    setDashboardError("");
    try {
      const item = await requestCharge(account.accountId, requestedAmount, reason.trim());
      setChargeHistory(current => [{ id: item.requestId, date: item.requestedAt, type: "추가 충전", amount: item.amount, balance: null, status: "대기", requester: profile.name, note: item.reason }, ...current]);
      setRequestComplete(true);
    } catch (error) { setDashboardError(getApiErrorMessage(error, "충전 요청에 실패했습니다.")); }
    finally { setRequestingCharge(false); }
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
          {activeTab === "profile" && showSurvey && <>
            <button type="button" onClick={() => setShowSurvey(false)} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold">내 정보로 돌아가기</button>
            <InvestmentSurvey onComplete={() => setShowSurvey(false)} onSaved={(result) => {
              const investment = {
                investmentProfile: investmentProfileChoices[result.investmentTendency - 1]?.value ?? "",
                fundProfile: fundProfileChoices[result.fundTendency - 1]?.value ?? "",
                investmentLevel: investmentLevelChoices[["BEGINNER", "INTERMEDIATE", "EXPERT"].indexOf(result.investmentLevel)]?.value ?? "",
              };
              setProfile(current => ({ ...current, ...investment }));
              setDraftProfile(current => ({ ...current, ...investment }));
            }} />
          </>}
          {activeTab === "profile" && !showSurvey && (
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
              onStartSurvey={() => requestNavigation(() => {
                setDraftProfile(profile);
                setIsEditing(false);
                setProfileErrors({});
                setProfileSaveError("");
                setVerifiedPassword("");
                setShowSurvey(true);
              })}
            />
          )}

          {activeTab === "account" && (
            <AccountPanel
              mode="info"
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
              onRequest={() => void submitRechargeRequest()}
              chargeHistory={chargeHistory}
              requestingCharge={requestingCharge}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={resetRechargeRequest}
              accounts={accounts}
              profit={accountProfit}
              realizedProfit={realizedReturns.reduce((sum, row) => sum + row.profitAmount, 0)}
              isLoading={isDashboardLoading}
              error={dashboardError}
            />
          )}

          {activeTab === "recharge" && (
            <AccountPanel
              mode="recharge"
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
              onRequest={() => void submitRechargeRequest()}
              chargeHistory={chargeHistory}
              requestingCharge={requestingCharge}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={resetRechargeRequest}
              accounts={accounts}
              profit={accountProfit}
              realizedProfit={realizedReturns.reduce((sum, row) => sum + row.profitAmount, 0)}
              isLoading={isDashboardLoading}
              error={dashboardError}
            />
          )}

          {activeTab === "orders" && <OrdersPanel selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} apiOrders={apiOrders} isLoading={isDashboardLoading} error={dashboardError} />}
          {activeTab === "returns" && <ReturnsPanel profit={accountProfit} rows={realizedReturns} />}
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
