"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "ai-stock-theme";
const THEME_EVENT = "ai-stock-theme-change";

function subscribe(onStoreChange: () => void) {
    window.addEventListener(THEME_EVENT, onStoreChange);
    window.addEventListener("storage", onStoreChange);

    return () => {
        window.removeEventListener(THEME_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
    };
}

function getThemeSnapshot(): Theme {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): Theme {
    return "dark";
}

export default function ThemeToggle() {
    const theme = useSyncExternalStore(
        subscribe,
        getThemeSnapshot,
        getServerThemeSnapshot,
    );

    const toggleTheme = () => {
        const nextTheme: Theme = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        document.documentElement.style.colorScheme = nextTheme;
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        window.dispatchEvent(new Event(THEME_EVENT));
    };

    const isLight = theme === "light";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isLight}
            aria-label="라이트·다크 모드 전환"
            title="라이트·다크 모드 전환"
            onClick={toggleTheme}
            className="theme-toggle relative flex h-9 w-[62px] shrink-0 items-center rounded-full border p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--market-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--market-bg)]"
        >
            <span className="theme-toggle-thumb theme-accent-bg theme-accent-shadow flex h-7 w-7 items-center justify-center rounded-full text-[13px] transition-transform duration-200" aria-hidden="true">
                <span className="theme-toggle-sun">☀</span>
                <span className="theme-toggle-moon">☾</span>
            </span>
        </button>
    );
}
