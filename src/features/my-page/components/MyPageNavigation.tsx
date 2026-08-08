import { navItems } from "../data";
import type { MyPageTab } from "../model";

type MyPageNavigationProps = {
  activeTab: MyPageTab;
  onChange: (tab: MyPageTab) => void;
};

export function DesktopMyPageNavigation({ activeTab, onChange }: MyPageNavigationProps) {
  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-hairline bg-white lg:flex lg:flex-col">
        <div className="theme-accent-bg m-3 rounded-lg px-4 py-3">
          <strong className="block text-sm">마이페이지</strong>
          <span className="mt-1 block text-xs opacity-75">투자 계정 관리 센터</span>
        </div>
        <p className="px-5 pb-2 text-xs text-muted-soft">계정 메뉴</p>
        <nav aria-label="마이페이지 메뉴" className="flex flex-col">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`cursor-pointer border-l-2 px-5 py-2.5 text-left transition-colors ${activeTab === item.id ? "theme-accent-soft theme-accent-text border-[var(--market-accent)]" : "border-transparent text-body hover:bg-surface-soft hover:text-ink"}`}>
              <strong className="block text-sm font-semibold">{item.label}</strong>
              <span className={`mt-1 block text-[11px] ${activeTab === item.id ? "opacity-75" : "text-muted-soft"}`}>{item.description}</span>
            </button>
          ))}
        </nav>
    </aside>
  );
}

export function MobileMyPageNavigation({ activeTab, onChange }: MyPageNavigationProps) {
  return (
    <div className="mb-3 flex gap-1 overflow-x-auto rounded-lg border border-hairline bg-white p-1 lg:hidden">
      {navItems.map((item) => (
        <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`shrink-0 cursor-pointer rounded-md px-3 py-2 text-sm font-bold transition-colors ${activeTab === item.id ? "theme-accent-bg" : "text-muted hover:bg-surface-soft hover:text-ink"}`}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
