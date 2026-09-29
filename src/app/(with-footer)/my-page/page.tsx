import MyPageDashboard from "@/features/my-page/components/MyPageDashboard";
import { Suspense } from "react";

export default function MyPage() {
  return <Suspense fallback={null}><MyPageDashboard /></Suspense>;
}
