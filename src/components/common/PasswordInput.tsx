"use client";

import { useState, type InputHTMLAttributes } from "react";

export default function PasswordInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input {...rest} type={visible ? "text" : "password"} className={`${className} pr-11`} />
            <button
                type="button"
                aria-label={visible ? "숨기기" : "보기"}
                onClick={() => setVisible(value => !value)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
                {visible ? (
                    <svg aria-hidden="true" className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7-0.4 1.1-1.2 2.5-2.3 3.8M6.1 6.9C4.5 8.1 3.3 9.6 2 12c1 2.5 5 7 10 7 1.1 0 2.2-0.2 3.2-0.6" />
                    </svg>
                ) : (
                    <svg aria-hidden="true" className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}
