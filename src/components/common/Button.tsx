"use client";

import { useState } from "react";

export function FavoriteButton() {
    const [isFavorite, setIsFavorite] = useState(false);

    return (
        <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xl transition-colors ${
                isFavorite 
                ? "text-red-400"
                :" hover:text-red-300"
            }`}
            aria-label="관심 종목 등록"
        >
            {isFavorite ? "♥" : "♡"}
        </button>
    );
}