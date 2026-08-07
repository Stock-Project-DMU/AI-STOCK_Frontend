"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/icons/Icon";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
};

export default function Modal({ children, onClose, ariaLabel }: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={ariaLabel} className="relative w-full max-w-md rounded-xl border border-hairline bg-white p-6 text-center shadow-2xl sm:p-7" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="모달 닫기" onClick={onClose} className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-soft hover:text-ink">
          <CloseIcon className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
