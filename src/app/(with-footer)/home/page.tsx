import RightSidebar from "./RightSidebar";
import StockTable from "./StockTable";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100 ">
            <section className="mx-auto w-full max-w-[1280px] px-6 py-10">
                <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
                    <StockTable />
                    <RightSidebar />
                </div>
            </section>
        </div>
    );
}