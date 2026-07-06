import Footer from "@/components/layout/Footer";

export default function WithFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );
}