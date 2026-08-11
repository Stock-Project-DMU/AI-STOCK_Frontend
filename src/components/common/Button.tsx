"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary:
        "bg-primary text-white hover:bg-primary-active disabled:bg-primary-disabled",
    secondary:
        "bg-surface-strong text-ink hover:bg-hairline-soft disabled:opacity-50",
    outline:
        "border border-hairline bg-transparent text-ink hover:border-primary hover:text-primary disabled:opacity-50",
    text: "bg-transparent text-primary hover:text-primary-active disabled:opacity-50 !px-0 !h-auto",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: "h-9 px-4 text-sm rounded-pill",
    md: "h-11 px-5 text-sm rounded-pill",
    lg: "h-14 px-8 text-base rounded-pill",
};

/**
 * Shared pill-button primitive per DESIGN-coinbase.md's button tokens
 * (button-primary / button-secondary-light / button-outline / button-tertiary-text).
 */
export function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    disabled,
    className = "",
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

type FavoriteButtonProps = {
    defaultFavorite?: boolean;
    favorite?: boolean;
    size?: "md" | "sm" | "xl";
    disabled?: boolean;
    onToggle?: (nextFavorite: boolean) => void;
};

export function FavoriteButton({
    defaultFavorite = false,
    favorite,
    size = "md",
    disabled = false,
    onToggle,
}: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(defaultFavorite);
    const selected = favorite ?? isFavorite;

    const sizeClass =
        size === "sm"
            ? "h-5 w-5 text-sm"
            : size === "xl"
              ? "h-10 w-10 text-2xl"
              : "h-8 w-8 text-xl";

    const iconOffsetClass = size === "xl" ? "-translate-y-px" : "";

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => {
                const nextFavorite = !selected;
                if (favorite === undefined) setIsFavorite(nextFavorite);
                onToggle?.(nextFavorite);
            }}
            className={`mx-auto flex cursor-pointer items-center justify-center rounded-full leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${
                selected
                    ? "text-red-400"
                    : "text-gray-500 hover:text-red-300"
            }`}
            aria-label={selected ? "관심 종목 해제" : "관심 종목 등록"}
            aria-pressed={selected}
        >
            <span className={`block ${iconOffsetClass}`}>
                {selected ? "♥" : "♡"}
            </span>
        </button>
    );
}
