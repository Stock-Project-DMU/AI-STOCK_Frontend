import { Button } from "@/components/common/Button";
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
            role="presentation"
            onClick={onClose}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="term-modal-title"
                className="max-h-[80vh] w-full max-w-[520px] overflow-hidden rounded-xl border border-hairline bg-canvas shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 border-b border-hairline-soft px-6 py-5">
                    <div>
                        <p
                            className={`text-xs font-semibold ${
                                term.isRequired
                                    ? "text-red-500"
                                    : "text-muted"
                            }`}
                        >
                            {term.isRequired ? "필수 동의" : "선택 동의"}
                        </p>
                        <h2
                            id="term-modal-title"
                            className="mt-1 text-lg font-semibold text-ink"
                        >
                            {term.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="약관 닫기"
                        className="shrink-0 rounded-md px-2 text-2xl leading-none text-muted hover:bg-surface-strong hover:text-ink"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
                    <p className="text-sm leading-6 whitespace-pre-line text-body">
                        {term.content}
                    </p>
                </div>

                <div className="border-t border-hairline-soft px-6 py-5">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={onClose}
                    >
                        닫기
                    </Button>
                </div>
            </section>
        </div>
    );
}
