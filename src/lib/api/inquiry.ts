import { apiRequest } from "./client";

export type InquiryListItem = { inquiryId: number; title: string; status: "PENDING" | "ANSWERED"; createdAt: string };
export type InquiryDetail = InquiryListItem & { content: string; answer: string | null; answeredAt: string | null; answeredByName: string | null };

export function createInquiry(title: string, content: string) {
    return apiRequest<{ inquiryId: number }>("/api/inquiries", { method: "POST", body: JSON.stringify({ title, content }) });
}

export function getMyInquiries() {
    return apiRequest<InquiryListItem[]>("/api/inquiries");
}

export function getInquiryDetail(inquiryId: number) {
    return apiRequest<InquiryDetail>(`/api/inquiries/${inquiryId}`);
}
