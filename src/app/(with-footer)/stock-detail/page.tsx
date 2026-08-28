import StockDetailPage from "@/features/stock-detail/components/StockDetailPage";

type StockDetailRouteProps = {
    searchParams: Promise<{ code?: string | string[] }>;
};

export default async function StockDetailRoute({ searchParams }: StockDetailRouteProps) {
    const rawCode = (await searchParams).code;
    const requestedCode = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    const stockCode = requestedCode && /^\d{6}$/.test(requestedCode) ? requestedCode : "005930";

    return <StockDetailPage stockCode={stockCode} />;
}
