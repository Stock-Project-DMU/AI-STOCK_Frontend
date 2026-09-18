import { redirect } from "next/navigation";

// 예전 샘플 기사 URL은 실제 뉴스 검색 화면으로 안내합니다.
export default function LegacyNewsPage() {
    redirect("/news-report");
}
