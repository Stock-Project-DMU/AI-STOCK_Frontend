import { navItems } from "../data";
import type { MyPageTab } from "../model";

type MyPageNavigationProps = {
  activeTab: MyPageTab;
  onChange: (tab: MyPageTab) => void;
};

export default function MyPageNavigation({ activeTab, onChange }: MyPageNavigationProps) {
  return (
    <nav aria-label="마이페이지 메뉴" className="mb-3 overflow-x-auto rounded-xl border border-hairline bg-white p-2 shadow-[0_4px_12px_rgba(10,11,13,.04)]">
      <div className="px-3 pb-2 pt-1"><strong className="text-sm text-ink">마이페이지</strong><span className="ml-3 text-xs text-muted-soft">투자 계정 관리 센터</span></div>
      <div className="grid min-w-[650px] grid-cols-5 gap-1">
        {navItems.map((item) => (
          <button key={item.id} type="button" onClick={() => onChange(item.id)} aria-current={activeTab === item.id ? "page" : undefined} className={`rounded-lg border-t-2 px-3 py-3 text-left transition-colors ${activeTab === item.id ? "theme-accent-soft theme-accent-text border-[var(--market-accent)]" : "border-transparent text-body hover:bg-surface-soft hover:text-ink"}`}>
            <strong className="block text-sm font-semibold">{item.label}</strong>
            <span className={`mt-1 block text-[12px] ${activeTab === item.id ? "opacity-75" : "text-muted-soft"}`}>{item.description}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
