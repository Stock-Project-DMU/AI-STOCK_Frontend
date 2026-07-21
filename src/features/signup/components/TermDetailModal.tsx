import type { TermDetail } from "@/features/signup/constants/terms";

type TermDetailModalProps = {
    term: TermDetail;
    onClose: () => void;
};

export default function TermDetailModal({
    term,
    onClose,
}: TermDetailModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            role="presentation"
            onClick={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="term-modal-title"
                className="max-h-[80vh] w-full max-w-[520px] overflow-hidden rounded-lg bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold text-red-500">
                            {term.isRequired ? "필수 동의" : "선택 동의"}
                        </p>
                        <h2
                            id="term-modal-title"
                            className="mt-1 text-lg font-semibold text-gray-900"
                        >
                            {term.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="약관 닫기"
                        className="rounded px-2 text-2xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[52vh] overflow-y-auto px-5 py-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                        {term.content}
                    </p>
                </div>

                <div className="border-t border-gray-200 px-5 py-4">
                    <button
                        type="button"
                        className="w-full rounded bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </section>
        </div>
    );
}
