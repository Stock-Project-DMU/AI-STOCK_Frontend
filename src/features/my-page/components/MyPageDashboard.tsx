"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { initialProfile, investmentProfileChoices, getFundProfileName, investmentLevelChoices } from "../data";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import type { AccountView, MyPageTab, ProfileErrors, ProfileField, RechargeRecord } from "../model";
import { verifyProfilePassword } from "../services/profileAuth";
import { hasProfileChanges, validateProfile } from "../validation";
import AccountPanel from "./account/AccountPanel";
import Modal from "./Modal";
import MyPageNavigation from "./MyPageNavigation";
import OrdersPanel from "./orders/OrdersPanel";
import ProfilePanel from "./profile/ProfilePanel";
import { PasswordCheckModal, ProfileSavedModal, UnsavedChangesModal, WithdrawalModal } from "./profile/ProfileModals";
import ReturnsPanel from "./returns/ReturnsPanel";
import InvestmentSurvey from "@/features/ai-financial-planner/components/InvestmentSurvey";
import { useLivePortfolio } from "@/hooks/LivePortfolioProvider";
import { getApiErrorMessage, getAuthenticatedLoginProvider, isAuthenticated, type LoginProvider } from "@/lib/api/client";
import { needsSocialProfileCompletion } from "@/lib/api/auth-navigation";
import { chargeAccount, getAccounts, getOrders, getChargeHistory, getRealizedReturns, requestCharge, type ChargeHistoryResponse } from "@/lib/api/portfolio";
import type { AccountInfoResponse, OrderHistoryResponse, ProfitResponse, RealizedReturnResponse } from "@/lib/api/types";
import { getMyInfo, updateMyInfo, updateProfile, getInvestmentProfile } from "@/lib/api/user";

function toRechargeRecords(items: ChargeHistoryResponse[], requesterName: string): RechargeRecord[] {
  return items.map((item) => ({
    id: item.requestId,
    date: item.requestedAt,
    source: item.source,
    amount: item.amount,
    balance: item.balanceAfter,
    status: item.status === "APPROVED" ? "승인" : item.status === "REJECTED" ? "거절" : "대기",
    requester: requesterName,
    note: item.decisionReason ?? item.reason ?? "",
  }));
}

export default function MyPageDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const requestedOrderId = searchParams.get("orderId");
  const [showSurvey, setShowSurvey] = useState(false);
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const [accountView, setAccountView] = useState<AccountView>("summary");
  const [profile, setProfile] = useState(initialProfile);
  const [draftProfile, setDraftProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSocialAccount, setIsSocialAccount] = useState(false);
  const [loginProvider, setLoginProvider] = useState<LoginProvider | null>(null);
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
  const [autoChargeComplete, setAutoChargeComplete] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RechargeRecord | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState(0);
  const [chargeHistory, setChargeHistory] = useState<RechargeRecord[]>([]);
  const [requestingCharge, setRequestingCharge] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState("");
  const [accounts, setAccounts] = useState<AccountInfoResponse[] | null>(null);
  const [apiOrders, setApiOrders] = useState<OrderHistoryResponse[] | null>(null);
  const [realizedReturns, setRealizedReturns] = useState<RealizedReturnResponse[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [chargeError, setChargeError] = useState("");
  const [profileSaveError, setProfileSaveError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (requestedTab === "profile" || requestedTab === "account" || requestedTab === "recharge" || requestedTab === "orders" || requestedTab === "returns") {
        setActiveTab(requestedTab);
        if (requestedTab === "recharge") setAccountView("history");
      }
      const orderId = Number(requestedOrderId);
      if (requestedTab === "orders" && requestedOrderId && Number.isSafeInteger(orderId) && orderId > 0 && apiOrders?.some(order => order.orderId === orderId)) {
        setSelectedOrderId(orderId);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [requestedTab, requestedOrderId, apiOrders]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    let cancelled = false;

    const loadDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      try {
        const [user, accountList, investment] = await Promise.all([getMyInfo(), getAccounts(), getInvestmentProfile()]);
        if (cancelled) return;
        if (needsSocialProfileCompletion(user)) {
          router.replace("/complete-profile");
          return;
        }
        setIsSocialAccount(user.loginId === null);
        setLoginProvider(getAuthenticatedLoginProvider());

        setProfile((current) => ({
          ...current,
          userId: user.loginId ?? "",
          name: user.name,
          email: user.email ?? "",
          birthday: user.birthdate ?? "",
          investmentProfile: investment ? investmentProfileChoices[investment.investmentTendency - 1]?.value ?? "" : "",
          fundProfile: investment ? getFundProfileName(investment.fundTendency) : "",
          investmentLevel: investment ? investmentLevelChoices[["BEGINNER", "INTERMEDIATE", "EXPERT"].indexOf(investment.investmentLevel)]?.value ?? "" : "",
        }));
        setDraftProfile((current) => ({
          ...current,
          userId: user.loginId ?? "",
          name: user.name,
          email: user.email ?? "",
          birthday: user.birthdate ?? "",
        }));
        if (!investment && new URLSearchParams(window.location.search).get("survey") === "1") setShowSurvey(true);
        setAccounts(accountList);

        const primaryAccount = accountList[0];
        if (!primaryAccount) {
          setApiOrders([]);
          setRealizedReturns([]);
          return;
        }

        const [orderLists, charges, returns] = await Promise.all([
          Promise.all(accountList.map(item => getOrders(item.accountId))),
          getChargeHistory(primaryAccount.accountId),
          getRealizedReturns(primaryAccount.accountId),
        ]);
        if (cancelled) return;

        const orderList = orderLists.flat().sort((left, right) => new Date(right.orderedAt).getTime() - new Date(left.orderedAt).getTime());

        setApiOrders(orderList);
        setRealizedReturns(returns);
        setChargeHistory(toRechargeRecords(charges, user.name));
        const targetOrderId = Number(requestedOrderId);
        if (orderList[0]) setSelectedOrderId(orderList.find(item => item.orderId === targetOrderId)?.orderId ?? orderList[0].orderId);
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
  }, [router, requestedTab, requestedOrderId]);

  const live = useLivePortfolio();
  const liveProfit: ProfitResponse | null = live.account
    ? { totalAsset: live.totalAsset, profitAmount: live.accountProfitAmount, profitRate: live.accountProfitRate }
    : null;

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
      setChargeError("");
      if (requestedTab || requestedOrderId) router.replace("/my-page", { scroll: false });
      if (tab === "account") setAccountView("summary");
      if (tab === "recharge") setAccountView("recharge");
    });
  };

  const clearProfileError = (field: ProfileField) => {
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
  };

  const saveProfile = async () => {
    const nextErrors = validateProfile(draftProfile, profile);
    if (isSocialAccount && draftProfile.name.trim() === "회원") nextErrors.name = "사용할 이름을 입력해 주세요.";

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
      const updated = isSocialAccount
        ? await updateMyInfo(draftProfile.name.trim(), draftProfile.email.trim(), draftProfile.birthday)
        : await updateProfile({
            currentPassword: verifiedPassword,
            user: { name: draftProfile.name.trim(), email: draftProfile.email.trim(), birthdate: draftProfile.birthday },
            ...(draftProfile.password ? { passwordChange: { currentPassword: verifiedPassword, newPassword: draftProfile.password } } : {}),
          });
      savedName = updated.name;
      savedEmail = updated.email ?? draftProfile.email;

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
    setChargeError("");
    setAccountView("recharge");
  };

  const changeAccountView = (view: AccountView) => {
    setChargeError("");
    setAccountView(view);
  };

  const submitRechargeRequest = async () => {
    const account = accounts?.[0];
    if (!account || requestingCharge) return;
    setRequestingCharge(true);
    setChargeError("");
    try {
      await requestCharge(account.accountId, requestedAmount, reason.trim());
      const history = await getChargeHistory(account.accountId);
      setChargeHistory(toRechargeRecords(history, profile.name));
      setRequestComplete(true);
    } catch (error) { setChargeError(getApiErrorMessage(error, "충전 요청에 실패했습니다.")); }
    finally { setRequestingCharge(false); }
  };

  const submitAutoCharge = async () => {
    const account = accounts?.[0];
    if (!account || requestingCharge) return;
    setRequestingCharge(true);
    setChargeError("");
    try {
      const updated = await chargeAccount(account.accountId, requestedAmount);
      setAccounts(current => current?.map(item => item.accountId === updated.accountId ? updated : item) ?? current);
      live.refresh();
      const history = await getChargeHistory(account.accountId);
      setChargeHistory(toRechargeRecords(history, profile.name));
      setSelectedAmount(null);
      setCustomAmount("");
      setAutoChargeComplete(true);
    } catch (error) { setChargeError(getApiErrorMessage(error, "충전에 실패했습니다.")); }
    finally { setRequestingCharge(false); }
  };

  const discardProfileChangesAndLeave = () => {
    setDraftProfile(profile);
    setProfileErrors({});
    setIsEditing(false);
    leavePage();
  };

  return (
    <div className="market-theme market-grid min-h-[calc(100vh-4rem)] break-keep text-ink">
      <section className="min-w-0 px-3 py-4 sm:px-5 lg:px-8">
        <div className="my-page-layout mx-auto w-full max-w-[1540px]">
          <MyPageNavigation activeTab={activeTab} onChange={changeTab} />

        <div className="min-w-0 rounded-xl border border-hairline bg-white px-4 py-5 shadow-[0_4px_12px_rgba(10,11,13,.04)] sm:px-6 lg:px-8 lg:py-6">
          {activeTab === "profile" && showSurvey && <>
            <button type="button" onClick={() => { setShowSurvey(false); router.replace("/my-page"); }} className="rounded-lg border border-hairline px-4 py-2 text-sm font-bold">내 정보로 돌아가기</button>
            <InvestmentSurvey onComplete={() => { setShowSurvey(false); router.replace("/my-page"); }} onSaved={(result) => {
              const investment = {
                investmentProfile: investmentProfileChoices[result.investmentTendency - 1]?.value ?? "",
                fundProfile: getFundProfileName(result.fundTendency),
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
              isSocialAccount={isSocialAccount}
              loginProvider={loginProvider}
              errors={profileErrors}
              saveError={profileSaveError}
              isSaving={isSavingProfile}
              onDraftChange={setDraftProfile}
              onEdit={() => {
                if (isSocialAccount) {
                  setDraftProfile({ ...profile, password: "" });
                  setProfileErrors({});
                  setIsEditing(true);
                } else {
                  setShowPasswordCheck(true);
                }
              }}
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
              onViewChange={changeAccountView}
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
              onAutoCharge={() => void submitAutoCharge()}
              chargeHistory={chargeHistory}
              requestingCharge={requestingCharge}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={resetRechargeRequest}
              accounts={accounts}
              profit={liveProfit}
              realizedProfit={realizedReturns.reduce((sum, row) => sum + row.profitAmount, 0)}
              isLoading={isDashboardLoading || live.isLoading}
              error={dashboardError}
              chargeError={chargeError}
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
              onViewChange={changeAccountView}
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
              onAutoCharge={() => void submitAutoCharge()}
              chargeHistory={chargeHistory}
              requestingCharge={requestingCharge}
              onSelectHistory={(record) => {
                setSelectedHistory(record);
                setAccountView("detail");
              }}
              onResetRequest={resetRechargeRequest}
              accounts={accounts}
              profit={liveProfit}
              realizedProfit={realizedReturns.reduce((sum, row) => sum + row.profitAmount, 0)}
              isLoading={isDashboardLoading || live.isLoading}
              error={dashboardError}
              chargeError={chargeError}
            />
          )}

          {activeTab === "orders" && <OrdersPanel selectedOrderId={selectedOrderId} onSelect={setSelectedOrderId} apiOrders={apiOrders} isLoading={isDashboardLoading} error={dashboardError} />}
          {activeTab === "returns" && <ReturnsPanel live={live} rows={realizedReturns} />}
        </div>
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

      {autoChargeComplete && (
        <Modal ariaLabel="충전 완료" onClose={() => setAutoChargeComplete(false)}>
          <p className="text-base font-bold">충전이 완료되었습니다</p>
          <p className="mt-2 text-sm text-muted">계좌 잔액에 바로 반영되었습니다.</p>
          <button type="button" onClick={() => { setAutoChargeComplete(false); setAccountView("history"); }} className="mt-5 cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-bold text-white">이력 확인</button>
        </Modal>
      )}

      {showWithdrawal && <WithdrawalModal isSocialAccount={isSocialAccount} accountEmail={profile.email} onClose={() => setShowWithdrawal(false)} />}
      {isLeaveModalOpen && (
        <UnsavedChangesModal
          onStay={stayOnPage}
          onLeave={discardProfileChangesAndLeave}
        />
      )}
    </div>
  );
}
