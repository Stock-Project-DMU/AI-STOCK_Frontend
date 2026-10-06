import { navItems } from "../data";
import type { MyPageTab } from "../model";

type MyPageNavigationProps = {
  activeTab: MyPageTab;
  onChange: (tab: MyPageTab) => void;
  isUnlimitedCharge: boolean;
};

export default function MyPageNavigation({ activeTab, onChange, isUnlimitedCharge }: MyPageNavigationProps) {
  const items = navItems.map((item) => item.id === "recharge" && isUnlimitedCharge
    ? { ...item, label: "가상계좌 관리", description: "가상캐시 충전·차감 및 이력" }
    : item);

  return (
    <div className="my-page-navigation mb-3 overflow-x-auto rounded-xl border border-hairline bg-white p-2 shadow-[0_4px_12px_rgba(10,11,13,.04)]">
      <div className="mb-2 border-b border-hairline bg-surface-soft px-4 py-3">
        <h2 className="text-base font-bold text-ink">마이페이지</h2>
      </div>
      <nav aria-label="마이페이지 메뉴">
        <div className="my-page-navigation-items grid min-w-[760px] grid-cols-6 gap-1">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => onChange(item.id)} aria-current={activeTab === item.id ? "page" : undefined} className={`rounded-lg border-t-2 px-3 py-3 text-left transition-colors ${activeTab === item.id ? "theme-accent-soft theme-accent-text border-[var(--market-accent)]" : "border-transparent text-body hover:bg-surface-soft hover:text-ink"}`}>
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className={`mt-1 block text-[12px] ${activeTab === item.id ? "opacity-75" : "text-muted-soft"}`}>{item.description}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
