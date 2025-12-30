import AppHeader from "@/components/app/appHeader";
import AppFooter from "@/components/app/appFooter";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      <main className="container mx-auto min-h-screen px-4 py-8">
        {children}
      </main>
      <AppFooter />
    </>
  );
}
