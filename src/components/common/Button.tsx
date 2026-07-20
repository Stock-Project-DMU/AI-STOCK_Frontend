"use client";

import { useState } from "react";

type FavoriteButtonProps = {
    defaultFavorite?: boolean;
    size?: "md" | "sm" | "xl";
};

export function FavoriteButton({
    defaultFavorite = false,
    size = "md",
}: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(defaultFavorite);

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
            onClick={() => setIsFavorite((prev) => !prev)}
            className={`mx-auto flex cursor-pointer items-center justify-center rounded-full leading-none transition-colors ${sizeClass} ${
                isFavorite
                    ? "text-red-400"
                    : "text-gray-500 hover:text-red-300"
            }`}
            aria-label="관심 종목 등록"
            aria-pressed={isFavorite}
        >
            <span className={`block ${iconOffsetClass}`}>
                {isFavorite ? "♥" : "♡"}
            </span>
        </button>
    );
}