import type { Metadata } from "next";
import LegalDocumentPage from "@/features/legal/components/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/features/legal/documents";

export const metadata: Metadata = { title: "투자 유의사항 | AI STOCK" };

export default function InvestmentNoticePage() {
    return <LegalDocumentPage document={LEGAL_DOCUMENTS.investment} pathname="/investment-notice" />;
}
