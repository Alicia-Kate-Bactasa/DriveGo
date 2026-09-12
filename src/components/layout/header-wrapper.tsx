import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function PageShell({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <>
      {!hideHeader && <Header />}
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}