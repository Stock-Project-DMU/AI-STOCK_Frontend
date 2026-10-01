import type { Metadata } from "next";
import LegalDocumentPage from "@/features/legal/components/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/features/legal/documents";

export const metadata: Metadata = { title: "개인정보 처리 방침 | AI STOCK" };

export default function PrivacyPolicyPage() {
    return <LegalDocumentPage document={LEGAL_DOCUMENTS.privacy} pathname="/privacy-policy" />;
}
