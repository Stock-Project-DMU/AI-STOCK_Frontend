import type { Metadata } from "next";
import LegalDocumentPage from "@/features/legal/components/LegalDocumentPage";
import { LEGAL_DOCUMENTS } from "@/features/legal/documents";

export const metadata: Metadata = { title: "이용자 권리 및 유의사항 | AI STOCK" };

export default function UserRightsPage() {
    return <LegalDocumentPage document={LEGAL_DOCUMENTS.rights} pathname="/user-rights" />;
}
