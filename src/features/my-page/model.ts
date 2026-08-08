export type MyPageTab = "profile" | "account" | "orders" | "returns";
export type AccountView = "summary" | "recharge" | "reason" | "history" | "detail";
export type RechargeStatus = "승인" | "거절";

export type RechargeRecord = {
  id: number;
  date: string;
  type: string;
  amount: number;
  balance: number;
  status: RechargeStatus;
  requester: string;
  note: string;
};

export type Profile = {
  userId: string;
  password: string;
  name: string;
  birthday: string;
  email: string;
  investmentProfile: string;
  fundProfile: string;
  investmentLevel: string;
};

export type ProfileField = keyof Profile;
export type ProfileErrors = Partial<Record<ProfileField, string>>;

export type ProfileChoiceTone = "emerald" | "teal" | "blue" | "amber" | "orange";

export type ProfileChoice = {
  value: string;
  description: string;
  tone: ProfileChoiceTone;
};

export type Order = {
  id: number;
  name: string;
  side: string;
  quantity: string;
  price: string;
};
