import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";

export default function WithFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="grid min-h-screen grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="app-content-container min-w-0 overflow-x-clip">{children}</div>
        <Sidebar />
      </main>

      <Footer />
    </>
  );
}
