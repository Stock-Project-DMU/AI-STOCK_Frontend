import type { Metadata } from "next";
import LegalDocumentPage from "@/features/legal/components/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/features/legal/documents";

export const metadata: Metadata = { title: "서비스 이용 약관 | AI STOCK" };

export default function TermsOfServicePage() {
    return <LegalDocumentPage document={LEGAL_DOCUMENTS.service} pathname="/terms-of-service" />;
}
